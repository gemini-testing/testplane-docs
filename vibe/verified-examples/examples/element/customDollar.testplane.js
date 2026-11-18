const assert = require("node:assert/strict");

it("element.custom$: search inside an element", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML =
            '<button data-test="save">Outside</button><section id="panel"><button data-test="save">Inside</button></section>';
    });
    browser.addLocatorStrategy("byTestWithin", (value, root) =>
        root.querySelector(`[data-test="${value}"]`),
    );
    const button = await browser.$("#panel").custom$("byTestWithin", "save");
    assert.equal(await button.getText(), "Inside");
});
