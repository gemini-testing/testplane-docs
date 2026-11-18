const assert = require("node:assert/strict");

it("throttleCPU: run a page with a slower CPU", async ({ browser }) => {
    await browser.url("/");
    try {
        await browser.throttleCPU(2);
        await browser.execute(() => {
            document.body.innerHTML = "<button>Ready</button>";
        });
        assert.equal(await browser.$("button").getText(), "Ready");
    } finally {
        await browser.throttleCPU(1);
    }
});
