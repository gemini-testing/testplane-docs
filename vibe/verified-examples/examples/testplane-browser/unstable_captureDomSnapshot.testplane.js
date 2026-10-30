const assert = require("node:assert/strict");

it("browser.unstable_captureDomSnapshot: capture a filtered subtree", async ({ browser }) => {
    await browser.url("/");
    await browser.execute(() => {
        document.body.innerHTML =
            '<section id="panel" data-internal="example"><button data-test="save">Save changes</button><p>abcdefghijk</p><script type="application/json">{}</script></section><p id="outside">Outside</p>';
    });
    const result = await browser.unstable_captureDomSnapshot("#panel", {
        excludeAttrs: ["data-internal"],
        maxTextLength: 6,
    });
    assert.match(result.snapshot, /section#panel/);
    assert.match(result.snapshot, /abcdef\.\.\./);
    assert.doesNotMatch(result.snapshot, /Outside|data-internal/);
    assert.ok(result.omittedTags.includes("script"));
    assert.ok(result.omittedAttributes.includes("data-internal"));
    assert.equal(result.textWasTruncated, true);
    const missing = await browser.unstable_captureDomSnapshot("#missing");
    assert.equal(missing.snapshot, "# Element not found: #missing");
    const invalid = await browser.unstable_captureDomSnapshot("[");
    assert.equal(invalid.snapshot, "# Invalid selector: [");
});
