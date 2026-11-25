import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { defaultRoot, harness, inventory, isDoc, isMobile, repository } from "./doc-sources.mjs";
import { collectExamples, marker } from "./example-model.mjs";

const key = block => `${block.page}\0${block.language}\0${block.sha256}`;
const id = block => `${block.page}\0${block.language}\0${block.blockIndex}`;
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
        const { git, read, names: currentNames } = repository(root);
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
        const plan = collectExamples(current);
        report.errors.push(...plan.errors);
        const covered = new Map(plan.manifest.map(entry => [id(entry), entry.test]));
        // Compatibility with Git baselines predating generation and the harness move.
        const historicalFile = name =>
            [harness, "vibe/verified-examples/"]
                .map(directory => directory + name)
                .find(name => baseNames.includes(name));
        const oldManifestFile = historicalFile("manifest.json");
        const oldManifest = oldManifestFile ? JSON.parse(baseRead(oldManifestFile)) : [];
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
        const previousBlocks = new Map();
        for (const block of before) {
            if (marker(block)) previousBlocks.set(id(block), block);
        }
        for (const entry of oldManifest) {
            for (const page of [entry.page, entry.translation].filter(Boolean)) {
                const block = before.filter(
                    block =>
                        block.page === page && block.language === (entry.language ?? "javascript"),
                )[entry.blockIndex ?? 0];
                if (block) previousBlocks.set(id(block), block);
            }
        }
        const previouslyCovered = new Map();
        for (const block of previousBlocks.values())
            previouslyCovered.set(key(block), (previouslyCovered.get(key(block)) || 0) + 1);
        const available = new Map();
        for (const block of before) available.set(key(block), (available.get(key(block)) || 0) + 1);
        // Only baseline debt can pay for unclassified occurrences. Covered/exempt
        // copies must neither consume debt credits nor create new ones by reordering.
        for (const [fingerprint, count] of previouslyCovered) {
            available.set(fingerprint, Math.max(0, (available.get(fingerprint) || 0) - count));
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
            const { value, meta, ...location } = block;
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
        "Covered means eligible for test generation from documentation, not a successful browser run.",
        "",
        "Mobile pages and versioned documentation (including v8) are excluded.",
        "",
        "For new/changed runnable examples, add testplane=<stable-id> to the JavaScript fence and run npm run generate:examples. Classify non-executable blocks explicitly with a reason.",
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
            `${block.page}:${block.line}: ${block.status} (${block.language} #${block.blockIndex}, sha256=${block.sha256}). Add testplane=<stable-id> and run npm run generate:examples, or classify a non-executable block with a reason.`,
        );
    for (const error of report.errors)
        console.error(`Coverage error (base ${values.base}): ${error}`);
    process.exitCode = report.ok ? 0 : 1;
}
