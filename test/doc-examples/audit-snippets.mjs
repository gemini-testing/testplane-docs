import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import {
    defaultRoot,
    harness,
    inventory,
    isDoc,
    isMobile,
    readExemptions,
    repository,
} from "./doc-sources.mjs";
import { collectExamples, marker } from "./example-model.mjs";

const key = block => `${block.page}\0${block.language}\0${block.sha256}`;
const id = block => `${block.page}\0${block.language}\0${block.blockIndex}`;
// Report groups describe the backlog; none are an exemption for new or changed code.
function legacyGroup(block) {
    if (block.section === "usage" && block.page.includes("/commands/"))
        return "Command usage / signatures";
    if (/^(?:[>❯] .*\n+\s*Usage:|\s*[✔✓┌└├│]|node_modules\s*\n)/u.test(block.value))
        return "Output and directory trees";
    if (["bash", "shell"].includes(block.language)) return "Shell and CLI";
    if (["js", "javascript", "ts", "typescript", "tsx"].includes(block.language))
        return "JavaScript and TypeScript";
    return "Other markup, config, output and unlabelled blocks";
}
const escape = value => String(value).replace(/[&<>|`\r\n]/g, char => `&#${char.charCodeAt(0)};`);

// Public CLI: compare the working tree with an immutable Git base, never a PR-editable debt list.
export function main(args = process.argv.slice(2)) {
    const { values } = parseArgs({
        args,
        options: {
            root: { type: "string", default: defaultRoot },
            base: { type: "string" },
            "report-dir": { type: "string" },
        },
    });
    const root = fs.realpathSync(values.root);
    const reportDir = path.resolve(values["report-dir"] || path.join(root, "tmp/doc-examples"));
    const report = { base: values.base, counts: {}, errors: [], excluded: [], blocks: [] };
    try {
        if (!values.base) throw new Error("An explicit --base Git revision is required");
        const repo = repository(root);
        const { git, read, names: currentNames } = repo;
        report.base = git(
            "rev-parse",
            "--verify",
            "--end-of-options",
            `${values.base}^{commit}`,
        ).trim();
        const baseNames = git("ls-tree", "-rz", "--name-only", report.base)
            .split("\0")
            .filter(Boolean);
        report.excluded = currentNames.filter(name => isDoc(name) && isMobile(name));
        report.excludedRoots = [
            "versioned_docs/",
            "i18n/*/docusaurus-plugin-content-docs/version-*/",
        ];
        const baseRead = name => git("show", `${report.base}:${name}`);
        const before = inventory(baseNames, baseRead, report.errors);
        const current = inventory(currentNames, read, report.errors);
        const entries = readExemptions(repo);
        const plan = collectExamples(current, entries, currentNames);
        report.errors.push(...plan.errors);
        const covered = new Map(plan.manifest.map(entry => [id(entry), entry.test]));
        const project = new Map(plan.projects.map(entry => [id(entry), entry.kind]));
        const gridOnly = new Map(plan.gridOnly.map(block => [id(block), block.reason]));
        // Compatibility with Git baselines predating generation and the harness move.
        const historicalFile = name =>
            [harness, "vibe/verified-examples/"]
                .map(directory => directory + name)
                .find(name => baseNames.includes(name));
        const oldManifestFile = historicalFile("manifest.json");
        const oldManifest = oldManifestFile ? JSON.parse(baseRead(oldManifestFile)) : [];
        const exemptions = new Map();
        for (const entry of entries.filter(entry => !entry.exampleId)) {
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
                if (
                    covered.has(id(block)) ||
                    project.has(id(block)) ||
                    gridOnly.has(id(block)) ||
                    exemptions.has(id(block))
                )
                    throw new Error(`Duplicate classification: ${entry.page}`);
                if (entry.requires && entry.requires !== "mobile")
                    throw new Error(`Unknown runtime requirement: ${entry.requires}`);
                exemptions.set(id(block), entry);
            } catch (error) {
                report.errors.push(error.message);
            }
        }
        // Do not let deleting a mapping downgrade a retained, previously covered block to debt/exemption.
        const previousRuntimes = new Map();
        for (const block of before) {
            const tag = marker(block);
            if (tag) previousRuntimes.set(id(block), tag.suite);
        }
        for (const entry of oldManifest) {
            for (const page of [entry.page, entry.translation].filter(Boolean)) {
                const block = before.filter(
                    block =>
                        block.page === page && block.language === (entry.language ?? "javascript"),
                )[entry.blockIndex ?? 0];
                if (block)
                    previousRuntimes.set(
                        id(block),
                        entry.test.startsWith("examples/selenium/") ? "selenium" : "chrome",
                    );
            }
        }
        const previouslyCovered = new Map();
        const available = new Map();
        for (const block of before) {
            const runtime = previousRuntimes.get(id(block));
            // A former Grid test is not a Chrome regression, but is not legacy debt either.
            if (runtime === "selenium") continue;
            const counts =
                runtime === "chrome" || runtime === "project" ? previouslyCovered : available;
            counts.set(key(block), (counts.get(key(block)) || 0) + 1);
        }
        const oldExemptionFile = historicalFile("non-executable.json");
        const oldExemptions = oldExemptionFile ? JSON.parse(baseRead(oldExemptionFile)) : [];
        for (const entry of oldExemptions) {
            const block = before.find(
                block => id(block) === id(entry) && block.sha256 === entry.sha256,
            );
            if (block) available.set(key(block), Math.max(0, (available.get(key(block)) || 0) - 1));
        }
        for (const block of current) {
            const blockId = id(block);
            const remaining = available.get(key(block)) || 0;
            let status = "uncovered";
            if (covered.has(blockId)) status = "covered";
            else if (project.has(blockId)) status = "project-check";
            else if (gridOnly.has(blockId)) status = "requires-grid";
            else if (exemptions.has(blockId))
                status = exemptions.get(blockId).requires
                    ? `requires-${exemptions.get(blockId).requires}`
                    : "non-executable";
            else if (remaining) {
                status = "legacy";
                available.set(key(block), remaining - 1);
            }
            const { value, meta, ...location } = block;
            report.blocks.push({
                ...location,
                status,
                ...(status === "legacy" ? { group: legacyGroup(block) } : {}),
                test: covered.get(blockId) ?? project.get(blockId),
                reason: gridOnly.get(blockId) ?? exemptions.get(blockId)?.reason.trim(),
            });
        }
        for (const [fingerprint, count] of previouslyCovered) {
            const retained = report.blocks.filter(block => key(block) === fingerprint);
            const missing =
                Math.min(count, retained.length) -
                retained.filter(block => ["covered", "project-check"].includes(block.status))
                    .length;
            for (const block of retained
                .filter(block => !["covered", "project-check"].includes(block.status))
                .slice(0, Math.max(0, missing)))
                block.status = "regression";
        }
    } catch (error) {
        report.errors.push(error.message);
    }
    for (const status of [
        "covered",
        "project-check",
        "legacy",
        "non-executable",
        "requires-grid",
        "requires-mobile",
        "uncovered",
        "regression",
    ])
        report.counts[status] = report.blocks.filter(block => block.status === status).length;
    report.ok = !report.errors.length && !report.counts.uncovered && !report.counts.regression;
    const debt = {};
    for (const block of report.blocks.filter(b => b.status === "legacy"))
        debt[block.group] = (debt[block.group] ?? 0) + 1;
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
        "Covered: inputs to local Chrome tests (including companion HTML). Project-check: examples checked separately in a temporary Testplane project. Neither count is a runtime result. Legacy and requires-* are not run.",
        "",
        "Mobile pages and versioned documentation (including v8) are excluded.",
        "",
        "The unchanged backlog below is not executed. A new or changed block in any of these groups still requires coverage or an explicitly reviewed classification.",
        "",
        ...Object.entries(debt)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, n]) => `- ${group}: ${n}`),
        "",
        "For runnable examples, add testplane=<stable-id> with an optional fixture, or use testplane-project=<recipe>. See test/doc-examples/README.md.",
        "",
        ...report.errors.map(error => `- ${escape(error)}`),
        "",
    ].join("\n");
    const rows = report.blocks.map(
        block =>
            `| ${escape(block.page)}:${block.line} | ${escape(block.language || "unlabelled")} #${block.blockIndex} | ${block.status} | ${escape(block.test || block.reason || block.group || "—")} |`,
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
            `${block.page}:${block.line}: ${block.status} (${block.language} #${block.blockIndex}, sha256=${block.sha256}). Add testplane=<stable-id> and run npm run generate:examples, or classify a non-executable block with a reason.`,
        );
    for (const error of report.errors)
        console.error(`Coverage error (base ${values.base}): ${error}`);
    process.exitCode = report.ok ? 0 : 1;
}
