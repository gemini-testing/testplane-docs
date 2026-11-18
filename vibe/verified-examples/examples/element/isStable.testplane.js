const assert = require("node:assert/strict");

it("isStable: check whether element geometry changes", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML = '<div id="box" style="width:40px;height:40px">Box</div>';
    });
    const box = await browser.$("#box");
    await box.waitForExist();
    assert.equal(await box.isStable(), true);
    await box.execute(node => {
        node.animate([{ transform: "translateX(0)" }, { transform: "translateX(200px)" }], {
            duration: 500,
            iterations: Infinity,
            direction: "alternate",
        });
    });
    try {
        assert.equal(await box.isStable(), false);
    } finally {
        await box.execute(node => node.getAnimations().forEach(animation => animation.cancel()));
    }
    assert.equal(await box.isStable(), true);
});
