const fs = require("node:fs/promises");
const path = require("node:path");

// Construct the reference from the specified geometry and colors, never from a screenshot.
async function solidReference(browser, state, { width, height, color, rects = [] }) {
    const png = await browser.execute(
        (width, height, color, rects) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.fillStyle = color;
            context.fillRect(0, 0, width, height);
            for (const rect of rects) {
                if (rect.color) {
                    context.fillStyle = rect.color;
                    context.fillRect(rect.x, rect.y, rect.width, rect.height);
                } else {
                    context.clearRect(rect.x, rect.y, rect.width, rect.height);
                }
            }
            return canvas.toDataURL("image/png").split(",")[1];
        },
        width,
        height,
        color,
        rects,
    );
    const config = await browser.getConfig();
    const file = config.getScreenshotPath(browser.executionContext.ctx.currentTest, state);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.from(png, "base64"));
}

module.exports = { solidReference };
