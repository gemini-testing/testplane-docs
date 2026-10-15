const assert = require("node:assert/strict");
const { test } = require("node:test");
const { verifyRuntime } = require("../verify-runtime.cjs");
const { suiteFiles } = require("../suite-files.cjs");
const file = "examples/browser/example.testplane.js";
const download = "examples/selenium/download.testplane.js";
const manifest = [{ test: file, testCount: 2 }, { test: download }];
const result = (fullTitle, status = "success") => ({
    file,
    fullTitle,
    status,
    browserId: "chrome",
});

test("every declared test must pass in the selected suite", () => {
    assert.deepEqual(verifyRuntime([result("first"), result("second")], manifest, "chrome"), {
        files: 1,
        passed: 2,
    });
});
for (const status of ["fail", "skipped", "retry", "unknown"]) {
    test(`${status} cannot be reported as a successful example`, () => {
        assert.throws(() =>
            verifyRuntime([result("first"), result("second", status)], manifest, "chrome"),
        );
    });
}
test("it.only or missing files cannot produce a green partial run", () => {
    assert.throws(() => verifyRuntime([result("first")], manifest, "chrome"));
    assert.throws(() => verifyRuntime([], manifest, "chrome"));
});
test("duplicate passes cannot mask an omitted test", () => {
    assert.throws(() => verifyRuntime([result("first"), result("first")], manifest, "chrome"));
});
test("results from an unrelated file or browser cannot satisfy coverage", () => {
    assert.throws(() =>
        verifyRuntime([{ ...result("first"), file: download }], manifest, "chrome"),
    );
    assert.throws(() =>
        verifyRuntime(
            [{ ...result("first"), browserId: "firefox" }, result("second")],
            manifest,
            "chrome",
        ),
    );
});
test("a suite with no declared tests fails closed", () => {
    assert.throws(() => verifyRuntime([], [], "chrome"));
});
test("a mapped test is selected once even when referenced by several pages", () => {
    assert.deepEqual(suiteFiles("chrome", [...manifest, manifest[0]]), [file]);
    assert.deepEqual(suiteFiles("selenium", manifest), [download]);
});
test("conflicting expected counts for one file are rejected", () => {
    assert.throws(() =>
        verifyRuntime(
            [result("first"), result("second")],
            [...manifest, { test: file, testCount: 1 }],
            "chrome",
        ),
    );
});
