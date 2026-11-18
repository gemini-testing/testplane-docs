const assert = require("node:assert/strict");

it("element.executeAsync: return data through the final callback", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = '<p id="message">Ready</p>';
    });
    const element = await browser.$("#message");
    await element.waitForExist();
    await browser.setTimeout({ script: 5000 });
    const result = await element.executeAsync((node, prefix, done) => {
        setTimeout(() => done(prefix + node.textContent), 20);
    }, "Status: ");
    assert.equal(result, "Status: Ready");
});
