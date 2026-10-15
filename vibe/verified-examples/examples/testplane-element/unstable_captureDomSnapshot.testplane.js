const assert = require("node:assert/strict");

it("element.unstable_captureDomSnapshot: capture only this element", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML =
            '<section id="panel"><button data-test="save">Save</button></section><p>Outside</p>';
    });
    const result = await browser.$("#panel").unstable_captureDomSnapshot({ truncateText: false });
    assert.match(result.snapshot, /section#panel/);
    assert.match(result.snapshot, /button\[data-test=save\] "Save"/);
    assert.doesNotMatch(result.snapshot, /Outside/);
    assert.equal(result.textWasTruncated, false);
});
