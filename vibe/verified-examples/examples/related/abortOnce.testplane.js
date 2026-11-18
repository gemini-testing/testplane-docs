const assert = require("node:assert/strict");

it("mock.abortOnce: block one BiDi request", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.abortOnce();
        const failed = await browser.execute(async () => {
            try {
                await fetch("/api/items", { cache: "no-store" });
                return false;
            } catch {
                return true;
            }
        });
        assert.equal(failed, true);
        const status = await browser.execute(
            async () => (await fetch("/api/items", { cache: "no-store" })).status,
        );
        assert.equal(status, 200);
    } finally {
        await mock.restore();
    }
});
