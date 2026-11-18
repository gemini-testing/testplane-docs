const assert = require("node:assert/strict");

it("mock.redirectOnce: redirect only the next request", async ({ browser }) => {
    await browser.url("/");
    const target = new URL("/api/other", await browser.getUrl()).href;
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.redirectOnce(target);
        const first = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        const second = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        assert.equal(first.source, "redirected");
        assert.equal(second.source, "original");
    } finally {
        await mock.restore();
    }
});
