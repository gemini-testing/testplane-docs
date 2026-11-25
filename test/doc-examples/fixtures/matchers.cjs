async function setup(browser, variant) {
    if (variant === "network" || variant === "intercept") {
        // Each test gets a new session; WDIO caches its automatic BiDi subscription per worker.
        if (browser.isBidi) {
            await browser.sessionSubscribe({
                events: ["network.beforeRequestSent", "network.responseStarted"],
            });
        }
        if (variant === "intercept") return; // The test installs its mock before navigating.
    } else if (variant !== "page") {
        throw new Error(`Unknown matchers fixture: ${variant}`);
    }
    await browser.url("/fixtures/matchers/tasks.html");
}

module.exports = { setup };
