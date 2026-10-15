const assert = require("node:assert/strict");
const fs = require("node:fs");
const { suiteFiles } = require("./suite-files.cjs");

function verifyRuntime(results, manifest, suite) {
    const files = suiteFiles(suite, manifest);
    assert.ok(files.length, `${suite}: no declared test files`);
    const expected = new Map();
    for (const entry of manifest.filter(entry => files.includes(entry.test))) {
        const count = entry.testCount ?? 1;
        assert.ok(Number.isInteger(count) && count > 0, `Invalid testCount: ${entry.test}`);
        assert.ok(
            !expected.has(entry.test) || expected.get(entry.test) === count,
            `Conflicting testCount: ${entry.test}`,
        );
        expected.set(entry.test, count);
    }
    const seen = new Set();
    const passed = new Map();
    for (const result of results) {
        assert.ok(expected.has(result.file), `Unexpected test file: ${result.file}`);
        assert.equal(result.browserId, "chrome", `Unexpected browser: ${result.file}`);
        assert.equal(
            result.status,
            "success",
            `${result.file}: ${result.fullTitle}: ${result.status}`,
        );
        assert.ok(result.fullTitle, `Missing test title: ${result.file}`);
        const identity = `${result.file}\0${result.fullTitle}`;
        assert.ok(!seen.has(identity), `Duplicate result: ${result.fullTitle}`);
        seen.add(identity);
        passed.set(result.file, (passed.get(result.file) || 0) + 1);
    }
    for (const [file, count] of expected)
        assert.equal(passed.get(file) || 0, count, `Incomplete execution: ${file}`);
    return { files: files.length, passed: results.length };
}

module.exports = { verifyRuntime };
if (require.main === module) {
    try {
        const [suite, filename] = process.argv.slice(2);
        const results = fs
            .readFileSync(filename, "utf8")
            .split("\n")
            .filter(Boolean)
            .map(line => JSON.parse(line));
        console.log(JSON.stringify(verifyRuntime(results, require("./manifest.json"), suite)));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
