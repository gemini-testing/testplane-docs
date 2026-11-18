const assert = require("node:assert/strict");

it("slow network: fetch data under custom throughput limits", async ({ browser }) => {
    await browser.url("/");
    await browser.throttleNetwork({
        offline: false,
        latency: 500,
        downloadThroughput: (50 * 1024) / 8,
        uploadThroughput: (20 * 1024) / 8,
    });
    const data = await browser.execute(async () =>
        (await fetch("/api/items", { cache: "no-store" })).json(),
    );
    assert.equal(data.source, "original");
});
