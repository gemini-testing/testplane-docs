const assert = require("node:assert/strict");

it("url: navigate with BiDi options and read the current URL", async ({ browser }) => {
    await browser.url("/");
    const target = new URL("/navigation", await browser.getUrl()).href;
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    await browser.url(target, {
        wait: "complete",
        headers: { "x-example": "navigation" },
        onBeforeLoad: () => {
            window.navigationSeed = 42;
        },
    });
    assert.equal(await browser.url(), target);
    assert.deepEqual(await browser.execute(() => [window.initialSeed, window.receivedHeader]), [
        42,
        "navigation",
    ]);
    await browser.execute(() => {
        window.unsavedValue = "temporary";
    });
    await browser.url(target);
    assert.equal(await browser.execute(() => typeof window.unsavedValue), "undefined");
    assert.equal(await browser.execute(() => window.initialSeed), null);
});
