const assert = require("node:assert/strict");

it("browser.executeAsync: return a result through the injected callback", async ({ browser }) => {
    await browser.url("/");
    await browser.setTimeout({ script: 5000 });
    const result = await browser.executeAsync(
        (a, b, done) => {
            setTimeout(() => done(a + b), 20);
        },
        4,
        6,
    );
    assert.equal(result, 10);
});
