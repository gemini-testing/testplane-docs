const assert = require("node:assert/strict");

it("browser.mock: observe and replace a BiDi response", async ({ browser }) => {
    await browser.url("/");
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items", { method: "GET", statusCode: 200 });
    const seenUrls = [];
    mock.on("request", event => seenUrls.push(event.request.url));
    try {
        mock.respond({ source: "mocked" });
        const body = await browser.execute(async () =>
            (await fetch("/api/items", { cache: "no-store" })).json(),
        );
        await mock.waitForResponse({ timeout: 3000 });
        assert.equal(body.source, "mocked");
        assert.equal(mock.calls.length, 1);
        assert.ok(mock.calls[0].request.url.endsWith("/api/items"));
        assert.ok(seenUrls.some(url => url.endsWith("/api/items")));
    } finally {
        await mock.restore();
    }
});
