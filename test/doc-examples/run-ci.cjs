const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { verifyRuntime } = require("./verify-runtime.cjs");

const artifacts = path.resolve(process.env.EXAMPLE_ARTIFACTS || "artifacts");

async function main() {
    if (process.argv.length !== 2) throw new Error("Usage: node run-ci.cjs (local Chrome only)");
    const { generate } = await import("./generate-snippets.mjs");
    const manifest = generate();
    fs.mkdirSync(artifacts, { recursive: true });
    const { runProjects } = await import("./run-projects.mjs");
    const resultFile = path.join(artifacts, "chrome.jsonl");
    fs.rmSync(resultFile, { force: true });

    // Same installer as Testplane's standalone CI, tied to the locked Testplane version.
    const testplaneSource = path.dirname(require.resolve("testplane"));
    const { installBrowser } = require(path.join(testplaneSource, "browser-installer/install"));
    const { isUbuntu, getUbuntuLinkerEnv } = require(
        path.join(testplaneSource, "browser-installer/ubuntu-packages"),
    );
    const version =
        require("./testplane.config").browsers.chrome.desiredCapabilities.browserVersion;
    const binary = await installBrowser("chrome", version, {
        shouldInstallWebDriver: true,
        shouldInstallUbuntuPackages: true,
    });
    const linkerEnv = (await isUbuntu()) ? await getUbuntuLinkerEnv() : {};
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
            },
            null,
            2,
        ) + "\n",
    );

    const summaries = [];
    for (const [name, execute] of [
        [
            "Temporary project",
            () => runProjects(require("./generated/project.json"), artifacts, linkerEnv),
        ],
        ["Chrome", () => runChrome(manifest, linkerEnv, resultFile)],
    ]) {
        try {
            const message = await execute();
            console.log(message);
            summaries.push(`## ${name}\n\n${message}\n`);
        } catch (error) {
            process.exitCode = 1;
            console.error(error);
            summaries.push(`## ${name}\n\nFAIL. See the log and artifacts.\n`);
        }
    }
    fs.writeFileSync(path.join(artifacts, "runtime-summary.md"), summaries.join("\n"));
}

async function runChrome(manifest, linkerEnv, resultFile) {
    const child = spawn(
        process.execPath,
        [
            path.join(__dirname, "run-examples.cjs"),
            "--reporter",
            "flat",
            "--reporter",
            JSON.stringify({ type: "jsonl", path: resultFile }),
        ],
        { cwd: __dirname, env: { ...process.env, ...linkerEnv }, stdio: "inherit" },
    );
    const stop = () => child.kill("SIGTERM");
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    try {
        const [code, signal] = await once(child, "exit");
        if (code !== 0) throw new Error(`Testplane exited with ${code ?? signal}`);
    } finally {
        process.removeListener("SIGINT", stop);
        process.removeListener("SIGTERM", stop);
    }
    const results = fs
        .readFileSync(resultFile, "utf8")
        .split("\n")
        .filter(Boolean)
        .map(line => JSON.parse(line));
    const { passed, files } = verifyRuntime(results, manifest);
    return `${passed} tests passed in ${files} files. No skipped tests or retries.`;
}

main().catch(error => {
    fs.mkdirSync(artifacts, { recursive: true });
    fs.writeFileSync(
        path.join(artifacts, "runtime-summary.md"),
        "## Chrome\n\nFAIL. See test output and artifacts for details.\n",
    );
    console.error(error);
    process.exitCode = 1;
});
