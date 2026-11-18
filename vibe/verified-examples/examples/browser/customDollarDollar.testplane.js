const assert = require("node:assert/strict");

it("custom$$: find several elements", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = "<ul><li>First</li><li>Second</li></ul>";
    });
    browser.addLocatorStrategy("byCss", selector =>
        Array.from(document.querySelectorAll(selector)),
    );
    const items = await browser.custom$$("byCss", "li");
    assert.equal(items.length, 2);
    assert.equal(await items[1].getText(), "Second");
});
