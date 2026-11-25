const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { test } = require("node:test");

for (const config of ["testplane.config.js", "testplane.selenium.config.js"]) {
    for (const [name, githubActions, runnerOs, sandboxDisabled] of [
        ["GitHub Linux", "true", "Linux", true],
        ["local Linux", "", "Linux", false],
        ["GitHub macOS", "true", "macOS", false],
        ["GitHub Windows", "true", "Windows", false],
    ]) {
        test(`${config}: sandbox workaround is scoped to ${name}`, t => {
            const root = mkdtempSync(path.join(tmpdir(), "example-config-"));
            t.after(() => rmSync(root, { recursive: true, force: true }));
            for (const file of [
                "testplane.config.js",
                "testplane.selenium.config.js",
                "ci-chrome-args.cjs",
                "suite-files.cjs",
            ])
                copyFileSync(path.resolve(__dirname, "..", file), path.join(root, file));
            mkdirSync(path.join(root, "generated"));
            writeFileSync(path.join(root, "generated/manifest.json"), "[]\n");
            const filename = path.join(root, config);
            const script = `console.log(JSON.stringify(require(${JSON.stringify(filename)}).browsers.chrome.desiredCapabilities))`;
            const capabilities = JSON.parse(
                execFileSync(process.execPath, ["-e", script], {
                    encoding: "utf8",
                    env: {
                        ...process.env,
                        GITHUB_ACTIONS: githubActions,
                        RUNNER_OS: runnerOs,
                        EXAMPLE_CHROME_BINARY: "/fixture/chrome",
                    },
                }),
            );
            const options = capabilities["goog:chromeOptions"] || {};
            assert.equal((options.args || []).includes("--no-sandbox"), sandboxDisabled);
            assert.equal((options.args || []).includes("--disable-dev-shm-usage"), sandboxDisabled);
            if (config.includes("selenium")) {
                assert.ok(options.args.includes("--headless=new"));
                assert.equal(options.binary, "/fixture/chrome");
                assert.equal(capabilities["se:downloadsEnabled"], true);
            }
        });
    }
}
