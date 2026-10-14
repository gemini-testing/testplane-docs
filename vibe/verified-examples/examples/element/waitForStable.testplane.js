const assert = require("node:assert/strict");

it("waitForStable: wait for a size animation to stop", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = '<div id="box" style="width:40px;height:40px">Box</div>';
    });
    const box = await browser.$("#box");
    await box.execute(node => {
        node.animate([{ width: "40px" }, { width: "140px" }], { duration: 500, fill: "forwards" });
    });
    const result = await box.waitForStable({ timeout: 3000, interval: 50 });
    assert.equal(result, undefined);
    assert.equal(await box.execute(node => node.getBoundingClientRect().width), 140);
});
