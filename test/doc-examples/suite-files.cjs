function suiteFor(file) {
    if (
        typeof file !== "string" ||
        !/^generated\/(chrome|selenium)\/[a-z0-9]+(?:-[a-z0-9]+)*\.testplane\.js$/.test(file)
    ) {
        throw new Error(`Unsupported test path: ${file}`);
    }
    return file.startsWith("generated/selenium/") ? "selenium" : "chrome";
}

function suiteFiles(suite, manifest = require("./generated/manifest.json")) {
    if (!["chrome", "selenium"].includes(suite)) throw new Error(`Unknown suite: ${suite}`);
    return [...new Set(manifest.map(entry => entry.test))].filter(file => suiteFor(file) === suite);
}

module.exports = { suiteFor, suiteFiles };
