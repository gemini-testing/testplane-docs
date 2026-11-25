const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { solidReference } = require("./solid-image.cjs");

const originalBaseUrls = new WeakMap();
const pages = {
    clipboard: '<input id="username" aria-label="Username"><input id="copy" aria-label="Copy">',
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
        let size = { width: 40, height: 40 };
        if (variant === "visual-viewport") {
            size = await browser.execute(() => ({ width: innerWidth, height: innerHeight }));
        }
        // Testplane masks ignored elements with black, even though the demo link is yellow.
        const rects =
            variant === "visual-options"
                ? [{ x: 0, y: 0, width: 8, height: 8, color: "black" }]
                : [];
        await solidReference(browser, "plain", { ...size, color: "#008000", rects });
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
        await browser.saveState({ path: "./artifacts/stateDump.json" });
        await browser.clearSession();
        return;
    }

    if (variant === "ready") {
        await solidReference(browser, "plain", { width: 20, height: 20, color: "#008000" });
        return;
    }

    if (variant === "base-url") {
        const config = await browser.getConfig();
        originalBaseUrls.set(config, config.baseUrl);
        config.baseUrl = new URL("/site/", config.baseUrl).href;
        return;
    }

    if (variant === "png" || variant === "pdf") {
        // Remove any old output so a missing write cannot pass the assertion in verify.
        await fs.rm(`artifacts/screenshot.${variant}`, { force: true });
        await fs.mkdir("artifacts", { recursive: true });
        return;
    }
    if (variant !== "page") throw new Error(`Unknown browser fixture: ${variant}`);
}

async function verify(browser, variant) {
    if (variant === "ready") {
        const resources = await browser.execute(() => ({
            headerWidth: document.querySelector(".logo").naturalWidth,
            metrics: document.body.dataset.metrics,
        }));
        assert.deepEqual(resources, { headerWidth: 16, metrics: "failed" });
    }
    if (variant === "base-url") {
        const config = await browser.getConfig();
        config.baseUrl = originalBaseUrls.get(config);
        originalBaseUrls.delete(config);
    }
    if (variant === "png" || variant === "pdf") {
        const file = await fs.readFile(`artifacts/screenshot.${variant}`);
        if (variant === "pdf") assert.equal(file.subarray(0, 5).toString(), "%PDF-");
        else assert.equal(file.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    }
}

module.exports = { setup, verify, htmlVariants: ["menu", "wait-text"] };
