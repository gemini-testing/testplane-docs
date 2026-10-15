const assert = require("node:assert/strict");

it("throttle: use the deprecated alias in an isolated session", async ({ browser }) => {
    await browser.url("/");
    await browser.throttle("Good3G");
    const status = await browser.execute(
        async () => (await fetch("/?throttled", { cache: "no-store" })).status,
    );
    assert.equal(status, 200);
});
