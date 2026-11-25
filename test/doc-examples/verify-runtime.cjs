const assert = require("node:assert/strict");
const fs = require("node:fs");
const { suiteFiles } = require("./suite-files.cjs");

function verifyRuntime(results, manifest) {
    const files = suiteFiles(manifest);
    assert.ok(files.length, "Chrome: no declared test files");
    const expected = new Map();
    const browsers = new Map();
    const titles = new Map();
    for (const entry of manifest) {
        const count = entry.testCount ?? 1;
        assert.ok(Number.isInteger(count) && count > 0, `Invalid testCount: ${entry.test}`);
        assert.ok(
            !expected.has(entry.test) || expected.get(entry.test) === count,
            `Conflicting testCount: ${entry.test}`,
        );
        expected.set(entry.test, count);
        const browser = entry.transport === "cdp" ? "chrome-cdp" : "chrome";
        assert.ok(
            !browsers.has(entry.test) || browsers.get(entry.test) === browser,
            `Conflicting transport: ${entry.test}`,
        );
        browsers.set(entry.test, browser);
        if (entry.testTitles) {
            assert.equal(
                new Set(entry.testTitles).size,
                count,
                `Invalid test titles: ${entry.test}`,
            );
            if (titles.has(entry.test))
                assert.deepEqual(titles.get(entry.test), new Set(entry.testTitles));
            titles.set(entry.test, new Set(entry.testTitles));
        }
    }
    const seen = new Set();
    const passed = new Map();
    for (const result of results) {
        assert.ok(expected.has(result.file), `Unexpected test file: ${result.file}`);
        assert.equal(
            result.browserId,
            browsers.get(result.file),
            `Unexpected browser: ${result.file}`,
        );
        assert.equal(
            result.status,
            "success",
            `${result.file}: ${result.fullTitle}: ${result.status}`,
        );
        assert.ok(result.fullTitle, `Missing test title: ${result.file}`);
        if (titles.has(result.file))
            assert.ok(
                titles.get(result.file).has(result.fullTitle),
                `Unexpected test title: ${result.fullTitle}`,
            );
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
        const [filename] = process.argv.slice(2);
        const results = fs
            .readFileSync(filename, "utf8")
            .split("\n")
            .filter(Boolean)
            .map(line => JSON.parse(line));
        console.log(JSON.stringify(verifyRuntime(results, require("./generated/manifest.json"))));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
