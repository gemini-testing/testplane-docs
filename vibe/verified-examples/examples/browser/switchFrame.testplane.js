const assert = require("node:assert/strict");

it("switchFrame: enter an iframe and return", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML =
            '<h1>Main page</h1><iframe id="frame" srcdoc="<p>Frame content</p>"></iframe>';
    });
    try {
        await browser.switchFrame(browser.$("#frame"));
        assert.equal(await browser.$("p").getText(), "Frame content");
    } finally {
        await browser.switchFrame(null);
    }
    assert.equal(await browser.$("h1").getText(), "Main page");
});
