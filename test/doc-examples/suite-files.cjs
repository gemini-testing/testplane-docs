function suiteFiles(manifest = require("./generated/manifest.json"), transport) {
    const files = new Set();
    for (const entry of manifest) {
        const { test } = entry;
        if (
            typeof test !== "string" ||
            !/^generated\/chrome\/[a-z0-9]+(?:-[a-z0-9]+)*\.testplane\.js$/.test(test)
        )
            throw new Error(`Unsupported test path: ${test}`);
        const protocol = entry.transport ?? "bidi";
        if (!["bidi", "cdp"].includes(protocol))
            throw new Error(`Unknown Chrome transport: ${protocol}`);
        if (!transport || transport === protocol) files.add(test);
    }
    return [...files];
}

module.exports = { suiteFiles };
