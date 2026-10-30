const assert = require("node:assert/strict");

it("commands: use the browser fixture", async ({ browser }) => {
    await browser.url("/");
    assert.equal(await browser.$("h1").getText(), "Command examples");
});

it("commands: use this.browser with a regular function", async function () {
    await this.browser.url("/");
    assert.equal(await this.browser.$("h1").getText(), "Command examples");
});
