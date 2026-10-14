const assert = require("node:assert/strict");

it("element.custom$$: find children with a custom strategy", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML =
            '<p data-test="item">Outside</p><section id="panel"><p data-test="item">First</p><p data-test="item">Second</p></section>';
    });
    browser.addLocatorStrategy("byTestWithin", (value, root) =>
        Array.from(root.querySelectorAll(`[data-test="${value}"]`)),
    );
    const items = await browser.$("#panel").custom$$("byTestWithin", "item");
    assert.equal(items.length, 2);
    assert.equal(await items[1].getText(), "Second");
});
