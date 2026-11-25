const usesNetworkMock = variant => variant === "network" || variant === "intercept";

async function setup(browser, variant) {
    if (usesNetworkMock(variant)) {
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

async function verify(browser, variant) {
    if (browser.isBidi && usesNetworkMock(variant)) {
        // WDIO keeps BiDi mocks in a worker-wide registry. Release them while their session is live.
        await browser.mockRestoreAll();
    }
}

module.exports = { setup, verify };
