const assert = require("node:assert/strict");

// Configure testsPerSession: 1 so this offline session is not reused.
it("throttleNetwork: check a failed request while offline", async ({ browser }) => {
    await browser.url("/");
    await browser.throttleNetwork("offline");
    const failed = await browser.execute(async () => {
        try {
            await fetch("/?offline-check", { cache: "no-store" });
            return false;
        } catch {
            return true;
        }
    });
    assert.equal(failed, true);
});

it("throttleNetwork: the next session starts online", async ({ browser }) => {
    await browser.url("/");
    const status = await browser.execute(async () => {
        const response = await fetch("/?online-check", { cache: "no-store" });
        return response.status;
    });
    assert.equal(status, 200);
});
