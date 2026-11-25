const assert = require("node:assert/strict");
const fs = require("node:fs/promises");

const pages = {
    drag: `<style>
        #someElem, #someTarget { position:absolute; width:40px; height:40px }
        #someTarget { left:80px; top:40px; background:silver }
        #someElem { left:8px; top:8px; background:green; touch-action:none; user-select:none }
    </style>
    <div id="someTarget"></div><div id="someElem"></div>
    <script>
        const tile = document.querySelector("#someElem");
        let dx, dy;
        tile.onpointerdown = event => {
            dx = event.clientX - tile.offsetLeft;
            dy = event.clientY - tile.offsetTop;
            tile.setPointerCapture(event.pointerId);
        };
        tile.onpointermove = event => {
            if (!tile.hasPointerCapture(event.pointerId)) return;
            tile.style.left = (event.clientX - dx) + "px";
            tile.style.top = (event.clientY - dy) + "px";
        };
    </script>`,
    notification: `<form><button class="send">Send</button></form><p class="message">Draft</p>
        <script>
            document.querySelector("form").onsubmit = event => {
                event.preventDefault();
                const note = document.createElement("p");
                note.className = "notification";
                note.textContent = "Data transmitted successfully!";
                document.querySelector(".message").replaceWith(note);
            };
        </script>`,
    screenshot: '<div id="badge" style="width:80px;height:40px;background:green">Badge</div>',
    scroll: '<div style="height:150vh"></div><button id="myElement">Details</button><div style="height:150vh"></div>',
};

async function setup(browser, variant) {
    if (variant === "calculator") return browser.url("/fixtures/browser/calculator.html");
    if (variant === "document") return browser.url("/");

    if (variant === "visual") {
        await browser.url("/fixtures/browser/swatch.html");
        const { solidReference } = require("./solid-image.cjs");
        await solidReference(browser, "plain", { width: 40, height: 40, color: "#008000" });
        await solidReference(browser, "clicked", { width: 40, height: 40, color: "#0000ff" });
        return;
    }

    const markup = pages[variant];
    assert.ok(markup, `No HTML for element fixture: ${variant}`);
    await require("./document.cjs").loadHtml(browser, markup);
    if (variant === "screenshot") await fs.mkdir("artifacts", { recursive: true });
}

async function afterHtml(browser, variant) {
    if (variant === "click-offset" || variant === "click-right") {
        await browser.execute(() => {
            const button = document.querySelector("#myButton");
            window.pressEvents = [];
            button.addEventListener("pointerdown", event => {
                const box = button.getBoundingClientRect();
                window.pressEvents.push([
                    event.button,
                    event.clientX - Math.floor(box.left + box.width / 2),
                    event.clientY - Math.floor(box.top + box.height / 2),
                ]);
            });
            button.addEventListener("contextmenu", event => event.preventDefault());
        });
    }
}

async function verify(browser, variant) {
    if (variant === "click-offset" || variant === "click-right") {
        const events = await browser.execute(() => window.pressEvents);
        assert.deepEqual(
            events,
            variant === "click-offset"
                ? [[0, 30, 0]]
                : [
                      [2, 0, 0],
                      [2, 30, 40],
                      [2, 30, 40],
                  ],
        );
    }
    if (variant === "scroll") {
        const offset = await browser.execute(() => {
            const box = document.querySelector("#myElement").getBoundingClientRect();
            return box.top + box.height / 2 - innerHeight / 2;
        });
        assert.ok(
            Math.abs(offset) <= 1,
            `Element should be vertically centered, offset: ${offset}`,
        );
    }
    if (variant === "screenshot") {
        const image = await fs.readFile(`artifacts/badge-${browser.sessionId}.png`);
        assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
        assert.equal(image.readUInt32BE(16), 80);
        assert.equal(image.readUInt32BE(20), 40);
    }
}

module.exports = {
    setup,
    verify,
    afterHtml,
    htmlVariants: ["html", "table", "links", "click-right", "click-offset"],
};
