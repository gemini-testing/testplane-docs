const config = require("./testplane.config");
module.exports = {
    ...config,
    gridUrl: process.env.SELENIUM_GRID_URL || "http://127.0.0.1:4446",
    sets: {
        selenium: {
            files: require("./suite-files.cjs").suiteFiles("selenium"),
            browsers: ["chrome"],
        },
    },
    browsers: {
        chrome: {
            desiredCapabilities: {
                browserName: "chrome",
                "se:downloadsEnabled": true,
                webSocketUrl: true,
                "goog:chromeOptions": {
                    ...(process.env.EXAMPLE_CHROME_BINARY
                        ? { binary: process.env.EXAMPLE_CHROME_BINARY }
                        : {}),
                    args: ["--headless=new", ...require("./ci-chrome-args.cjs")],
                },
            },
        },
    },
};
