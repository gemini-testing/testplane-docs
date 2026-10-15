const assert = require("node:assert/strict");

it("mock.request: change outgoing requests", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.request({ method: "POST", headers: { "x-example": "persistent" } });
        for (let i = 0; i < 2; i++) {
            const data = await browser.execute(async () =>
                (await fetch("/api/items", { cache: "no-store" })).json(),
            );
            assert.equal(data.method, "POST");
            assert.equal(data.header, "persistent");
        }
    } finally {
        await mock.restore();
    }
});
