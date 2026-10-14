module.exports = {
    gridUrl: "local",
    baseUrl: process.env.EXAMPLE_BASE_URL,
    headless: true,
    resetCursor: false,
    isolation: false,
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
            files: [
                "examples/browser/**/*.testplane.js",
                "examples/related/**/*.testplane.js",
                "examples/element/**/*.testplane.js",
                "examples/mock/**/*.testplane.js",
                "examples/testplane-browser/**/*.testplane.js",
                "examples/testplane-element/**/*.testplane.js",
            ],
            browsers: ["chrome"],
        },
    },
    browsers: {
        chrome: {
            desiredCapabilities: {
                browserName: "chrome",
                browserVersion: "150.0.7871.124",
                webSocketUrl: true,
            },
        },
    },
};
