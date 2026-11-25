import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runCollection } from "../collection-examples.mjs";

test("collection recipes do not run arbitrary code or discover files outside the fixture", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "collection-recipe-"));
    const samples = [
        'const files = require("node:fs");',
        'const tests = await testplane.readTests(["../other.js"]); assert.ok(tests);',
        "const browsers = testCollection.getBrowsers();",
        'testplane.skip.in("ie8"); testplane.skip.in("chrome");',
    ].map((source, i) => ({
        source,
        page: "docs/ref.mdx",
        line: i + 1,
        sha256: createHash("sha256").update(source).digest("hex"),
    }));
    try {
        const results = await runCollection(samples, dir);
        assert.deepEqual(
            results.map(r => r.status),
            ["failed", "failed", "failed", "failed"],
        );
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
