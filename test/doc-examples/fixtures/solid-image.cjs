const fs = require("node:fs/promises");
const path = require("node:path");

// Construct the reference from the specified color and dimensions, never from a screenshot.
async function solidReference(browser, state, { width, height, color }) {
    const png = await browser.execute(
        (width, height, color) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.fillStyle = color;
            context.fillRect(0, 0, width, height);
            return canvas.toDataURL("image/png").split(",")[1];
        },
        width,
        height,
        color,
    );
    const config = await browser.getConfig();
    const file = config.getScreenshotPath(browser.executionContext.ctx.currentTest, state);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.from(png, "base64"));
}

module.exports = { solidReference };
