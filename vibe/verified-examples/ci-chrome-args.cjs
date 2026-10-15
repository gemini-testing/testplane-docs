// Match Testplane's standalone CI on disposable GitHub Linux runners.
// Keep the browser sandbox enabled for ordinary local runs and other platforms.
module.exports =
    process.env.GITHUB_ACTIONS === "true" && process.env.RUNNER_OS === "Linux"
        ? ["--no-sandbox", "--disable-dev-shm-usage"]
        : [];
