const { solidReference } = require("./solid-image.cjs");

async function setup(browser, variant) {
    if (variant === "page") return browser.url("/");
    if (variant === "accessibility") return browser.url("/fixtures/guides/accessibility.html");
    if (variant !== "visual") throw new Error(`Unknown guide fixture: ${variant}`);

    await browser.url("/fixtures/browser/swatch.html");
    // The 40×40 green button starts against a green viewport, then turns blue on click.
    await browser.execute(() => {
        document.body.style.background = "#008000";
    });
    const viewport = await browser.execute(() => ({ width: innerWidth, height: innerHeight }));
    await solidReference(browser, "viewport", { ...viewport, color: "#008000" });
    await solidReference(browser, "button", { width: 40, height: 40, color: "#008000" });
    await solidReference(browser, "clicked", { width: 40, height: 40, color: "#0000ff" });
}

module.exports = { setup };
