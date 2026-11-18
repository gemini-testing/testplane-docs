const assert = require("node:assert/strict");

it("addLocatorStrategy: find by data attribute", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = '<button data-test="save">Save</button>';
    });
    browser.addLocatorStrategy("byTest", value => document.querySelector(`[data-test="${value}"]`));
    const button = await browser.custom$("byTest", "save");
    assert.equal(await button.getText(), "Save");
});
