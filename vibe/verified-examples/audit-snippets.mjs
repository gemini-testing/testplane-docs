import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { suiteFor } from "./suite-files.cjs";

const roots = ["docs/", "i18n/ru/docusaurus-plugin-content-docs/current/"];
const harness = "vibe/verified-examples/";
const mobile = new Set([
    "guides/android-testing",
    ...[
        "setOrientation",
        "touchAction",
        "swipe",
        "tap",
        "getContext",
        "getContexts",
        "switchContext",
        "relaunchActiveApp",
        "deepLink",
    ].map(name => `commands/browser/${name}`),
    ...["touchAction", "tap", "longPress", "pinch", "zoom"].map(name => `commands/element/${name}`),
]);
const parser = unified().use(remarkParse).use(remarkMdx);
const hash = value => createHash("sha256").update(value).digest("hex");
const key = block => `${block.page}\0${block.language}\0${block.sha256}`;
const id = block => `${block.page}\0${block.language}\0${block.blockIndex}`;
const isDoc = name => roots.some(root => name.startsWith(root)) && /\.mdx?$/.test(name);
const isMobile = name =>
    mobile.has(name.slice(roots.find(root => name.startsWith(root)).length).replace(/\.mdx?$/, ""));
const escape = value => String(value).replace(/[&<>|`\r\n]/g, char => `&#${char.charCodeAt(0)};`);

function blocks(page, source) {
    const result = [];
    const indexes = new Map();
    const visit = node => {
        const jsxCode =
            /^mdxJsx/.test(node.type) && ["CodeBlock", "pre", "code"].includes(node.name);
        if (node.type === "code" || jsxCode) {
            const language = jsxCode ? "jsx-code" : node.lang || "";
            const value = jsxCode
                ? source.slice(node.position.start.offset, node.position.end.offset)
                : node.value;
            const blockIndex = indexes.get(language) || 0;
            indexes.set(language, blockIndex + 1);
            result.push({
                page,
                language,
                blockIndex,
                line: node.position.start.line,
                sha256: hash(value),
                value,
            });
            if (jsxCode) return;
        }
        for (const child of node.children || []) visit(child);
    };
    visit(parser.parse(source));
    return result;
}

// Public CLI: compare the working tree with an immutable Git base, never a PR-editable debt list.
export function main(args = process.argv.slice(2)) {
    const { values } = parseArgs({
        args,
        options: {
            root: { type: "string", default: fileURLToPath(new URL("../../", import.meta.url)) },
            base: { type: "string" },
            "report-dir": { type: "string" },
        },
    });
    const root = fs.realpathSync(values.root);
    const reportDir = path.resolve(values["report-dir"] || path.join(root, "tmp/doc-examples"));
    const report = { base: values.base, counts: {}, errors: [], excluded: [], blocks: [] };
    const git = (...args) =>
        execFileSync("git", args, {
            cwd: root,
            encoding: "utf8",
            maxBuffer: 32 * 1024 * 1024,
            stdio: ["ignore", "pipe", "pipe"],
        });
    const read = name => {
        const resolved = fs.realpathSync(path.join(root, name));
        if (!resolved.startsWith(root + path.sep))
            throw new Error(`Path outside repository: ${name}`);
        return fs.readFileSync(resolved, "utf8");
    };
    try {
        if (!values.base) throw new Error("An explicit --base Git revision is required");
        report.base = git(
            "rev-parse",
            "--verify",
            "--end-of-options",
            `${values.base}^{commit}`,
        ).trim();
        const baseNames = git("ls-tree", "-rz", "--name-only", report.base)
            .split("\0")
            .filter(Boolean);
        const currentNames = [
            ...new Set(
                git("ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0"),
            ),
        ].filter(name => name && fs.existsSync(path.join(root, name)));
        const inventory = (names, get) =>
            names.filter(isDoc).flatMap(name => {
                if (isMobile(name)) return [];
                try {
                    return blocks(name, get(name));
                } catch (error) {
                    report.errors.push(`${name}: ${error.message}`);
                    return [];
                }
            });
        report.excluded = currentNames.filter(name => isDoc(name) && isMobile(name));
        report.excludedRoots = [
            "versioned_docs/",
            "i18n/*/docusaurus-plugin-content-docs/version-*/",
        ];
        const baseRead = name => git("show", `${report.base}:${name}`);
        const before = inventory(baseNames, baseRead);
        const current = inventory(currentNames, read);
        const manifest = JSON.parse(read(`${harness}manifest.json`));
        const oldManifest = baseNames.includes(`${harness}manifest.json`)
            ? JSON.parse(baseRead(`${harness}manifest.json`))
            : [];
        const covered = new Map();
        for (const entry of manifest) {
            try {
                suiteFor(entry.test);
                if (!Number.isInteger(entry.testCount ?? 1) || (entry.testCount ?? 1) < 1)
                    throw new Error(`Invalid testCount: ${entry.test}`);
                const testCode = read(`${harness}${entry.test}`);
                for (const page of [entry.page, entry.translation].filter(Boolean)) {
                    const candidates = current.filter(
                        block =>
                            block.page === page &&
                            block.language === (entry.language ?? "javascript"),
                    );
                    const block = candidates[entry.blockIndex ?? 0];
                    if (!block)
                        throw new Error(
                            `Missing or excluded block: ${page} #${entry.blockIndex ?? 0}`,
                        );
                    if (entry.blockCount !== undefined && candidates.length !== entry.blockCount)
                        throw new Error(`Unexpected block count: ${page}`);
                    if (covered.has(id(block)))
                        throw new Error(`Duplicate manifest entry: ${page} #${block.blockIndex}`);
                    if (testCode !== block.value + "\n")
                        throw new Error(`${page}:${block.line} differs from ${entry.test}`);
                    covered.set(id(block), entry.test);
                }
            } catch (error) {
                report.errors.push(error.message);
            }
        }
        const exemptions = new Map();
        const exemptionFile = `${harness}non-executable.json`;
        const entries = fs.existsSync(path.join(root, exemptionFile))
            ? JSON.parse(read(exemptionFile))
            : [];
        for (const entry of entries) {
            try {
                const block = current.find(
                    block =>
                        block.page === entry.page &&
                        block.language === entry.language &&
                        block.blockIndex === entry.blockIndex,
                );
                if (!block || block.sha256 !== entry.sha256 || !entry.reason?.trim())
                    throw new Error(
                        `Stale or incomplete non-executable classification: ${entry.page}`,
                    );
                if (covered.has(id(block)) || exemptions.has(id(block)))
                    throw new Error(`Duplicate classification: ${entry.page}`);
                exemptions.set(id(block), entry.reason.trim());
            } catch (error) {
                report.errors.push(error.message);
            }
        }
        // Do not let deleting a mapping downgrade a retained, previously covered block to debt/exemption.
        const previouslyCovered = new Map();
        for (const entry of oldManifest) {
            for (const page of [entry.page, entry.translation].filter(Boolean)) {
                const block = before.filter(
                    block =>
                        block.page === page && block.language === (entry.language ?? "javascript"),
                )[entry.blockIndex ?? 0];
                if (block)
                    previouslyCovered.set(key(block), (previouslyCovered.get(key(block)) || 0) + 1);
            }
        }
        const available = new Map();
        for (const block of before) available.set(key(block), (available.get(key(block)) || 0) + 1);
        // Only baseline debt can pay for unclassified occurrences. Covered/exempt
        // copies must neither consume debt credits nor create new ones by reordering.
        for (const [fingerprint, count] of previouslyCovered) {
            available.set(fingerprint, Math.max(0, (available.get(fingerprint) || 0) - count));
        }
        const oldExemptions = baseNames.includes(exemptionFile)
            ? JSON.parse(baseRead(exemptionFile))
            : [];
        for (const entry of oldExemptions) {
            const block = before.find(
                block => id(block) === id(entry) && block.sha256 === entry.sha256,
            );
            if (block) available.set(key(block), Math.max(0, (available.get(key(block)) || 0) - 1));
        }
        for (const block of current) {
            const remaining = available.get(key(block)) || 0;
            if (remaining && !covered.has(id(block)) && !exemptions.has(id(block))) {
                available.set(key(block), remaining - 1);
            }
            const status = covered.has(id(block))
                ? "covered"
                : exemptions.has(id(block))
                  ? "non-executable"
                  : remaining
                    ? "legacy"
                    : "uncovered";
            const { value, ...location } = block;
            report.blocks.push({
                ...location,
                status,
                test: covered.get(id(block)),
                reason: exemptions.get(id(block)),
            });
        }
        for (const [fingerprint, count] of previouslyCovered) {
            const retained = report.blocks.filter(block => key(block) === fingerprint);
            const missing =
                Math.min(count, retained.length) -
                retained.filter(block => block.status === "covered").length;
            for (const block of retained
                .filter(block => block.status !== "covered")
                .slice(0, Math.max(0, missing)))
                block.status = "regression";
        }
    } catch (error) {
        report.errors.push(error.message);
    }
    for (const status of ["covered", "legacy", "non-executable", "uncovered", "regression"])
        report.counts[status] = report.blocks.filter(block => block.status === status).length;
    report.ok = !report.errors.length && !report.counts.uncovered && !report.counts.regression;
    const summary = [
        "# Documentation examples",
        "",
        `Base: ${escape(report.base || "missing")}`,
        "",
        `Gate: **${report.ok ? "PASS" : "FAIL"}**. Runtime results are checked separately.`,
        "",
        "| Classification | Blocks |",
        "| --- | ---: |",
        ...Object.entries(report.counts).map(([status, count]) => `| ${status} | ${count} |`),
        "",
        "Covered means linked to an exact test source, not a successful browser run.",
        "",
        "Mobile pages and versioned documentation (including v8) are excluded.",
        "",
        ...report.errors.map(error => `- ${escape(error)}`),
        "",
    ].join("\n");
    const rows = report.blocks.map(
        block =>
            `| ${escape(block.page)}:${block.line} | ${escape(block.language || "unlabelled")} #${block.blockIndex} | ${block.status} | ${escape(block.test || block.reason || "—")} |`,
    );
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, "coverage.json"), JSON.stringify(report, null, 2) + "\n");
    fs.writeFileSync(path.join(reportDir, "summary.md"), summary);
    fs.writeFileSync(
        path.join(reportDir, "coverage.md"),
        `${summary}\n## Inventory\n\n| Source | Block | Classification | Test / reason |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n\n## Excluded mobile pages\n\n${report.excluded.map(page => `- ${escape(page)}`).join("\n")}\n`,
    );
    console.log(summary);
    for (const block of report.blocks.filter(block =>
        ["uncovered", "regression"].includes(block.status),
    ))
        console.error(
            `${block.page}:${block.line}: ${block.status} (${block.language} #${block.blockIndex}, sha256=${block.sha256})`,
        );
    for (const error of report.errors)
        console.error(`Coverage error (base ${values.base}): ${error}`);
    process.exitCode = report.ok ? 0 : 1;
}
