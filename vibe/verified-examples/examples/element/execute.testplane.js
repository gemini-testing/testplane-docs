const assert = require("node:assert/strict");

it("element.execute: pass the DOM element to a browser function", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = '<div id="counter" data-count="4"></div>';
    });
    const result = await browser.$("#counter").execute(async (element, increment) => {
        const count = Number(element.dataset.count) + increment;
        element.dataset.count = String(count);
        return { count, id: element.id };
    }, 3);
    assert.deepEqual(result, { count: 7, id: "counter" });
    assert.equal(await browser.$("#counter").getAttribute("data-count"), "7");
});
