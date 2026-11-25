import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { configModule, withFixtureBrowsers } from "./project-recipes.mjs";
import { createCliProject, checkCLI } from "./cli-examples.mjs";

const require = createRequire(import.meta.url);
const { Config } = require(path.join(path.dirname(require.resolve("testplane")), "config"));
export async function checkConfig(source, tmp) {
    const name = path.join(tmp, "example.cjs");
    fs.writeFileSync(name, configModule(source));
    const imported = require(name);
    delete require.cache[name];
    const options = imported.__esModule ? imported.default : imported;
    assert.ok(
        options &&
            typeof options === "object" &&
            !Array.isArray(options) &&
            Object.keys(options).length,
        "Expected nonempty config options",
    );
    const parsed = await Config.create(withFixtureBrowsers(options));
    assert.ok(parsed.getBrowserIds().length, "No browsers in the documented config");
    for (const key of Object.keys(options))
        assert.ok(key in parsed, `Option not present in the resolved config: ${key}`);
}

export async function runProjects(entries, artifacts, linkerEnv = {}) {
    const groups = new Map();
    for (const entry of entries) {
        const key = entry.kind + ":" + entry.sha256;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(entry);
    }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "doc-examples-project-"));
    const results = [];
    try {
        if (entries.some(e => e.kind === "cli")) createCliProject(tmp);
        for (const [key, sources] of groups) {
            const { source, kind, page, line } = sources[0];
            if (["event", "collection", "reporter"].includes(kind)) continue;
            const result = {
                key,
                sources: sources.map(({ page, line }) => ({ page, line })),
                status: "passed",
            };
            try {
                if (kind === "config")
                    await checkConfig(source, fs.mkdtempSync(path.join(tmp, "config-")));
                else if (kind === "cli") checkCLI(source, tmp, linkerEnv);
                else throw new Error("Unknown project recipe: " + kind);
            } catch (error) {
                result.status = "failed";
                result.error = error.message;
                console.error(`${page}:${line}: ${error.message}`);
            }
            results.push(result);
        }
        const events = entries.filter(e => e.kind === "event");
        if (events.length) {
            const { runEvents } = await import("./event-examples.mjs");
            results.push(...(await runEvents(events, artifacts, linkerEnv)));
        }
        const collections = entries.filter(e => e.kind === "collection");
        if (collections.length) {
            const { runCollection } = await import("./collection-examples.mjs");
            results.push(...(await runCollection(collections, artifacts)));
        }
        const reporters = entries.filter(e => e.kind === "reporter");
        if (reporters.length) {
            const { runReporter } = await import("./reporter-examples.mjs");
            results.push(...(await runReporter(reporters, artifacts, linkerEnv)));
        }
        assert.deepEqual(
            results.map(r => r.key).sort(),
            [...groups.keys()].sort(),
            "Missing or duplicate project check results",
        );
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(
        path.join(artifacts, "projects.json"),
        JSON.stringify(results, null, 2) + "\n",
    );
    const failed = results.filter(r => r.status !== "passed").length;
    assert.equal(failed, 0, `${failed} project checks failed; see projects.json`);
    return `${results.length} checks passed from ${entries.length} documentation blocks in temporary Testplane projects.`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    console.log(
        await runProjects(
            require("./generated/project.json"),
            path.resolve(process.env.EXAMPLE_ARTIFACTS || "artifacts"),
        ),
    );
}
