const assert = require("node:assert/strict");

it("emulate: control time without waiting", async ({ browser }) => {
    await browser.url("/");
    const clock = await browser.emulate("clock", {
        now: new Date("2025-01-01T00:00:00.000Z"),
        toFake: ["Date", "setTimeout", "clearTimeout"],
    });
    try {
        await browser.execute(() => {
            window.timerFired = false;
            setTimeout(() => {
                window.timerFired = true;
            }, 1000);
        });
        assert.equal(await browser.execute(() => window.timerFired), false);
        await clock.tick(1000);
        assert.equal(await browser.execute(() => window.timerFired), true);
        assert.equal(
            await browser.execute(() => new Date().toISOString()),
            "2025-01-01T00:00:01.000Z",
        );
    } finally {
        await clock.restore();
    }
});
