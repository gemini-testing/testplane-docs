const { suiteFiles } = require("./suite-files.cjs");
const cdp = suiteFiles(undefined, "cdp");
const capabilities = {
    browserName: "chrome",
    browserVersion: "150.0.7871.124",
    "goog:chromeOptions": { args: require("./ci-chrome-args.cjs") },
};
module.exports = {
    gridUrl: "local",
    baseUrl: process.env.EXAMPLE_BASE_URL,
    headless: true,
    resetCursor: false,
    isolation: false,
    screenshotsDir: "artifacts/references",
    sessionsPerBrowser: 1,
    testsPerSession: 1,
    retry: 0,
    testTimeout: 30000,
    httpTimeout: 60000,
    pageLoadTimeout: 15000,
    waitTimeout: 5000,
    prepareBrowser(browser) {
        require("node:fs").writeFileSync(
            "validation-environment.json",
            JSON.stringify(
                {
                    browserName: browser.capabilities.browserName,
                    browserVersion: browser.capabilities.browserVersion,
                    isBidi: browser.isBidi,
                },
                null,
                2,
            ) + "\n",
        );
    },
    sets: {
        examples: {
            files: suiteFiles(undefined, "bidi"),
            browsers: ["chrome"],
        },
        ...(cdp.length ? { cdp: { files: cdp, browsers: ["chrome-cdp"] } } : {}),
    },
    browsers: {
        chrome: {
            desiredCapabilities: { ...capabilities, webSocketUrl: true },
        },
        ...(cdp.length ? { "chrome-cdp": { desiredCapabilities: capabilities } } : {}),
    },
};
