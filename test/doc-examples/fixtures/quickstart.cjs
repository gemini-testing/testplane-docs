const { setupBrowser } = require("@testplane/testing-library");
const { solidReference } = require("./solid-image.cjs");

async function setup(browser, variant) {
    if (variant === "testing-library") {
        setupBrowser(browser);
    } else if (variant === "visual") {
        await solidReference(browser, "default", { width: 40, height: 40, color: "#008000" });
    } else if (variant !== "page") {
        throw new Error(`Unknown quickstart fixture: ${variant}`);
    }
}

module.exports = { setup };
