const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

it("downloadFile: copy a browser download from Selenium Grid", async ({ browser }) => {
    const targetDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "testplane-download-"));
    try {
        await browser.url("/");
        await browser.execute(() => {
            document.body.innerHTML = '<a href="/report.csv" download>Download report</a>';
        });
        await browser.$("a").click();
        await browser.waitUntil(
            async () => {
                const { names } = await browser.getDownloadableFiles();
                return names.includes("report.csv");
            },
            { timeout: 10000, timeoutMsg: "The CSV was not downloaded on the Grid node" },
        );
        const { files } = await browser.downloadFile("report.csv", targetDirectory);
        const localFile = path.join(targetDirectory, "report.csv");
        assert.ok(files.includes(localFile));
        assert.equal(await fs.readFile(localFile, "utf8"), "name,value\nexample,42\n");
    } finally {
        await browser.deleteDownloadableFiles();
        await fs.rm(targetDirectory, { recursive: true, force: true });
    }
});
