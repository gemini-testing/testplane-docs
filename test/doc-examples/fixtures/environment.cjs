const { setupBrowser } = require("@testplane/testing-library");

exports.setup = async (browser, variant) => {
    const [lang, mode] = variant.split("-");
    if (!["en", "ru"].includes(lang)) throw new Error("Unknown order page language: " + variant);
    setupBrowser(browser);
    await browser.url("/");
    await browser.setCookies([{ name: "orders-language", value: lang }]);
    if (mode === "geolocation") await browser.setPermissions({ name: "geolocation" }, "granted");
    if (mode === "nojs") {
        const [page] = await (await browser.getPuppeteer()).pages();
        await page.setJavaScriptEnabled(false);
    }
};
