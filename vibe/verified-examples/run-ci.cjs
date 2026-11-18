const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { setTimeout: delay } = require("node:timers/promises");
const { createHash } = require("node:crypto");
const { verifyRuntime } = require("./verify-runtime.cjs");

const SELENIUM_SHA256 = "4664ef41d4bf5ee78cd6264ff8dca480ef80628ca91df95ca554c4d66f7831c1";
const suite = process.argv[2];
const artifacts = path.resolve(process.env.EXAMPLE_ARTIFACTS || "artifacts");
const children = new Set();

async function stop(child) {
    if (!child?.pid || child.exitCode !== null || child.signalCode) return;
    const exited = once(child, "exit");
    child.kill("SIGTERM");
    const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
    try {
        await exited;
    } finally {
        clearTimeout(timeout);
    }
}

function launch(command, args, options) {
    const child = spawn(command, args, options);
    children.add(child);
    child.once("exit", () => children.delete(child));
    return child;
}

async function main() {
    if (!["chrome", "selenium"].includes(suite))
        throw new Error("Usage: node run-ci.cjs chrome|selenium");
    fs.mkdirSync(artifacts, { recursive: true });
    const resultFile = path.join(artifacts, `${suite}.jsonl`);
    fs.rmSync(resultFile, { force: true });
    // Same installer as Testplane's standalone CI, tied to the locked Testplane version.
    const testplaneSource = path.dirname(require.resolve("testplane"));
    const { installBrowser } = require(path.join(testplaneSource, "browser-installer/install"));
    const { installChromeDriver } = require(
        path.join(testplaneSource, "browser-installer/chrome/driver"),
    );
    const { isUbuntu, getUbuntuLinkerEnv } = require(
        path.join(testplaneSource, "browser-installer/ubuntu-packages"),
    );
    const version =
        require("./testplane.config").browsers.chrome.desiredCapabilities.browserVersion;
    const binary = await installBrowser("chrome", version, {
        shouldInstallWebDriver: true,
        shouldInstallUbuntuPackages: true,
    });
    const driver = await installChromeDriver(version);
    const linkerEnv = (await isUbuntu()) ? await getUbuntuLinkerEnv() : {};
    const env = { ...process.env, ...linkerEnv, EXAMPLE_CHROME_BINARY: binary };
    fs.writeFileSync(
        path.join(artifacts, "environment.json"),
        JSON.stringify(
            {
                node: process.version,
                platform: process.platform,
                arch: process.arch,
                testplane: require(path.join(testplaneSource, "../../package.json")).version,
                browserVersion: version,
                binary,
                driver,
                selenium: suite === "selenium" ? "4.50.0" : undefined,
            },
            null,
            2,
        ) + "\n",
    );
    let grid;
    let gridLog;
    try {
        if (suite === "selenium") {
            const jar = process.env.SELENIUM_JAR;
            if (!jar) throw new Error("SELENIUM_JAR must point to selenium-server-4.50.0.jar");
            const digest = createHash("sha256").update(fs.readFileSync(jar)).digest("hex");
            if (digest !== SELENIUM_SHA256) throw new Error("Selenium jar checksum mismatch");
            gridLog = fs.openSync(path.join(artifacts, "selenium.log"), "w");
            const port = 4446;
            const url = `http://127.0.0.1:${port}`;
            // Refuse to reuse someone else's Grid (managed downloads and Chrome must be ours).
            const existing = await fetch(`${url}/status`, {
                signal: AbortSignal.timeout(1000),
            }).catch(() => null);
            if (existing)
                throw new Error(`Port ${port} already serves HTTP; stop the existing Grid first`);
            grid = launch(
                process.env.JAVA_BINARY || "java",
                [
                    `-Dwebdriver.chrome.driver=${driver}`,
                    "-jar",
                    jar,
                    "standalone",
                    "--host",
                    "127.0.0.1",
                    "--port",
                    String(port),
                    "--enable-managed-downloads",
                    "true",
                    "--max-sessions",
                    "1",
                    "--detect-drivers",
                    "false",
                    "--driver-configuration",
                    "display-name=chrome",
                    `stereotype=${JSON.stringify({ browserName: "chrome", "goog:chromeOptions": { binary } })}`,
                ],
                { env, stdio: ["ignore", gridLog, gridLog] },
            );
            let spawnError;
            grid.on("error", error => {
                spawnError = error;
            });
            const deadline = Date.now() + 60000;
            while (true) {
                if (spawnError) throw spawnError;
                if (grid.exitCode !== null || grid.signalCode)
                    throw new Error("Selenium exited before becoming ready; see selenium.log");
                const response = await fetch(`${url}/status`, { signal: AbortSignal.timeout(1000) })
                    .then(res => res.json())
                    .catch(() => null);
                if (response?.value?.ready) break;
                if (Date.now() > deadline)
                    throw new Error("Selenium readiness timed out; see selenium.log");
                await delay(250);
            }
            env.SELENIUM_GRID_URL = url;
        }
        const args = [
            path.join(__dirname, "run-examples.cjs"),
            "--reporter",
            "flat",
            "--reporter",
            JSON.stringify({ type: "jsonl", path: resultFile }),
        ];
        if (suite === "selenium") args.push("--config", "testplane.selenium.config.js");
        const child = launch(process.execPath, args, { cwd: __dirname, env, stdio: "inherit" });
        const [code, signal] = await once(child, "exit");
        if (code !== 0) throw new Error(`Testplane exited with ${code ?? signal}`);
        const results = fs
            .readFileSync(resultFile, "utf8")
            .split("\n")
            .filter(Boolean)
            .map(line => JSON.parse(line));
        const counts = verifyRuntime(results, require("./manifest.json"), suite);
        const summary = `## ${suite}\n\n${counts.passed} tests passed in ${counts.files} files. No skipped tests or retries.\n`;
        fs.writeFileSync(path.join(artifacts, "runtime-summary.md"), summary);
        console.log(summary);
    } finally {
        await stop(grid);
        if (gridLog !== undefined) fs.closeSync(gridLog);
    }
}

for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, async () => {
        await Promise.all([...children].map(stop));
        process.exit(signal === "SIGINT" ? 130 : 143);
    });
main().catch(error => {
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(
        path.join(artifacts, "runtime-summary.md"),
        `## ${suite}\n\nFAIL. See test output and artifacts for details.\n`,
    );
    console.error(error);
    process.exitCode = 1;
});
