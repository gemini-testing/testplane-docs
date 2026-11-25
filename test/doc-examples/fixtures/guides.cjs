const { solidReference } = require("./solid-image.cjs");

async function setup(browser, variant) {
    if (variant === "page") return browser.url("/");
    if (variant !== "visual") throw new Error(`Unknown guide fixture: ${variant}`);

    await browser.url("/fixtures/visual/search.html");
    const viewport = await browser.execute(() => ({ width: innerWidth, height: innerHeight }));
    // Reference the search icon independently of the screenshot/DOM under test.
    const icon = [
        { x: 9, y: 8, width: 16, height: 3 },
        { x: 9, y: 11, width: 3, height: 10 },
        { x: 22, y: 11, width: 3, height: 10 },
        { x: 9, y: 21, width: 16, height: 3 },
        { x: 25, y: 24, width: 4, height: 4 },
        { x: 29, y: 28, width: 3, height: 3 },
    ].map(rect => ({ ...rect, color: "white" }));
    const size = { width: 40, height: 40 };
    const closed = "#24364b";
    await solidReference(browser, "viewport-screen", {
        ...viewport,
        color: "white",
        rects: [{ x: 0, y: 0, ...size, color: closed }, ...icon],
    });
    await solidReference(browser, "search-button", { ...size, color: closed, rects: icon });
    await solidReference(browser, "search-open", { ...size, color: "#1858a6", rects: icon });
}

module.exports = { setup };
