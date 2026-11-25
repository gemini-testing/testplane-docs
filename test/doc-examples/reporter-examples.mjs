import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { configModule } from "./project-recipes.mjs";

const require = createRequire(import.meta.url);
const testplane = path.resolve(path.dirname(require.resolve("testplane")), "../..");
const htmlPlugin = "html-reporter/testplane";
const reportConfig = { plugins: { [htmlPlugin]: { enabled: true, path: "html-report" } } };
const json = file => JSON.parse(fs.readFileSync(file, "utf8"));

// Each CLI sample has a distinct observable effect. In particular, never pass
// arbitrary documentation-supplied paths to the screenshot removal command.
const commands = new Map([
    ["npx testplane sample.testplane.js --html-reporter-path custom-report", "cliPath"],
    ["html_reporter_path=custom-report npx testplane sample.testplane.js", "envPath"],
    ["npx testplane merge-reports html-report custom-report -d merged-report", "cliMerge"],
    [
        "npx testplane remove-unused-screens -p 'testplane-screens-folder' --skip-questions",
        "remove",
    ],
    ["npx testplane remove-unused-screens --help", "help"],
]);

function role({ page, source, language }) {
    if (language === "bash") {
        if (commands.has(source)) return commands.get(source);
    } else if (page.endsWith("/html-reporter-config-examples.mdx")) return "config";
    else if (page.endsWith("/html-reporter-events.mdx")) {
        if (source.startsWith("module.exports")) return "schema";
        for (const [event, kind] of Object.entries({
            DATABASE_CREATED: "database",
            TEST_SCREENSHOTS_SAVED: "screenshots",
            REPORT_SAVED: "saved",
        }))
            if (source.includes(".events." + event)) return kind;
    } else if (page.endsWith("/html-reporter-api.mdx")) {
        if (source.startsWith("async function getSuccessTestRunIds(")) return "runIds";
        for (const [method, kind] of Object.entries({
            addExtraItem: "menu",
            downloadDatabases: "download",
            mergeDatabases: "merge",
            getTestsTreeFromDatabase: "tree",
        }))
            if (source.includes(".htmlReporter." + method + "(")) return kind;
    }
    throw new Error("No HTML Reporter scenario for this example");
}

function writeProject(dir, items) {
    fs.symlinkSync(path.dirname(testplane), path.join(dir, "node_modules"), "junction");
    const write = (name, text) => {
        const file = path.join(dir, name);
        fs.writeFileSync(file, text + "\n");
        return file;
    };
    let documented = reportConfig;
    if (items.config)
        documented = require(write("documented.cjs", configModule(items.config.source)));
    assert.deepEqual(
        documented,
        reportConfig,
        "Expected the documented local HTML Reporter plugin",
    );
    const base = {
        ...documented,
        gridUrl: "local",
        headless: true,
        isolation: false,
        resetCursor: false,
        retry: 0,
        browsers: { chrome: require("./testplane.config.js").browsers.chrome },
        sets: { example: { files: ["sample.testplane.js"] } },
    };
    const saveConfig = plugins =>
        write(
            "testplane.config.js",
            "module.exports = " + JSON.stringify({ ...base, plugins }) + ";",
        );
    const plugins = { ...base.plugins };
    const examples = {};
    for (const [kind, item] of Object.entries(items)) {
        if (kind === "config" || item.language === "bash") continue;
        if (kind === "schema") plugins[write("schema.cjs", item.source)] = { enabled: true };
        else {
            const after = {
                download: "return dbPaths;",
                tree: "return dbTree;",
                runIds: "return getSuccessTestRunIds({ testplane, mergedDbPath: context });",
            };
            const async = ["download", "tree", "merge", "runIds"].includes(kind);
            examples[kind] = write(
                kind + ".cjs",
                `module.exports = ${async ? "async " : ""}(testplane, ${async ? "context" : "console"}) => {\n${item.source}\n${after[kind] || ""}\n};`,
            );
        }
    }
    plugins[require.resolve("./fixtures/reporter-observer.cjs")] = { examples };
    saveConfig(plugins);
    write("release-notes.html", "<!doctype html><title>Release notes</title>");
    write(
        "sample.testplane.js",
        [
            'it("renders swatch", async ({ browser }) => {',
            '  await browser.url("data:text/html,<style>div{width:40px;height:40px;background:green}</style><div id=swatch></div>?testRunId=doc-run");',
            `  const { solidReference } = require(${JSON.stringify(require.resolve("./fixtures/solid-image.cjs"))});`,
            '  await solidReference(browser, "plain", { width: 40, height: 40, color: "#008000" });',
            '  await browser.assertView("plain", "#swatch");',
            "});",
        ].join("\n"),
    );
    return () => saveConfig(base.plugins);
}

function readDatabase(file, inspect) {
    const db = new DatabaseSync(file, { readOnly: true });
    try {
        return inspect(db);
    } finally {
        db.close();
    }
}

function assertContents(dir, reportName, expectedDbs = 1) {
    const report = path.join(dir, reportName);
    assert.match(
        fs.readFileSync(path.join(report, "index.html"), "utf8"),
        /<title>HTML report<\/title>/,
    );
    const { dbUrls, jsonUrls } = json(path.join(report, "databaseUrls.json"));
    assert.equal(new Set(dbUrls).size, expectedDbs);
    assert.deepEqual(jsonUrls, []);
    for (const name of dbUrls) {
        readDatabase(path.join(report, name), db => {
            const rows = db.prepare("SELECT suiteName, name, status, imagesInfo FROM suites").all();
            assert.equal(rows.length, 1);
            const [row] = rows;
            assert.deepEqual(
                [row.suiteName, row.name, row.status],
                ["renders swatch", "chrome", "success"],
            );
            const [image] = JSON.parse(row.imagesInfo);
            assert.equal(image.stateName, "plain");
            assert.equal(image.status, "success");
            assert.ok(fs.statSync(path.join(report, image.expectedImg.path)).size > 0);
        });
    }
}

function runScenario(dir, items, overrides) {
    const plainConfig = writeProject(dir, items);
    const env = Object.fromEntries(
        [
            "PATH",
            "HOME",
            "TMPDIR",
            "TMP",
            "TEMP",
            "SystemRoot",
            "LANG",
            "CI",
            "GITHUB_ACTIONS",
            "RUNNER_OS",
            "LD_LIBRARY_PATH",
        ]
            .filter(name => process.env[name])
            .map(name => [name, process.env[name]]),
    );
    const run = (args, cliEnv = {}) =>
        execFileSync(process.execPath, [path.join(testplane, "bin/testplane"), ...args], {
            cwd: dir,
            env: { ...env, ...overrides, ...cliEnv },
            timeout: 90000,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });
    const file = name => path.join(dir, name);
    const log = name => fs.readFileSync(file(name), "utf8").trim();
    run([]);
    assertContents(dir, "html-report");
    assert.equal(log("report-saved"), "html-report");
    if (items.database) assert.match(log("database.log"), /^\d+\.\d+\.\d+$/);
    if (items.screenshots)
        assert.equal(log("screenshots.log"), "renders swatch.chrome 0 plain success");
    if (items.saved) assert.equal(log("saved.log"), "html-report");
    if (items.schema)
        readDatabase(file("html-report/sqlite.db"), db =>
            assert.deepEqual(
                db
                    .prepare("PRAGMA table_info(run_notes)")
                    .all()
                    .map(row => [row.name, row.type]),
                [["note", "TEXT"]],
            ),
        );
    if (items.merge)
        readDatabase(file("merged/sqlite.db"), db =>
            assert.ok(
                db
                    .prepare(
                        "SELECT COUNT(*) AS n FROM suites WHERE name = 'chrome' AND status = 'success'",
                    )
                    .get().n > 0,
            ),
        );
    if (items.menu) {
        const { apiValues } = require(file("html-report/data.js"));
        assert.equal(apiValues.extraItems["Release notes"], "../release-notes.html");
        assert.ok(fs.existsSync(file("release-notes.html")));
    }

    plainConfig(); // CLI commands must not register the example observers again.
    for (const kind of ["cliPath", "envPath", "cliMerge", "remove", "help"]) {
        const item = items[kind];
        if (!item) continue;
        const words = item.source.split(" ").map(s => s.replace(/^'|'$/g, ""));
        const cliEnv = words[0].includes("=") ? Object.fromEntries([words.shift().split("=")]) : {};
        assert.deepEqual(words.splice(0, 2), ["npx", "testplane"]);
        if (kind === "envPath" && fs.existsSync(file("custom-report")))
            fs.renameSync(file("custom-report"), file("cli-report"));
        if (kind === "cliMerge" && !fs.existsSync(file("custom-report")))
            fs.cpSync(file("html-report"), file("custom-report"), { recursive: true });
        if (kind === "remove") {
            fs.mkdirSync(file("testplane-screens-folder"));
            fs.copyFileSync(
                fs
                    .readdirSync(file("testplane/screens"), { recursive: true })
                    .map(f => file("testplane/screens/" + f))
                    .find(f => f.endsWith("/plain.png")),
                file("testplane-screens-folder/obsolete.png"),
            );
        }
        const output = run(words, cliEnv);
        if (kind === "cliPath" || kind === "envPath") assertContents(dir, "custom-report");
        if (kind === "cliMerge") assertContents(dir, "merged-report", 2);
        if (kind === "help")
            assert.match(output, /Usage: remove-unused-screens[\s\S]*--skip-questions/);
        if (kind === "remove") {
            assert.ok(!fs.existsSync(file("testplane-screens-folder/obsolete.png")));
            assert.match(output, /1 reference images were removed/);
            assert.ok(
                fs
                    .readdirSync(file("testplane/screens"), { recursive: true })
                    .some(f => f.endsWith("plain.png")),
            );
        }
    }
}

export async function runReporter(entries, artifacts, envOverrides = {}) {
    const groups = new Map();
    for (const e of entries) {
        assert.equal(createHash("sha256").update(e.source).digest("hex"), e.sha256);
        if (!groups.has(e.sha256))
            groups.set(e.sha256, {
                ...e,
                result: { key: "reporter:" + e.sha256, status: "passed", sources: [] },
            });
        groups.get(e.sha256).result.sources.push({ page: e.page, line: e.line });
    }
    const fail = (entry, error) =>
        Object.assign(entry.result, { status: "failed", error: error.message });
    const batches = [];
    for (const item of groups.values()) {
        try {
            const kind = role(item);
            let batch = batches.find(b => !b[kind]);
            if (!batch) batches.push((batch = {}));
            batch[kind] = item;
        } catch (error) {
            fail(item, error);
        }
    }
    for (const batch of batches) {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-example-reporter-"));
        try {
            runScenario(dir, batch, envOverrides);
        } catch (error) {
            const clean = new Error(error.message.replaceAll(dir, "<reporter project>"));
            Object.values(batch).forEach(e => fail(e, clean));
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }
    const results = [...groups.values()].map(e => e.result);
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(
        path.join(artifacts, "reporter.json"),
        JSON.stringify(results, null, 2) + "\n",
    );
    return results;
}
