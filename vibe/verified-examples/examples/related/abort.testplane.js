const assert = require("node:assert/strict");

it("mock.abort: block matching BiDi requests", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.abort();
        for (let i = 0; i < 2; i++) {
            const failed = await browser.execute(async () => {
                try {
                    await fetch("/api/items", { cache: "no-store" });
                    return false;
                } catch {
                    return true;
                }
            });
            assert.equal(failed, true);
        }
    } finally {
        await mock.restore();
    }
});
