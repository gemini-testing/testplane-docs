const assert = require("node:assert/strict");

it("unstable_getCdp: query the connected Chromium browser", async ({ browser }) => {
    const cdp = await browser.unstable_getCdp();
    assert.ok(cdp, "This test requires a Chromium session with a CDP connection");
    const version = await cdp.request("Browser.getVersion");
    assert.match(version.product, /Chrome/);
    assert.equal(typeof version.protocolVersion, "string");
    // Testplane owns this connection: do not call cdp.close().
});
