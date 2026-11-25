import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "@babel/parser";

const require = createRequire(import.meta.url);
const apiModules = new Set(["testplane", "node:assert/strict"]);
const methods = new Set(
    "once isFailed getBrowserIds getBrowsers mapTests sortTests eachTest eachTestByVersions disableAll enableAll disableTest enableTest getRootSuite eachRootSuite getTests fullTitle push sort localeCompare".split(
        " ",
    ),
);
const nodes = new Set(
    "Program VariableDeclaration VariableDeclarator Identifier ObjectPattern ObjectProperty ObjectExpression ArrayExpression AwaitExpression CallExpression ArrowFunctionExpression FunctionExpression BlockStatement ReturnStatement ExpressionStatement AssignmentExpression MemberExpression StringLiteral RegExpLiteral BooleanLiteral NumericLiteral NullLiteral".split(
        " ",
    ),
);
const helpers = new Set(["skip.in", "skip.notIn", "only.in", "only.notIn", "also.in"]);
const forbidden = new Set(["constructor", "prototype", "__proto__"]);
const title = "tasks.testplane.js";

function prepare({ source, language }) {
    if (["ts", "typescript"].includes(language)) {
        const ts = require("typescript");
        source = ts.transpileModule(source, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
        }).outputText;
    }
    const program = parse(source, {
        sourceType: "script",
        allowAwaitOutsideFunction: true,
    }).program;
    const bindings = new Set([
        "testplane",
        "testCollection",
        "assert",
        "require",
        "describe",
        "it",
    ]);
    let helper,
        apiCalls = 0,
        declarations = 0;
    const bind = p => {
        if (p.type === "Identifier") bindings.add(p.name);
        else if (p.type === "ObjectPattern") p.properties.forEach(prop => bind(prop.value));
        else throw Error("Unsupported binding in collection example");
    };
    function visit(node, parent) {
        if (
            !nodes.has(node.type) ||
            node.computed ||
            (node.type === "Identifier" && forbidden.has(node.name))
        )
            throw Error("Unsupported collection syntax: " + (node.name ?? node.type));
        if (node.params) node.params.forEach(bind);
        if (node.type === "VariableDeclarator") bind(node.id);
        if (node.type === "Identifier") {
            const key =
                (parent?.type === "MemberExpression" && parent.property === node) ||
                (parent?.type === "ObjectProperty" && parent.key === node);
            if (!key && !bindings.has(node.name))
                throw Error("Unknown collection binding: " + node.name);
        }
        if (
            node.type === "AssignmentExpression" &&
            (node.operator !== "=" || node.left.type !== "Identifier")
        )
            throw Error("Only local state may be assigned in a collection example");
        if (node.type === "CallExpression") {
            const callee = node.callee;
            const args = node.arguments;
            const name = callee.property?.name;
            const owner = callee.object?.name;
            const directive =
                callee.object?.object?.name === "testplane" &&
                callee.object.property?.name + "." + name;
            if (directive && helpers.has(directive)) {
                if (
                    helper ||
                    args[0]?.type !== "StringLiteral" ||
                    !["chrome", "ie8"].includes(args[0].value)
                )
                    throw Error("Expected one documented browser helper with a literal browser ID");
                if (
                    args.length > 3 ||
                    (args[1] && args[1].type !== "StringLiteral") ||
                    (args[2] &&
                        !(
                            args[2].type === "ObjectExpression" &&
                            args[2].properties.length === 1 &&
                            args[2].properties[0].key?.name === "silent" &&
                            args[2].properties[0].value?.type === "BooleanLiteral"
                        ))
                )
                    throw Error("Unsupported browser helper options");
                helper = {
                    directive,
                    browser: args[0].value,
                    reason: args[1]?.value,
                    silent: args[2]?.properties[0].value.value,
                };
            } else if (callee.type === "Identifier" && ["describe", "it"].includes(callee.name)) {
                if (
                    args.length !== 2 ||
                    args[0].type !== "StringLiteral" ||
                    !["FunctionExpression", "ArrowFunctionExpression"].includes(args[1].type)
                )
                    throw Error("Expected a literal, unconditional helper example");
                if (callee.name === "it") declarations++;
            } else if (
                callee.name === "require" &&
                args.length === 1 &&
                apiModules.has(args[0].value)
            ) {
                // Only installed Testplane and Node's strict assertions, never a supplied file path.
            } else if (owner === "assert" && ["equal", "deepEqual", "ok"].includes(name)) {
                // Visible assertions run with the real node:assert/strict.
            } else if (
                owner === "Testplane" &&
                name === "create" &&
                args.length === 1 &&
                args[0].value === "./testplane.config.js"
            ) {
                apiCalls++;
            } else if (
                owner === "testplane" &&
                name === "readTests" &&
                args.length <= 2 &&
                args[0]?.type === "ArrayExpression" &&
                args[0].elements.length === 1 &&
                args[0].elements[0]?.value === title &&
                (!args[1] ||
                    (args[1].type === "ObjectExpression" &&
                        args[1].properties.every(p =>
                            ["browsers", "grep", "silent"].includes(p.key?.name),
                        )))
            ) {
                apiCalls++;
            } else if (methods.has(name)) apiCalls++;
            else throw Error("Unsupported collection method: " + (name ?? callee.name));
        }
        for (const v of Object.values(node)) {
            if (Array.isArray(v))
                v.filter(n => n?.type && !n.type.startsWith("Comment")).forEach(n =>
                    visit(n, node),
                );
            else if (v?.type) visit(v, node);
        }
    }
    visit(program);
    if (helper) {
        if (declarations > 1 || apiCalls)
            throw Error("A helper example must only select the next test");
    } else if (
        declarations ||
        !apiCalls ||
        !program.body.some(s => s.expression?.callee?.object?.name === "assert")
    )
        throw Error(
            "A collection example must exercise a public method and assert its observable result",
        );
    return { source, helper, declarations };
}

function config(helper) {
    const browsers = {
        chrome: { desiredCapabilities: { browserName: "chrome", browserVersion: "150" } },
    };
    if (helper)
        browsers.ie8 = {
            desiredCapabilities: { browserName: "internet explorer", version: "8" },
            passive: helper.directive === "also.in",
        };
    else
        browsers.firefox = {
            desiredCapabilities: { browserName: "firefox", browserVersion: "140" },
        };
    return {
        gridUrl: "local",
        browsers,
        sets: { examples: { files: ["*.testplane.js"], browsers: Object.keys(browsers) } },
    };
}

async function checkHelper(Testplane, example, file) {
    const { source, helper: h, declarations } = example;
    fs.writeFileSync(
        file,
        [
            source,
            ...(!declarations ? ['it("selection target", () => {});'] : []),
            'it("unaffected control", () => {});',
            "",
        ].join("\n"),
    );
    const testplane = await Testplane.create(config(h));
    const collection = await testplane.readTests([file]);
    for (const browser of ["chrome", "ie8"]) {
        const tests = collection.mapTests(browser, test => test);
        assert.equal(tests.length, 2);
        const control = tests.find(test => test.title === "unaffected control");
        const target = tests.find(test => test !== control);
        assert.ok(target && control, "Expected a selection target and an unaffected sibling");
        assert.equal(control.pending, false);
        assert.equal(control.disabled, h.directive === "also.in" && browser === "ie8");
        const [action, selector] = h.directive.split(".");
        const matches = selector === "in" ? browser === h.browser : browser !== h.browser;
        const skipped = action === "skip" && matches;
        assert.equal(target.pending, skipped && !h.silent, "Wrong pending flag in " + browser);
        assert.equal(
            target.disabled,
            Boolean((skipped && h.silent) || (action === "only" && !matches)),
            "Wrong disabled flag in " + browser,
        );
        if (target.pending) assert.equal(target.skipReason, h.reason);
    }
}

async function worker() {
    const { default: Testplane } = require("testplane");
    const inputs = JSON.parse(fs.readFileSync("inputs.json", "utf8"));
    fs.writeFileSync("testplane.config.js", "module.exports = " + JSON.stringify(config()) + ";\n");
    fs.writeFileSync(
        title,
        'describe("Tasks", () => { it("opens", () => {}); it("saves", () => {}); });\n',
    );
    const results = [];
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const apiRequire = name => {
        assert.ok(apiModules.has(name), "Unsupported collection import");
        return require(name);
    };
    for (const [i, e] of inputs.entries()) {
        try {
            if (e.helper) await checkHelper(Testplane, e, "helper-" + i + ".testplane.js");
            else {
                const testplane = await Testplane.create(config());
                const collection = await testplane.readTests([title], { silent: true });
                assert.deepEqual(
                    collection.mapTests("chrome", test => test.title),
                    ["opens", "saves"],
                );
                assert.deepEqual(
                    collection.mapTests("firefox", test => test.disabled),
                    [false, false],
                );
                const exercise = new AsyncFunction(
                    "testplane",
                    "testCollection",
                    "assert",
                    "require",
                    '"use strict";\n{\n' + e.source + "\n}",
                );
                await exercise(testplane, collection, assert, apiRequire);
            }
            results.push({ id: e.id, status: "passed" });
        } catch (error) {
            results.push({
                id: e.id,
                status: "failed",
                error: error.message.replaceAll(process.cwd(), "<collection project>"),
            });
        }
    }
    fs.writeFileSync("results.json", JSON.stringify(results));
}

export async function runCollection(entries, artifacts) {
    if (!entries.length) return [];
    const groups = new Map();
    for (const e of entries) {
        const id = createHash("sha256").update(e.source).digest("hex");
        assert.equal(id, e.sha256, "Collection source hash does not match its manifest");
        if (!groups.has(id))
            groups.set(id, { id, source: e.source, language: e.language, sources: [] });
        groups.get(id).sources.push({ page: e.page, line: e.line });
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-example-collection-"));
    const results = [];
    try {
        const inputs = [];
        for (const g of groups.values()) {
            try {
                inputs.push({ id: g.id, ...prepare(g) });
            } catch (error) {
                results.push({ id: g.id, status: "failed", error: error.message });
            }
        }
        if (inputs.length) {
            fs.writeFileSync(path.join(dir, "inputs.json"), JSON.stringify(inputs));
            const child = spawnSync(
                process.execPath,
                [fileURLToPath(import.meta.url), "--worker"],
                {
                    cwd: dir,
                    timeout: 45000,
                    stdio: "ignore",
                    env: Object.fromEntries(
                        ["HOME", "PATH", "TMPDIR", "TEMP", "TMP", "SystemRoot", "LANG"]
                            .filter(k => process.env[k])
                            .map(k => [k, process.env[k]]),
                    ),
                },
            );
            if (child.error || child.status !== 0)
                throw Error("Testplane collection discovery worker did not finish");
            const records = JSON.parse(fs.readFileSync(path.join(dir, "results.json"), "utf8"));
            assert.deepEqual(
                records.map(r => r.id),
                inputs.map(i => i.id),
                "Incomplete collection results",
            );
            results.push(...records);
        }
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    const rows = results.map(({ id, ...result }) => ({
        key: "collection:" + id,
        sources: groups.get(id).sources,
        ...result,
    }));
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(path.join(artifacts, "collection.json"), JSON.stringify(rows, null, 2) + "\n");
    return rows;
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href &&
    process.argv[2] === "--worker"
)
    await worker();
