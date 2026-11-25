import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createCliProject } from "../cli-examples.mjs";

const require = createRequire(import.meta.url);

test("the CLI discovery controls distinguish browser, set and configuration without a second browser run", t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cli-example-"));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    createCliProject(dir, { browserName: "chrome", browserVersion: "test" });

    const config = name => require(path.join(dir, name));
    const main = config("list/testplane.config.js");
    const alt = config("list/local.testplane.config.ts");
    const run = config("run/testplane.config.js");
    assert.deepEqual(Object.keys(run.browsers), ["chrome"]);
    assert.deepEqual(Object.keys(main.browsers), ["chrome", "chrome-copy"]);

    const selected = ({ sets }, { browser, set } = {}) =>
        Object.entries(sets).flatMap(([name, value]) =>
            !set || name === set
                ? value.files.flatMap(file =>
                      value.browsers
                          .filter(id => !browser || id === browser)
                          .map(id => file + "@" + id),
                  )
                : [],
        );
    const outcomes = [
        selected(main),
        selected(main, { browser: "chrome" }),
        selected(main, { set: "desktop" }),
        selected(alt),
    ];
    assert.ok(outcomes.every(outcome => outcome.length > 0));
    assert.equal(new Set(outcomes.map(outcome => JSON.stringify(outcome.sort()))).size, 4);
    assert.notDeepEqual(selected(run), selected(run, { set: "desktop" }));
});
