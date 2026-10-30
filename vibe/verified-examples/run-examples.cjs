const http = require("node:http");
const { spawn } = require("node:child_process");
const server = http.createServer((req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    if (path === "/navigation") {
        res.setHeader("Content-Type", "text/html");
        res.end(
            `<!doctype html><script>window.initialSeed = window.navigationSeed ?? null; window.receivedHeader = ${JSON.stringify(req.headers["x-example"] || null)};</script><h1>Navigation</h1>`,
        );
    } else if (path === "/report.csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="report.csv"');
        res.end("name,value\nexample,42\n");
    } else if (path === "/api/items" || path === "/api/other") {
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                source: path === "/api/items" ? "original" : "redirected",
                method: req.method,
                header: req.headers["x-example"] || null,
            }),
        );
    } else if (path === "/frame") {
        res.setHeader("Content-Type", "text/html");
        res.end("<!doctype html><title>Frame</title><p id='inside'>Frame content</p>");
    } else {
        res.setHeader("Content-Type", "text/html");
        res.end(
            "<!doctype html><html><head><title>Command examples</title></head><body><h1>Command examples</h1></body></html>",
        );
    }
});
server.listen(0, "127.0.0.1", () => {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const child = spawn(
        process.execPath,
        [
            require("node:path").join(__dirname, "node_modules/testplane/bin/testplane"),
            ...process.argv.slice(2),
        ],
        {
            env: { ...process.env, EXAMPLE_BASE_URL: baseUrl },
            stdio: "inherit",
        },
    );
    const terminate = () => {
        child.kill("SIGTERM");
        const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
        timeout.unref();
    };
    process.once("SIGTERM", terminate);
    process.once("SIGINT", terminate);
    child.on("error", error => {
        console.error(error.message);
        server.close();
        process.exitCode = 1;
    });
    child.on("exit", code => {
        process.removeListener("SIGTERM", terminate);
        process.removeListener("SIGINT", terminate);
        server.closeAllConnections();
        server.close();
        process.exitCode = code ?? 1;
    });
});
