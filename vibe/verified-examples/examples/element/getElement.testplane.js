const assert = require("node:assert/strict");

it("getElement: inspect a resolved element object", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = '<button id="save">Save</button>';
    });
    const element = await browser.$("#save").getElement();
    assert.equal(element.selector, "#save");
    assert.equal(typeof element.elementId, "string");
    assert.equal(await element.getText(), "Save");
});
