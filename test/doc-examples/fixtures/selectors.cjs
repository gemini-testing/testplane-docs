const { setupBrowser } = require("@testplane/testing-library");

async function setup(browser, variant) {
    if (variant === "library") return setupBrowser(browser);
    if (variant === "guide") return; // The full examples navigate in the documented test.
    const pages = { tree: "forms", shadow: "guide" };
    if (!Object.hasOwn(pages, variant)) throw new Error(`Unknown selectors fixture: ${variant}`);
    await browser.url(`/fixtures/selectors/${pages[variant]}.html`);
}

module.exports = { setup };
