const assert = require("node:assert/strict");

it("mock.requestOnce: change only the next request", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.requestOnce({ headers: { "x-example": "once" } });
        const first = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        const second = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(first.header, "once");
        assert.equal(second.header, null);
    } finally {
        await mock.restore();
    }
});
