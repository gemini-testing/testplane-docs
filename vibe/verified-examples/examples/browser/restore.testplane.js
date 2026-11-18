const assert = require("node:assert/strict");

it("restore: remove a user-agent override", async ({ browser }) => {
    await browser.url("/");
    const original = await browser.execute(() => navigator.userAgent);
    await browser.emulate("userAgent", "ExampleBrowser/1.0");
    try {
        await browser.url("/");
        assert.equal(await browser.execute(() => navigator.userAgent), "ExampleBrowser/1.0");
    } finally {
        await browser.restore("userAgent");
    }
    await browser.url("/");
    assert.equal(await browser.execute(() => navigator.userAgent), original);
});
