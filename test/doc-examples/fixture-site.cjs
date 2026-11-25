const fs = require("node:fs");
const path = require("node:path");

// A PR may add its own small, static demo pages. Never serve the project directory.
const site = path.join(__dirname, "fixtures/site");
const vendor = new Map(
    ["react", "react-dom"].map(name => [
        `/fixtures/vendor/${name}.js`,
        path.join(
            path.dirname(
                require.resolve(`${name}/package.json`, { paths: [path.join(__dirname, "../..")] }),
            ),
            `umd/${name}.development.js`,
        ),
    ]),
);
const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".txt": "text/plain",
    ".svg": "image/svg+xml",
    ".png": "image/png",
};
for (const name of ["react", "react-dom"]) {
    const pkg = path.dirname(require.resolve(`${name}16/package.json`));
    vendor.set(`/fixtures/vendor/${name}16.js`, path.join(pkg, `umd/${name}.development.js`));
}

function serveFixture(urlPath, res) {
    if (urlPath === "/orders") urlPath = "/fixtures/environment/orders.html";
    if (!urlPath.startsWith("/fixtures/")) return false;
    let file = vendor.get(urlPath);
    if (!file && /^\/fixtures\/(?:[\w-]+\/)+[\w-]+\.[\w]+$/.test(urlPath)) {
        const candidate = path.join(site, urlPath.slice("/fixtures/".length));
        try {
            const real = fs.realpathSync(candidate);
            if (real.startsWith(site + path.sep) && fs.statSync(real).isFile()) file = real;
        } catch (e) {
            if (e.code !== "ENOENT" && e.code !== "ENOTDIR") throw e;
        }
    }
    const mime = file && types[path.extname(file)];
    if (!mime || !fs.existsSync(file)) {
        res.writeHead(404);
        res.end("Unknown example fixture");
    } else {
        res.writeHead(200, { "Content-Type": mime });
        res.end(fs.readFileSync(file));
    }
    return true;
}

module.exports = { serveFixture };
