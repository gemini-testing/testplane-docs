const assert = require("node:assert/strict");

it("setViewport: change page dimensions", async ({ browser }) => {
    await browser.url("/");
    const original = await browser.execute(() => ({
        width: innerWidth,
        height: innerHeight,
        devicePixelRatio,
    }));
    try {
        await browser.setViewport({ width: 800, height: 600, devicePixelRatio: 1 });
        assert.deepEqual(await browser.execute(() => [innerWidth, innerHeight]), [800, 600]);
    } finally {
        await browser.setViewport(original);
    }
});
