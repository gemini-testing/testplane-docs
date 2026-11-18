const assert = require("node:assert/strict");

it("mock.reset: remove overrides but keep the mock usable", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.request({ headers: { "x-example": "overridden" } });
        const first = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(first.header, "overridden");
        await mock.waitForResponse({ timeout: 3000 });
        assert.equal(mock.reset(), mock);
        assert.equal(mock.calls.length, 0);
        const second = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(second.header, null);
        await mock.waitForResponse({ timeout: 3000 });
        assert.equal(mock.calls.length, 1);
        mock.respond({ source: "mocked" });
        const third = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(third.source, "mocked");
        mock.reset();
        const fourth = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(fourth.source, "original");
    } finally {
        await mock.restore();
    }
});
