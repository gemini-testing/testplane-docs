import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { parse } from "@babel/parser";

const require = createRequire(import.meta.url);
const identifier = node => node?.type === "Identifier" && node.name;
const member = (node, prop) =>
    node?.type === "MemberExpression" && !node.computed && identifier(node.property) === prop;
const workerEvents = new Set(["NEW_BROWSER", "UPDATE_REFERENCE"]);

// The shared run is for observers, not arbitrary plugins. An interceptor returning
// a replacement event, or a plugin starting its own service, needs its own fixture.
const allowedNodes = new Set([
    "ArrowFunctionExpression",
    "FunctionExpression",
    "ObjectMethod",
    "BlockStatement",
    "ExpressionStatement",
    "CallExpression",
    "Identifier",
    "MemberExpression",
    "ObjectPattern",
    "ObjectExpression",
    "ObjectProperty",
    "IfStatement",
    "ReturnStatement",
    "ThisExpression",
    "BinaryExpression",
    "TemplateLiteral",
    "TemplateElement",
    "StringLiteral",
    "NumericLiteral",
    "BooleanLiteral",
    "NullLiteral",
]);

function registration(source) {
    const body = parse(source, { sourceType: "script" }).program.body;
    const call = body[0]?.expression;
    const [event, handler] = call?.arguments ?? [];
    if (
        body.length !== 1 ||
        call?.type !== "CallExpression" ||
        call.arguments.length !== 2 ||
        !(member(call.callee, "on") || member(call.callee, "intercept")) ||
        identifier(call.callee.object) !== "testplane" ||
        event?.type !== "MemberExpression" ||
        event.computed ||
        !identifier(event.property) ||
        !member(event.object, "events") ||
        identifier(event.object.object) !== "testplane" ||
        !["ArrowFunctionExpression", "FunctionExpression"].includes(handler?.type)
    )
        throw new Error(
            "Expected one direct testplane.on/intercept(testplane.events.NAME, handler)",
        );
    const bindings = new Set(["console"]);
    const bind = param => {
        if (identifier(param)) bindings.add(param.name);
        else if (param.type === "ObjectPattern") param.properties.forEach(p => bind(p.value));
        else throw new Error("Unsupported event handler parameter");
    };
    let logger = false;
    function visit(node, parent) {
        if (!allowedNodes.has(node.type)) throw new Error("Unsupported event syntax: " + node.type);
        if (node.params) node.params.forEach(bind);
        if (node.type === "Identifier") {
            const property =
                (parent?.type === "MemberExpression" && parent.property === node) ||
                (["ObjectProperty", "ObjectMethod"].includes(parent?.type) && parent.key === node);
            if (!property && !bindings.has(node.name))
                throw new Error("Unknown handler binding: " + node.name);
        }
        if (
            node.computed ||
            (node.type === "MemberExpression" &&
                ["__proto__", "constructor", "prototype"].includes(node.property.name)) ||
            (node.type === "ReturnStatement" && node.argument)
        )
            throw new Error("Only non-mutating observers belong in the shared event scenario");
        if (node.type === "CallExpression") {
            const callee = node.callee;
            const owner = identifier(callee.object);
            if (
                owner === "testParser" &&
                member(callee, "setController") &&
                node.arguments[0]?.value === "logger"
            )
                logger = true;
            else if (
                !(
                    (owner === "console" && (member(callee, "info") || member(callee, "log"))) ||
                    (owner === "cli" && member(callee, "option")) ||
                    (member(callee, "fullTitle") &&
                        (bindings.has(owner) || callee.object.type === "ThisExpression"))
                )
            )
                throw new Error("Unsupported call in the event observer");
        }
        for (const field of Object.values(node)) {
            if (Array.isArray(field))
                field
                    .filter(child => child?.type && !child.type.startsWith("Comment"))
                    .forEach(child => visit(child, node));
            else if (field?.type) visit(field, node);
        }
    }
    visit(handler);
    return { event: event.property.name, logger };
}

function writeScenario(dir, examples) {
    const observations = path.join(dir, "observed.jsonl");
    // The exact source registers on the actual master/worker instance. Each observer
    // gets a real Node Console with a separate sink, so another handler cannot satisfy it.
    // Keep only the identity and process role; do not publish message contents.
    const plugin = path.join(dir, "observer.cjs");
    fs.writeFileSync(
        plugin,
        [
            'const { Console } = require("node:console");',
            'const { Writable } = require("node:stream");',
            'const { appendFileSync } = require("node:fs");',
            "module.exports = testplane => {",
            "  const log = id => new Console(new Writable({write(data, encoding, done) {",
            "    if (data.toString().trim()) appendFileSync(" +
                JSON.stringify(observations) +
                ', JSON.stringify({id, role: testplane.isWorker() ? "worker" : "master"}) + "\\n");',
            "    done();",
            "  }}));",
            ...examples.map(
                e => `{\nconst console = log(${JSON.stringify(e.id)});\n${e.source}\n}`,
            ),
            "};",
            "",
        ].join("\n"),
    );
    const caps = require("./testplane.config.js").browsers.chrome.desiredCapabilities;
    const config = {
        gridUrl: "local",
        headless: true,
        isolation: false,
        resetCursor: false,
        retry: 1,
        sessionsPerBrowser: 1,
        testsPerSession: 1,
        testTimeout: 20000,
        httpTimeout: 60000,
        profiler: { level: 1 },
        screenshotsDir: path.join(dir, "references"),
        plugins: { [plugin]: true },
        sets: { scenario: { files: ["scenario.testplane.js"], browsers: ["chrome"] } },
        browsers: { chrome: { desiredCapabilities: caps } },
    };
    fs.writeFileSync(
        path.join(dir, "testplane.config.js"),
        "module.exports = " + JSON.stringify(config) + ";\n",
    );
    fs.writeFileSync(
        path.join(dir, "scenario.testplane.js"),
        [
            'describe("event scenario", () => {',
            ...(examples.some(e => e.logger) ? ['  testplane.logger.log("parsed");'] : []),
            '  it("passes", async ({browser}) => {',
            '    await browser.url("data:text/html,<title>Event example</title><h1>Reference</h1>");',
            '    await expect(browser).toHaveTitle("Event example");',
            '    await browser.assertView("heading", "h1");',
            "  });",
            '  it("fails", () => { throw new Error("intentional event fixture failure"); });',
            '  it.skip("pending", () => {});',
            "});",
            "",
        ].join("\n"),
    );
}

function jsonl(file) {
    return fs
        .readFileSync(file, "utf8")
        .split("\n")
        .filter(Boolean)
        .map(line => JSON.parse(line));
}

function checkScenario(dir, envOverrides) {
    const bin = path.join(path.dirname(require.resolve("testplane")), "../../bin/testplane");
    const env = Object.fromEntries(
        [
            "HOME",
            "PATH",
            "TMPDIR",
            "TEMP",
            "TMP",
            "SystemRoot",
            "LANG",
            "CI",
            "GITHUB_ACTIONS",
            "RUNNER_OS",
            "LD_LIBRARY_PATH",
        ]
            .filter(k => process.env[k])
            .map(k => [k, process.env[k]]),
    );
    const child = spawnSync(
        process.execPath,
        [
            bin,
            "--update-refs",
            "--reporter",
            JSON.stringify({ type: "jsonl", path: "outcomes.jsonl" }),
        ],
        { cwd: dir, env: { ...env, ...envOverrides }, timeout: 90000, stdio: "ignore" },
    );
    if (
        child.error ||
        child.signal ||
        child.status !== 1 ||
        !fs.existsSync(path.join(dir, "outcomes.jsonl"))
    )
        throw new Error(
            `Event scenario did not produce its expected failure report (exit ${child.status ?? child.signal})`,
        );
    const rows = jsonl(path.join(dir, "outcomes.jsonl"));
    assert.deepEqual(rows.map(r => [r.fullTitle, r.browserId, r.status].join(":")).sort(), [
        "event scenario fails:chrome:fail",
        "event scenario fails:chrome:retry",
        "event scenario passes:chrome:success",
        "event scenario pending:chrome:skipped",
    ]);
    for (const row of rows.filter(r => r.status === "fail" || r.status === "retry"))
        assert.ok(
            row.error?.includes("intentional event fixture failure"),
            "Unexpected fixture failure",
        );
    const observations = path.join(dir, "observed.jsonl");
    return fs.existsSync(observations) ? jsonl(observations) : [];
}

export async function runEvents(entries, artifacts, envOverrides = {}) {
    if (!entries.length) return [];
    const groups = new Map();
    for (const entry of entries) {
        const hash = createHash("sha256").update(entry.source).digest("hex");
        assert.equal(hash, entry.sha256, "Event source hash does not match its manifest");
        if (!groups.has(hash)) groups.set(hash, { id: hash, source: entry.source, sources: [] });
        groups.get(hash).sources.push({ page: entry.page, line: entry.line });
    }
    const examples = [...groups.values()];
    const results = examples.map(e => ({
        key: "event:" + e.id,
        sources: e.sources,
        status: "passed",
    }));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-example-events-"));
    try {
        examples.forEach((e, i) => {
            try {
                Object.assign(e, registration(e.source));
            } catch (error) {
                Object.assign(results[i], { status: "failed", error: error.message });
            }
        });
        // Translations may register the same named controller or CLI option. Each
        // version must run on a fresh instance, not overwrite another example.
        const batches = [];
        for (const e of examples.filter(e => e.event)) {
            let batch = batches.find(entries =>
                entries.every(
                    other =>
                        !(e.logger && other.logger) &&
                        !(e.event === "CLI" && other.event === "CLI"),
                ),
            );
            if (!batch) batches.push((batch = []));
            batch.push(e);
        }
        for (const [index, batch] of batches.entries()) {
            const workdir = path.join(dir, String(index));
            fs.mkdirSync(workdir);
            writeScenario(workdir, batch);
            const seen = checkScenario(workdir, envOverrides);
            for (const e of batch) {
                const role = workerEvents.has(e.event) ? "worker" : "master";
                if (!seen.some(hit => hit.id === e.id && hit.role === role))
                    Object.assign(results[examples.indexOf(e)], {
                        status: "failed",
                        error: `No output from ${e.event} handler in the ${role}`,
                    });
            }
        }
    } catch (error) {
        for (const result of results) {
            if (result.status !== "failed")
                Object.assign(result, {
                    status: "failed",
                    error: error.message
                        .replaceAll(dir, "<event project>")
                        .replaceAll(path.dirname(require.resolve("testplane")), "<Testplane>"),
                });
        }
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(path.join(artifacts, "events.json"), JSON.stringify(results, null, 2) + "\n");
    return results;
}
