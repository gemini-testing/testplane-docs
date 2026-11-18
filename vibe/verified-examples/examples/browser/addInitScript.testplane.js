const assert = require("node:assert/strict");

it("addInitScript: set a value before page scripts", async ({ browser }) => {
    const script = await browser.addInitScript(value => {
        window.exampleSeed = value;
    }, 42);

    try {
        await browser.url("/");
        assert.equal(await browser.execute(() => window.exampleSeed), 42);
    } finally {
        await script.remove();
    }

    await browser.url("/");
    assert.equal(await browser.execute(() => typeof window.exampleSeed), "undefined");
});
