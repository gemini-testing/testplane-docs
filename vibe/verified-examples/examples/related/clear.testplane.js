const assert = require("node:assert/strict");

it("mock.clear: clear history but retain response rules", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.respond({ source: "mocked" });
        await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        await mock.waitForResponse({ timeout: 3000 });
        assert.equal(mock.calls.length, 1);
        await mock.clear();
        assert.equal(mock.calls.length, 0);
        const body = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(body.source, "mocked");
        await mock.waitForResponse({ timeout: 3000 });
        assert.equal(mock.calls.length, 1);
    } finally {
        await mock.restore();
    }
});
