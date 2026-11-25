import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const generator = fileURLToPath(new URL("../generate-snippets.mjs", import.meta.url));
const harness = "test/doc-examples";
const output = `${harness}/generated`;
const page = "docs/commands/example.mdx";
const translation = "i18n/ru/docusaurus-plugin-content-docs/current/commands/example.mdx";
const code =
    'const assert = require("node:assert/strict");\nit("works", async () => { assert.equal(2 + 2, 4); });\n';
const fence = (value = code, meta = "testplane=example", language = "javascript") =>
    `\n\`\`\`${language} ${meta}\n${value}\`\`\`\n`;

function fixture(t) {
    const root = mkdtempSync(path.join(tmpdir(), "generate-examples-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const write = (name, value) => {
        mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
        writeFileSync(path.join(root, name), value);
    };
    const read = name => readFileSync(path.join(root, name), "utf8");
    execFileSync("git", ["init", "--quiet", root]);
    write(".gitignore", `${output}/\n`);
    write(page, fence());
    const generate = () =>
        spawnSync(process.execPath, [generator, "--root", root], { encoding: "utf8" });
    const manifest = () => JSON.parse(read(`${output}/manifest.json`));
    return { root, write, read, generate, manifest };
}

test("extracts an untracked documented test without a hand-written manifest or test file", t => {
    const f = fixture(t);
    const result = f.generate();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.read(`${output}/chrome/example.testplane.js`), code);
    assert.deepEqual(
        f
            .manifest()
            .map(({ page, exampleId, test, testCount }) => ({ page, exampleId, test, testCount })),
        [
            {
                page,
                exampleId: "example",
                test: "generated/chrome/example.testplane.js",
                testCount: 1,
            },
        ],
    );
});

test("generates one file for identical localized blocks and page aliases", t => {
    const f = fixture(t);
    f.write(translation, fence());
    f.write("docs/guides/example.mdx", fence());
    assert.equal(f.generate().status, 0);
    assert.equal(f.manifest().length, 3);
    assert.equal(new Set(f.manifest().map(entry => entry.test)).size, 1);
});

test("updates source, removes obsolete files, and produces deterministic output", t => {
    const f = fixture(t);
    assert.equal(f.generate().status, 0);
    const manifest = f.read(`${output}/manifest.json`);
    assert.equal(f.generate().status, 0);
    assert.equal(f.read(`${output}/manifest.json`), manifest);
    f.write(page, fence(code.replace("2 + 2, 4", "3 + 3, 6"), "testplane=replacement"));
    assert.equal(f.generate().status, 0);
    assert.equal(existsSync(path.join(f.root, `${output}/chrome/example.testplane.js`)), false);
    assert.match(f.read(`${output}/chrome/replacement.testplane.js`), /3 \+ 3, 6/);
    rmSync(path.join(f.root, page));
    assert.equal(f.generate().status, 0);
    assert.deepEqual(f.manifest(), []);
    assert.equal(existsSync(path.join(f.root, `${output}/chrome/replacement.testplane.js`)), false);
});

test("selects Selenium explicitly and counts multiple top-level tests without counting strings or comments", t => {
    const f = fixture(t);
    f.write(
        page,
        fence(
            `${code}// it('not a test')\nconst text = "it('not a test')";\nit("second", () => {});\n`,
            "testplane=download suite=selenium",
        ),
    );
    assert.equal(f.generate().status, 0);
    assert.equal(f.manifest()[0].test, "generated/selenium/download.testplane.js");
    assert.equal(f.manifest()[0].testCount, 2);
});

test("extracts nested MDX fences and supports quoted metadata without confusing the title", t => {
    const f = fixture(t);
    f.write(
        page,
        `<Tabs>\n<TabItem value="js">\n${fence(code, 'title="testplane=not-a-marker" testplane="example"', "js")}\n</TabItem>\n</Tabs>\n`,
    );
    assert.equal(f.generate().status, 0);
    assert.equal(f.manifest()[0].exampleId, "example");
    assert.equal(f.manifest()[0].language, "js");
});

test("ignores legacy blocks, mobile pages and v8 even when they carry markers", t => {
    const f = fixture(t);
    f.write(page, fence(code, ""));
    for (const name of [
        "docs/commands/browser/tap.mdx",
        "docs/guides/android-testing.mdx",
        "i18n/ru/docusaurus-plugin-content-docs/current/commands/element/pinch.mdx",
        "versioned_docs/version-v8/a.mdx",
        "i18n/ru/docusaurus-plugin-content-docs/version-v8/a.mdx",
    ])
        f.write(name, fence("not even valid JavaScript", "testplane=excluded"));
    assert.equal(f.generate().status, 0);
    assert.deepEqual(f.manifest(), []);
});

for (const [name, value, meta, language, message] of [
    ["invalid JavaScript", "it(\n", "testplane=example", "javascript", /syntax|unexpected/i],
    [
        "generator callback",
        'it("must fail", function* () { throw new Error("not executed"); });\n',
        "testplane=example",
        "javascript",
        /generator/i,
    ],
    [
        "async generator callback",
        'it("must fail", async function* () { throw new Error("not executed"); });\n',
        "testplane=example",
        "javascript",
        /generator/i,
    ],
    [
        "a fragment without a test",
        "await browser.url('/');\n",
        "testplane=example",
        "javascript",
        /top.level|it\(|await/i,
    ],
    [
        "no test declarations",
        "const answer = 42;\n",
        "testplane=example",
        "javascript",
        /it\(|test/i,
    ],
    [
        "conditional registration",
        'if (true) it("hidden", () => {});\n',
        "testplane=example",
        "javascript",
        /top.level/i,
    ],
    [
        "focused tests",
        'it.only("only", () => {});\n',
        "testplane=example",
        "javascript",
        /it\(|top.level/i,
    ],
    [
        "skipped tests",
        'it.skip("skip", () => {});\n',
        "testplane=example",
        "javascript",
        /it\(|top.level/i,
    ],
    ["pending tests", 'it("pending");\n', "testplane=example", "javascript", /callback|it\(/i],
    [
        "dynamic titles",
        "it(String(Date.now()), () => {});\n",
        "testplane=example",
        "javascript",
        /title/i,
    ],
    [
        "duplicate titles",
        'it("same", () => {});\nit("same", () => {});\n',
        "testplane=example",
        "javascript",
        /duplicate.*title/i,
    ],
    [
        "nested registrations",
        'it("outer", () => { it("inner", () => {}); });\n',
        "testplane=example",
        "javascript",
        /top.level/i,
    ],
    [
        "aliased registrations",
        'const test = it;\ntest("hidden", () => {});\n',
        "testplane=example",
        "javascript",
        /top.level|it\(/i,
    ],
    ["unsupported language", code, "testplane=example", "typescript", /language/i],
    ["path traversal", code, "testplane=../../escape", "javascript", /identifier|id/i],
    ["missing id", code, "testplane", "javascript", /identifier|id/i],
    ["unknown suite", code, "testplane=example suite=firefox", "javascript", /suite/i],
    ["duplicate id metadata", code, "testplane=one testplane=two", "javascript", /duplicate/i],
    ["suite without an id", code, "suite=selenium", "javascript", /testplane/i],
]) {
    test(`rejects ${name} with a source location and removes stale generated tests`, t => {
        const f = fixture(t);
        assert.equal(f.generate().status, 0);
        f.write(page, fence(value, meta, language));
        const result = f.generate();
        assert.equal(result.status, 1, result.stdout);
        assert.match(result.stderr, /docs\/commands\/example\.mdx:\d+/);
        assert.match(result.stderr, message);
        assert.equal(existsSync(path.join(f.root, `${output}/manifest.json`)), false);
    });
}

for (const [name, value, meta] of [
    ["code", code.replace("2 + 2, 4", "2 + 2, 5"), "testplane=example"],
    ["suite", code, "testplane=example suite=selenium"],
]) {
    test(`rejects conflicting ${name} for the same id across locales`, t => {
        const f = fixture(t);
        f.write(translation, fence(value, meta));
        const result = f.generate();
        assert.equal(result.status, 1);
        assert.match(result.stderr, /conflict|differs/i);
        assert.match(result.stderr, /docs\/commands\/example\.mdx/);
    });
}

test("duplicate ids on the same page fail rather than silently merging examples", t => {
    const f = fixture(t);
    f.write(page, fence() + fence());
    const result = f.generate();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /duplicate/i);
});

test("generation parses but never executes documented JavaScript", t => {
    const f = fixture(t);
    const sentinel = path.join(f.root, "must-not-exist");
    f.write(
        page,
        fence(
            `const sideEffect = require("node:fs").writeFileSync(${JSON.stringify(sentinel)}, "executed");\n${code}`,
        ),
    );
    assert.equal(f.generate().status, 0);
    assert.equal(existsSync(sentinel), false);
});

test("refuses to follow an output symlink or erase its target", t => {
    const f = fixture(t);
    f.write("sentinel/keep", "keep");
    mkdirSync(path.join(f.root, harness), { recursive: true });
    symlinkSync(path.join(f.root, "sentinel"), path.join(f.root, output));
    const result = f.generate();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /symlink/i);
    assert.equal(f.read("sentinel/keep"), "keep");
});

test("an explicitly empty suite fails instead of silently selecting Chrome", t => {
    const f = fixture(t);
    f.write(page, fence(code, 'testplane=example suite=""'));
    const result = f.generate();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /suite/i);
});

test("a dangling output symlink is rejected without replacing it", t => {
    const f = fixture(t);
    mkdirSync(path.join(f.root, harness), { recursive: true });
    symlinkSync(path.join(f.root, "missing-target"), path.join(f.root, output));
    const result = f.generate();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /symlink/i);
});

test("a documentation symlink cannot read code outside the repository", t => {
    const f = fixture(t);
    const outside = mkdtempSync(path.join(tmpdir(), "external-example-"));
    t.after(() => rmSync(outside, { recursive: true, force: true }));
    writeFileSync(path.join(outside, "example.mdx"), fence());
    rmSync(path.join(f.root, page));
    symlinkSync(path.join(outside, "example.mdx"), path.join(f.root, page));
    const result = f.generate();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /outside repository/i);
});
