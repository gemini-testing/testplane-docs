const assert = require("node:assert/strict");

it("mock.waitForResponse: wait for a new recorded response", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        await browser.execute(async () => (await fetch("/api/items")).text());
        await mock.waitForResponse({ timeout: 3000 });
        mock.clear();
        assert.equal(mock.calls.length, 0);
        await browser.execute(() => {
            window.requestFinished = false;
            fetch("/api/items", { cache: "no-store" })
                .then(response => response.text())
                .then(() => {
                    window.requestFinished = true;
                });
        });
        assert.equal(await mock.waitForResponse({ timeout: 3000, interval: 50 }), true);
        assert.equal(mock.calls.length, 1);
        await browser.waitUntil(() => browser.execute(() => window.requestFinished));
    } finally {
        await mock.restore();
    }
});
