function suiteFor(file) {
    if (
        typeof file !== "string" ||
        !/^examples\/(browser|related|element|mock|testplane-browser|testplane-element|selenium)\/[\w-]+\.testplane\.js$/.test(
            file,
        )
    ) {
        throw new Error(`Unsupported test path: ${file}`);
    }
    return file.startsWith("examples/selenium/") ? "selenium" : "chrome";
}

function suiteFiles(suite, manifest = require("./manifest.json")) {
    if (!["chrome", "selenium"].includes(suite)) throw new Error(`Unknown suite: ${suite}`);
    return [...new Set(manifest.map(entry => entry.test))].filter(file => suiteFor(file) === suite);
}

module.exports = { suiteFor, suiteFiles };
