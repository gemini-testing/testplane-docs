import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const checker = fileURLToPath(new URL("../verify-snippets.cjs", import.meta.url));
const harness = "test/doc-examples";
const page = "docs/commands/example.mdx";
const translation = "i18n/ru/docusaurus-plugin-content-docs/current/commands/example.mdx";
const code = 'it("works", async () => {});\n';
const fence = (value = code, lang = "javascript", meta = "") =>
    `\n\`\`\`${lang}${meta ? " " + meta : ""}\n${value}\`\`\`\n`;
const marked = (value = code) => fence(value, "javascript", "testplane=example");

function fixture(t, covered = false, { baselineHarness = harness, exemptions = [] } = {}) {
    const root = mkdtempSync(path.join(tmpdir(), "doc-examples-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const write = (name, value) => {
        mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
        writeFileSync(
            path.join(root, name),
            typeof value === "string" ? value : JSON.stringify(value),
        );
    };
    const git = (...args) =>
        execFileSync("git", args, {
            cwd: root,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        }).trim();
    const manifest = [{ page, translation, test: "examples/browser/example.testplane.js" }];
    const manualBaseline = baselineHarness !== harness;
    write(page, covered && !manualBaseline ? marked() : fence());
    write(translation, covered && !manualBaseline ? marked() : fence());
    if (manualBaseline) write(`${baselineHarness}/manifest.json`, covered ? manifest : []);
    write(`${baselineHarness}/non-executable.json`, exemptions);
    if (manualBaseline) write(`${baselineHarness}/examples/browser/example.testplane.js`, code);
    git("init", "--quiet");
    git("add", ".");
    git(
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.invalid",
        "commit",
        "--quiet",
        "-m",
        "base",
    );
    const base = git("rev-parse", "HEAD");
    if (baselineHarness !== harness) {
        mkdirSync(path.dirname(path.join(root, harness)), { recursive: true });
        renameSync(path.join(root, baselineHarness), path.join(root, harness));
        if (covered) {
            write(page, marked());
            write(translation, marked());
        }
    }
    const check = (ref = base) => {
        const result = spawnSync(
            process.execPath,
            [checker, "--root", root, "--base", ref, "--report-dir", path.join(root, "report")],
            { encoding: "utf8" },
        );
        let report;
        try {
            report = JSON.parse(readFileSync(path.join(root, "report/coverage.json"), "utf8"));
        } catch {}
        return { ...result, report };
    };
    return { root, write, git, manifest, check };
}

test("unchanged uncovered examples are debt, not runtime successes", t => {
    const f = fixture(t);
    const result = f.check();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.report.counts.legacy, 2);
    assert.equal(result.report.counts.covered, 0);
});

for (const lang of ["javascript", "js", "typescript", "ts", "tsx", "bash", ""]) {
    test(`a new ${lang || "unlabelled"} example cannot silently join legacy debt`, t => {
        const f = fixture(t);
        f.write("docs/new.mdx", fence(code, lang));
        const result = f.check();
        assert.equal(result.status, 1, result.stdout);
        assert.equal(result.report.counts.uncovered, 1);
    });
}

test("changing legacy code fails even when the filename is unchanged", t => {
    const f = fixture(t);
    f.write(page, fence('it("changed", async () => {});\n'));
    assert.equal(f.check().status, 1);
});

test("prose and fence metadata do not create new examples", t => {
    const f = fixture(t);
    f.write(
        page,
        `# New heading\n${fence().replace("```javascript", '```javascript title="example.js"')}`,
    );
    assert.equal(f.check().status, 0);
});

test("duplicating a legacy example still requires coverage for the new occurrence", t => {
    const f = fixture(t);
    f.write(page, fence() + fence());
    assert.equal(f.check().report.counts.uncovered, 1);
});

test("localized blocks with the same id must match exactly without a manual manifest", t => {
    const f = fixture(t);
    f.write(page, marked());
    f.write(translation, marked());
    assert.equal(f.check().report.counts.covered, 2);
    f.write(translation, marked('it("different", async () => {});\n'));
    assert.equal(f.check().status, 1);
});

test("removing coverage for a retained example is a regression", t => {
    const f = fixture(t, true);
    f.write(page, fence());
    f.write(translation, fence());
    const result = f.check();
    assert.equal(result.status, 1);
    assert.equal(result.report.counts.regression, 2);
});

test("deleting both a page and its manifest mapping is allowed", t => {
    const f = fixture(t, true);
    rmSync(path.join(f.root, page));
    rmSync(path.join(f.root, translation));
    assert.equal(f.check().status, 0);
});

test("a missing Git base fails closed rather than accepting current examples as legacy", t => {
    const f = fixture(t);
    const result = f.check("not-a-real-ref");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /base|revision/i);
});

test("mobile and v8 are outside the gate while desktop pages are not", t => {
    const f = fixture(t);
    for (const name of [
        "docs/guides/android-testing.mdx",
        "docs/commands/browser/tap.mdx",
        "i18n/ru/docusaurus-plugin-content-docs/current/commands/element/pinch.mdx",
        "versioned_docs/version-v8/new.mdx",
        "i18n/ru/docusaurus-plugin-content-docs/version-v8/new.mdx",
    ])
        f.write(name, fence("changed();\n"));
    assert.equal(f.check().status, 0);
    f.write("docs/commands/browser/executionContext.mdx", fence("changed();\n"));
    assert.equal(f.check().status, 1);
});

test("a manual manifest cannot grant coverage to unmarked new code", t => {
    const f = fixture(t);
    f.write("docs/new.mdx", fence());
    f.write(`${harness}/manifest.json`, [
        { page: "docs/new.mdx", test: "examples/browser/example.testplane.js" },
    ]);
    f.write(`${harness}/examples/browser/example.testplane.js`, code);
    const result = f.check();
    assert.equal(result.status, 1);
    assert.equal(result.report.counts.uncovered, 1);
    assert.match(result.stderr, /testplane=.*generate:examples/s);
});

test("duplicate ids cannot silently merge occurrences on the same page", t => {
    const f = fixture(t);
    f.write(page, marked() + marked());
    assert.equal(f.check().status, 1);
});

test("invalid MDX fails instead of dropping examples from inventory", t => {
    const f = fixture(t);
    f.write("docs/broken.mdx", "<Component unclosed={\n");
    assert.equal(f.check().status, 1);
});

test("new JSX CodeBlock examples require explicit classification", t => {
    const f = fixture(t);
    f.write("docs/jsx.mdx", '<CodeBlock language="js">{`something();`}</CodeBlock>');
    assert.equal(f.check().status, 1);
});

test("non-executable classification is explicit, reported, and invalidated by code changes", async t => {
    const { createHash } = await import("node:crypto");
    const f = fixture(t);
    f.write("docs/output.mdx", fence("expected output\n", "text"));
    assert.equal(f.check().status, 1);
    f.write(`${harness}/non-executable.json`, [
        {
            page: "docs/output.mdx",
            language: "text",
            blockIndex: 0,
            sha256: createHash("sha256").update("expected output").digest("hex"),
            reason: "Expected terminal output, not executable input.",
        },
    ]);
    assert.equal(f.check().report.counts["non-executable"], 1);
    assert.equal(f.check().status, 0);
    f.write("docs/output.mdx", fence("new output\n", "text"));
    assert.equal(f.check().status, 1);
});

test("an exemption cannot downgrade previously verified code", async t => {
    const { createHash } = await import("node:crypto");
    const f = fixture(t, true);
    f.write(page, fence());
    f.write(translation, fence());
    f.write(
        `${harness}/non-executable.json`,
        [page, translation].map(page => ({
            page,
            language: "javascript",
            blockIndex: 0,
            sha256: createHash("sha256").update(code.trimEnd()).digest("hex"),
            reason: "Cannot run this anymore.",
        })),
    );
    assert.equal(f.check().report.counts.regression, 2);
    assert.equal(f.check().status, 1);
});

test("fences nested in MDX tabs remain in the inventory", t => {
    const f = fixture(t);
    f.write("docs/tabs.mdx", `<Tabs>\n<TabItem value="js">\n${fence()}\n</TabItem>\n</Tabs>\n`);
    assert.equal(f.check().report.counts.uncovered, 1);
});

test("renaming a page requires updating its coverage rather than erasing the debt", t => {
    const f = fixture(t);
    f.write("docs/renamed.mdx", fence());
    rmSync(path.join(f.root, page));
    assert.equal(f.check().report.counts.uncovered, 1);
});

test("invalid marked code still publishes the legacy inventory for review", t => {
    const f = fixture(t);
    f.write("docs/broken-example.mdx", marked("const answer = 42;\n"));
    const result = f.check();
    assert.equal(result.status, 1);
    assert.equal(result.report.counts.legacy, 2);
    assert.equal(result.report.errors.length, 1);
});

for (const blockIndex of [0, 1]) {
    test(`a new covered copy of legacy code does not steal its debt allowance (index ${blockIndex})`, t => {
        const f = fixture(t);
        f.write(page, blockIndex === 0 ? marked() + fence() : fence() + marked());
        const result = f.check();
        assert.equal(result.status, 0);
        assert.equal(result.report.counts.covered, 1);
        assert.equal(result.report.counts.legacy, 2);
    });

    test(`a new uncovered copy of verified code cannot become legacy (covered index ${blockIndex})`, t => {
        const f = fixture(t, true);
        f.write(page, blockIndex === 0 ? marked() + fence() : fence() + marked());
        const result = f.check();
        assert.equal(result.status, 1);
        assert.equal(result.report.counts.uncovered, 1);
        assert.equal(result.report.counts.legacy, 0);
    });
}

test("moving the harness preserves covered and legacy classifications", t => {
    const f = fixture(t, true, { baselineHarness: "vibe/verified-examples" });
    const result = f.check();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.report.counts.covered, 2);
    assert.equal(result.report.counts.legacy, 0);
});

test("moving the harness cannot hide removed coverage", t => {
    const f = fixture(t, true, { baselineHarness: "vibe/verified-examples" });
    f.write(page, fence());
    f.write(translation, fence());
    const result = f.check();
    assert.equal(result.status, 1, result.stdout);
    assert.equal(result.report.counts.regression, 2);
});

test("moving the harness cannot turn a removed exemption into legacy debt", async t => {
    const { createHash } = await import("node:crypto");
    const f = fixture(t, false, {
        baselineHarness: "vibe/verified-examples",
        exemptions: [
            {
                page,
                language: "javascript",
                blockIndex: 0,
                sha256: createHash("sha256").update(code.trimEnd()).digest("hex"),
                reason: "Illustrative output in the baseline.",
            },
        ],
    });
    f.write(`${harness}/non-executable.json`, []);
    const result = f.check();
    assert.equal(result.status, 1, result.stdout);
    assert.equal(result.report.counts.uncovered, 1);
    assert.equal(result.report.counts.legacy, 1);
});

test("adding a complete marked example is covered without generating or committing a test file", t => {
    const f = fixture(t);
    f.write("docs/new.mdx", marked());
    const result = f.check();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.report.counts.covered, 1);
    assert.equal(result.report.counts.legacy, 2);
});

test("removing a current-layout baseline exemption cannot turn it into legacy debt", async t => {
    const { createHash } = await import("node:crypto");
    const f = fixture(t, false, {
        exemptions: [
            {
                page,
                language: "javascript",
                blockIndex: 0,
                sha256: createHash("sha256").update(code.trimEnd()).digest("hex"),
                reason: "Baseline signature.",
            },
        ],
    });
    f.write(`${harness}/non-executable.json`, []);
    const result = f.check();
    assert.equal(result.status, 1);
    assert.equal(result.report.counts.uncovered, 1);
});
