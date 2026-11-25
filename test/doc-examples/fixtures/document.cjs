async function loadHtml(browser, html) {
    await browser.url("/");
    await browser.execute(source => {
        document.open();
        document.write("<!doctype html>" + source);
        document.close();
    }, html);
}

async function documentedPage(fixture, browser, variant, html) {
    if (!fixture.htmlVariants?.includes(variant))
        throw new Error(`Fixture ${variant} does not accept documented HTML`);
    await loadHtml(browser, html);
    await fixture.afterHtml?.(browser, variant);
}

module.exports = { documentedPage, loadHtml };
