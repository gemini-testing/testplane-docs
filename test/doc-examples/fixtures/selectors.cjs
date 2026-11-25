const { setupBrowser } = require("@testplane/testing-library");

const pages = { guide: "guide", library: "guide", tree: "forms", dashboard: "dashboard" };

async function setup(browser, variant) {
    if (!Object.hasOwn(pages, variant)) throw new Error(`Unknown selectors fixture: ${variant}`);
    if (variant === "library" || variant === "dashboard") setupBrowser(browser);
    await browser.url(`/fixtures/selectors/${pages[variant]}.html`);
}

module.exports = { setup };
