const fs = require("node:fs/promises");
const { solidReference } = require("./solid-image.cjs");

const pages = {
    input: '<input id="username" aria-label="Username">',
    scroll: '<main style="height:3000px">Scroll the page</main>',
    pointer: `<button id="source">Drag me</button>
        <button id="target">Drop here</button>
        <output></output>
        <script>
            let dragging = false;
            source.onpointerdown = () => { dragging = true; };
            target.onpointerup = () => {
                if (dragging) document.querySelector("output").textContent = "Dropped";
            };
            document.onpointerup = () => { dragging = false; };
        </script>`,
    pinch: `<style>body { margin: 0; height: 100vh; touch-action: none; }</style>
        <output>Idle</output><script>
            const fingers = new Map();
            let startDistance;
            const distance = () => Math.abs([...fingers.values()][0] - [...fingers.values()][1]);
            document.addEventListener("pointerdown", event => {
                if (event.pointerType !== "touch") return;
                fingers.set(event.pointerId, event.clientX);
                if (fingers.size === 2) startDistance = distance();
            });
            document.addEventListener("pointermove", event => {
                if (!fingers.has(event.pointerId)) return;
                fingers.set(event.pointerId, event.clientX);
                if (fingers.size === 2 && distance() > startDistance)
                    document.querySelector("output").textContent = "Spread";
            });
            document.addEventListener("pointerup", event => fingers.delete(event.pointerId));
        </script>`,
};

async function loadHtml(browser, html) {
    await browser.execute(source => {
        document.open();
        document.write(source);
        document.close();
    }, html);
}

async function setup(browser, variant, html) {
    await browser.url("/");
    if (html || pages[variant]) return loadHtml(browser, html || pages[variant]);

    if (variant.startsWith("visual-")) {
        await browser.url("/fixtures/browser/swatch.html");
        let size = { width: 40, height: 40 };
        if (variant === "visual-viewport") {
            await browser.execute(() => document.body.classList.add("fullscreen"));
            size = await browser.execute(() => ({ width: innerWidth, height: innerHeight }));
        }
        await solidReference(browser, "plain", { ...size, color: "#008000" });
        if (variant !== "visual-options")
            await solidReference(browser, "clicked", { ...size, color: "#0000ff" });
        return;
    }

    if (variant === "mock") {
        // The WebdriverIO worker caches its subscription across fresh BiDi sessions.
        await browser.sessionSubscribe({
            events: ["network.beforeRequestSent", "network.responseStarted"],
        });
        return;
    }

    if (variant === "saved-state") {
        await browser.setCookies([
            { name: "theme", value: "dark" },
            { name: "temporary", value: "1" },
        ]);
        await browser.saveState({ path: `./artifacts/demo-${browser.sessionId}.json` });
        await browser.clearSession();
        return;
    }

    if (variant === "file") {
        await fs.mkdir("artifacts", { recursive: true });
        return;
    }
    if (variant !== "page") throw new Error(`Unknown browser fixture: ${variant}`);
}

module.exports = { setup, htmlVariants: ["menu", "wait-text"] };
