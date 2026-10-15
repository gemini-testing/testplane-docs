const assert = require("node:assert/strict");

it("mock.restore: remove interception before the next request", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.respond({ source: "mocked" });
        const body = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(body.source, "mocked");
    } finally {
        await mock.restore();
    }
    const body = await browser.execute(async () =>
        (await fetch("/api/items", { cache: "no-store" })).json(),
    );
    assert.equal(body.source, "original");
    assert.equal(mock.calls.length, 0);
    assert.throws(() => mock.respond({ source: "unused" }), /restored mock/);
});
