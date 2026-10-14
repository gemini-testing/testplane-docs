const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const manifest = require("./manifest.json");
const root = path.resolve(__dirname, "../..");
const verified = new Map();
for (const entry of manifest) {
    const expected = fs.readFileSync(path.join(__dirname, entry.test), "utf8");
    for (const page of [entry.page, entry.translation]) {
        const source = fs.readFileSync(path.join(root, page), "utf8");
        const blocks = [...source.matchAll(/^```javascript\n([\s\S]*?)^```/gm)];
        const index = entry.blockIndex ?? 0;
        assert.equal(blocks.length, entry.blockCount ?? 1, page);
        assert.ok(blocks[index], `${page}: missing block ${index}`);
        const indexes = verified.get(page) ?? new Set();
        assert.ok(!indexes.has(index), `${page}: duplicate block ${index}`);
        indexes.add(index);
        verified.set(page, indexes);
        assert.equal(
            blocks[index][1],
            expected,
            `${page} block ${index} differs from ${entry.test}`,
        );
    }
}
for (const [page, indexes] of verified) {
    const count = [...fs.readFileSync(path.join(root, page), "utf8").matchAll(/^```javascript\n/gm)]
        .length;
    assert.equal(indexes.size, count, `${page}: not all JavaScript blocks have tests`);
}
console.log(
    `Verified ${manifest.length * 2} localized blocks across ${verified.size} pages and ${new Set(manifest.map(entry => entry.test)).size} test files`,
);
