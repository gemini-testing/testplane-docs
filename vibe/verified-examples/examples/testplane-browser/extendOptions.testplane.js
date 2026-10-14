const assert = require("node:assert/strict");

it("extendOptions: change WebdriverIO wait settings for this browser", async ({ browser }) => {
    const original = {
        waitforTimeout: browser.options.waitforTimeout,
        waitforInterval: browser.options.waitforInterval,
    };
    const configuredTimeout = (await browser.getConfig()).waitTimeout;
    assert.equal(typeof configuredTimeout, "number");
    try {
        const result = await browser.extendOptions({ waitforTimeout: 1000, waitforInterval: 50 });
        assert.equal(result, undefined);
        assert.equal(browser.options.waitforTimeout, 1000);
        assert.equal(browser.options.waitforInterval, 50);
        assert.equal((await browser.getConfig()).waitTimeout, configuredTimeout);
        await browser.url("/");
        await browser.execute(() => {
            setTimeout(() => {
                document.body.innerHTML = '<p id="ready">Ready</p>';
            }, 100);
        });
        await browser.$("#ready").waitForExist();
        assert.equal(await browser.$("#ready").getText(), "Ready");
    } finally {
        await browser.extendOptions(original);
    }
});
