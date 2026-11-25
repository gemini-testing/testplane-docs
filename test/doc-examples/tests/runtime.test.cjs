const assert = require("node:assert/strict");
const { test } = require("node:test");
const { verifyRuntime } = require("../verify-runtime.cjs");
const { suiteFiles } = require("../suite-files.cjs");
const file = "generated/chrome/example.testplane.js";
const manifest = [{ test: file, testCount: 2 }];
const result = (fullTitle, status = "success") => ({
    file,
    fullTitle,
    status,
    browserId: "chrome",
});

test("every declared test must pass in the Chrome suite", () => {
    assert.deepEqual(verifyRuntime([result("first"), result("second")], manifest), {
        files: 1,
        passed: 2,
    });
});
for (const status of ["fail", "skipped", "retry", "unknown"]) {
    test(`${status} cannot be reported as a successful example`, () => {
        assert.throws(() => verifyRuntime([result("first"), result("second", status)], manifest));
    });
}
test("it.only or missing files cannot produce a green partial run", () => {
    assert.throws(() => verifyRuntime([result("first")], manifest));
    assert.throws(() => verifyRuntime([], manifest));
});
test("duplicate passes cannot mask an omitted test", () => {
    assert.throws(() => verifyRuntime([result("first"), result("first")], manifest));
});

test("a different title in the right file cannot stand in for a documented test", () => {
    const named = [{ ...manifest[0], testTitles: ["first", "second"] }];
    assert.throws(() => verifyRuntime([result("first"), result("unexpected")], named));
    assert.equal(verifyRuntime([result("second"), result("first")], named).passed, 2);
});
test("results from an unrelated file or browser cannot satisfy coverage", () => {
    assert.throws(() =>
        verifyRuntime(
            [{ ...result("first"), file: "generated/chrome/other.testplane.js" }],
            manifest,
        ),
    );
    assert.throws(() =>
        verifyRuntime([{ ...result("first"), browserId: "firefox" }, result("second")], manifest),
    );
});
test("a suite with no declared tests fails closed", () => {
    assert.throws(() => verifyRuntime([], []));
});

test("CDP examples run once on the same local Chrome, not in the default BiDi set", () => {
    const cdp = { test: "generated/chrome/cdp.testplane.js", testCount: 1, transport: "cdp" };
    assert.deepEqual(suiteFiles([...manifest, cdp], "bidi"), [file]);
    assert.deepEqual(suiteFiles([...manifest, cdp], "cdp"), [cdp.test]);
    const event = { ...result("cdp"), file: cdp.test };
    assert.throws(() => verifyRuntime([event], [cdp]));
    assert.equal(verifyRuntime([{ ...event, browserId: "chrome-cdp" }], [cdp]).passed, 1);
});
test("a mapped test is selected once even when referenced by several pages", () => {
    assert.deepEqual(suiteFiles([...manifest, manifest[0]]), [file]);
});
test("conflicting expected counts for one file are rejected", () => {
    assert.throws(() =>
        verifyRuntime(
            [result("first"), result("second")],
            [...manifest, { test: file, testCount: 1 }],
        ),
    );
});

test("runtime rejects files outside the generated Chrome suite", () => {
    for (const test of [
        "examples/browser/manual.testplane.js",
        "generated/chrome/../escape.testplane.js",
        "generated/firefox/test.testplane.js",
        "generated/selenium/download.testplane.js",
    ])
        assert.throws(() => suiteFiles([{ test }]));
});
