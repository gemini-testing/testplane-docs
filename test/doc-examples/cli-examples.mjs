import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { cliCommands } from "./project-recipes.mjs";

const require = createRequire(import.meta.url);
const nested = "test with nested path";
const other = "test with other path";
const alternative = "alternative project";
const copy = "chrome-copy";

function writeConfig(dir, filename, config) {
    fs.writeFileSync(
        path.join(dir, filename),
        "module.exports = " + JSON.stringify(config) + ";\n",
    );
}

export function createCliProject(
    dir,
    caps = require("./testplane.config.js").browsers.chrome.desiredCapabilities,
) {
    const list = path.join(dir, "list");
    const run = path.join(dir, "run");
    fs.mkdirSync(list);
    fs.mkdirSync(run);
    const files = ["nested", "other", "alternative"].map(name =>
        path.join(dir, name + ".testplane.js"),
    );
    const check =
        'async ({browser}) => require("node:assert/strict").equal(await browser.execute(() => 40 + 2), 42)';
    for (const [index, title] of ["nested path", "other path", alternative].entries()) {
        const it = `it(${JSON.stringify(title)}, ${check})`;
        fs.writeFileSync(
            files[index],
            (index === 2 ? it : `describe("test", () => describe("with", () => ${it}))`) + ";\n",
        );
    }

    const chrome = { desiredCapabilities: caps };
    const base = {
        gridUrl: "local",
        headless: true,
        retry: 0,
        testsPerSession: 1,
        browsers: { chrome },
    };
    const desktop = { files: [files[0]], browsers: ["chrome"] };
    const archive = { files: [files[1]], browsers: ["chrome"] };
    writeConfig(run, "testplane.config.js", { ...base, sets: { desktop, archive } });

    // Only discovery sees the second ID; no second browser is provisioned.
    const observer = path.join(list, "observer.cjs");
    fs.writeFileSync(
        observer,
        [
            'const fs = require("node:fs");',
            'const path = require("node:path");',
            "module.exports = runner => runner.on(runner.events.AFTER_TESTS_READ, () => {",
            '    fs.appendFileSync(path.join(__dirname, "events"), "read\\n");',
            "});",
            "",
        ].join("\n"),
    );
    const discovery = { ...base, plugins: { [observer]: true } };
    writeConfig(list, "testplane.config.js", {
        ...discovery,
        browsers: { chrome, [copy]: chrome },
        sets: {
            desktop: { ...desktop, browsers: ["chrome", copy] },
            archive: { ...archive, browsers: [copy] },
        },
    });
    writeConfig(list, "local.testplane.config.ts", {
        ...discovery,
        sets: { alternative: { files: [files[2]], browsers: ["chrome"] } },
    });
}

function expectedDiscovery(args) {
    const value = flag => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
    const records = value("--config")
        ? [[alternative, "chrome", "alternative"]]
        : [
              [nested, "chrome", "desktop"],
              [nested, copy, "desktop"],
              [other, copy, "archive"],
          ];
    const grep = value("--grep");
    return records
        .filter(
            ([title, browser, set]) =>
                (!value("--browser") || browser === value("--browser")) &&
                (!value("--set") || set === value("--set")) &&
                (!grep || new RegExp(grep).test(title)),
        )
        .map(([title, browser]) => [title, browser])
        .sort();
}

function treeTests(nodes, prefix = []) {
    return nodes.flatMap(node => {
        const titles = [...prefix, node.title];
        return node.browserIds
            ? [{ ...node, titlePath: titles }]
            : treeTests([...node.suites, ...node.tests], titles);
    });
}

function checkDiscovery(args, cwd, invoke) {
    const output = path.join(cwd, "tests.json");
    const events = path.join(cwd, "events");
    if (args.includes("--output-file")) fs.rmSync(output, { force: true });
    fs.rmSync(events, { force: true });
    const stdout = invoke(args);
    const result = JSON.parse(
        args.includes("--output-file") ? fs.readFileSync(output, "utf8") : stdout,
    );
    const tests = args.includes("tree") ? treeTests(result) : result;
    const pairs = tests.flatMap(test => {
        assert.ok(!test.pending, "Unexpected pending test in list");
        return test.browserIds.map(id => [test.titlePath.join(" "), id]);
    });
    const expected = expectedDiscovery(args);
    assert.ok(
        expected.length,
        "The documented command should select at least one test in this project",
    );
    assert.deepEqual(pairs.sort(), expected, "Wrong test and browser selection");
    const observed = fs.existsSync(events) ? fs.readFileSync(events, "utf8") : "";
    assert.equal(
        observed,
        args.includes("--silent") ? "" : "read\n",
        "Unexpected AFTER_TESTS_READ observation",
    );
}

export function checkCLI(source, dir, linkerEnv = {}) {
    const packageDir = path.resolve(path.dirname(require.resolve("testplane")), "../..");
    for (const args of cliCommands(source)) {
        const cwd = path.join(dir, args[0] === "list-tests" ? "list" : "run");
        const invoke = argv =>
            execFileSync(process.execPath, [path.join(packageDir, "bin/testplane"), ...argv], {
                cwd,
                encoding: "utf8",
                env: { ...process.env, ...linkerEnv },
                timeout: 60000,
                stdio: ["ignore", "pipe", "pipe"],
            }).trim();
        if (args.includes("--help")) {
            const cmd = args[0] === "--help" ? "testplane" : args[0];
            assert.ok(invoke(args).includes(`Usage: ${cmd} `), "No help for " + cmd);
        } else if (args[0] === "list-tests") {
            // An empty marker means silence only if the same project emits it without the flag.
            if (args.includes("--silent"))
                checkDiscovery(
                    args.filter(arg => arg !== "--silent"),
                    cwd,
                    invoke,
                );
            checkDiscovery(args, cwd, invoke);
        } else if (!args.length || ["--set", "--browser"].includes(args[0])) {
            const output = path.join(cwd, "run.jsonl");
            fs.rmSync(output, { force: true });
            invoke([...args, "--reporter", JSON.stringify({ type: "jsonl", path: output })]);
            const rows = fs
                .readFileSync(output, "utf8")
                .trim()
                .split("\n")
                .map(line => JSON.parse(line));
            const titles = args.includes("--set") ? [nested] : [nested, other];
            assert.deepEqual(
                rows.map(r => [r.fullTitle, r.browserId, r.status]).sort(),
                titles.map(t => [t, "chrome", "success"]).sort(),
            );
        } else if (args[0] === "--version") {
            assert.equal(invoke(args), require(path.join(packageDir, "package.json")).version);
        } else {
            const stdout = invoke(args);
            const { browserName, browserVersion } = require(path.join(cwd, "testplane.config.js"))
                .browsers.chrome.desiredCapabilities;
            if (args[0] === "config") {
                const parsed = JSON.parse(stdout);
                assert.deepEqual(Object.keys(parsed.browsers), ["chrome"]);
                assert.equal(
                    parsed.browsers.chrome.desiredCapabilities.browserVersion,
                    browserVersion,
                );
                if (args.includes("--space")) {
                    const indent = Number(args[args.indexOf("--space") + 1]);
                    assert.equal(stdout, JSON.stringify(parsed, null, indent));
                }
            } else if (args[0] === "list-browsers") {
                const tags = !args.includes("ids");
                if (args.includes("plain"))
                    assert.equal(stdout, tags ? `${browserName}@${browserVersion}` : "chrome");
                else
                    assert.deepEqual(
                        JSON.parse(stdout),
                        tags ? [{ browserName, browserVersion }] : ["chrome"],
                    );
            } else throw new Error("Unknown CLI check: " + args[0]);
        }
    }
}
