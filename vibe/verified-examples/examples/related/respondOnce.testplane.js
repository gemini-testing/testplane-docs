const assert = require("node:assert/strict");

it("mock.respondOnce: consume BiDi responses in order", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.respondOnce({ source: "first" });
        mock.respondOnce({ source: "second" });
        const sources = [];
        for (let i = 0; i < 3; i++) {
            const body = await browser.execute(async () =>
                (await fetch("/api/items", { cache: "no-store" })).json(),
            );
            sources.push(body.source);
        }
        assert.deepEqual(sources, ["first", "second", "original"]);
    } finally {
        await mock.restore();
    }
});
