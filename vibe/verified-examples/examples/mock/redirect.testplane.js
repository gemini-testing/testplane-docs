const assert = require("node:assert/strict");

it("mock.redirect: send matching requests to another endpoint", async ({ browser }) => {
    await browser.url("/");
    const target = new URL("/api/other", await browser.getUrl()).href;
    await browser.sessionSubscribe({
        events: ["network.beforeRequestSent", "network.responseStarted"],
    });
    const mock = await browser.mock("/api/items");
    try {
        mock.redirect(target);
        for (let i = 0; i < 2; i++) {
            const data = await browser.execute(async () =>
                (await fetch("/api/items", { cache: "no-store" })).json(),
            );
            assert.equal(data.source, "redirected");
        }
    } finally {
        await mock.restore();
    }
});
