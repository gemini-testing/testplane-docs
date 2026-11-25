import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runEvents } from "../event-examples.mjs";

test("an empty project has no event results", async () => {
    assert.deepEqual(await runEvents([]), []);
});

test("the event recipe rejects unrelated code and changing the event stream", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "event-recipe-unit-"));
    const entries = [
        "console.log('not a handler');",
        "testplane.intercept(testplane.events.TEST_FAIL, () => { return {}; });",
        "testplane.on(testplane.events.INIT, () => { console.info(process.env); });",
    ].map((source, index) => ({
        source,
        page: "docs/events.mdx",
        line: index + 1,
        sha256: createHash("sha256").update(source).digest("hex"),
    }));
    try {
        const rows = await runEvents(entries, dir);
        assert.deepEqual(
            rows.map(r => r.status),
            ["failed", "failed", "failed"],
        );
        assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, "events.json"))), rows);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
