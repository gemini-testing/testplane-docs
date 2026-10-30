const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

it("getState: read a saved file without restoring the session", async ({ browser }) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "testplane-state-"));
    const statePath = path.join(directory, "state.json");
    try {
        await browser.url("/");
        const origin = new URL(await browser.getUrl()).origin;
        await browser.execute(() => localStorage.setItem("example", "saved"));
        await browser.saveState({ path: statePath, cookies: false, localStorage: true });
        await browser.execute(() => localStorage.setItem("example", "current"));
        const state = await browser.getState({ path: statePath });
        assert.equal(state.framesData[origin].localStorage.example, "saved");
        assert.equal(await browser.execute(() => localStorage.getItem("example")), "current");
    } finally {
        await fs.rm(directory, { recursive: true, force: true });
    }
});
