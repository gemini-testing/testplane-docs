import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { defaultRoot, harness, inventory, readExemptions, repository } from "./doc-sources.mjs";
import { collectExamples } from "./example-model.mjs";

// This fixed, ignored directory belongs to the generator. Never follow output symlinks.
function clearOutput(root) {
    let current = root;
    for (const segment of `${harness}generated`.split("/")) {
        current = path.join(current, segment);
        if (fs.lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink())
            throw new Error(`Refusing generated output symlink: ${current}`);
    }
    fs.rmSync(current, { recursive: true, force: true });
    return current;
}

export function generate(directory = defaultRoot) {
    const root = fs.realpathSync(directory);
    const output = clearOutput(root);
    const repo = repository(root);
    const errors = [];
    const blocks = inventory(repo.names, repo.read, errors);
    const result = collectExamples(blocks, readExemptions(repo), repo.names);
    errors.push(...result.errors);
    if (errors.length) throw new Error(errors.join("\n"));
    for (const example of result.examples) {
        const filename = path.join(root, harness, example.test);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, example.code);
    }
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
        path.join(output, "project.json"),
        JSON.stringify(result.projects, null, 2) + "\n",
    );
    fs.writeFileSync(
        path.join(output, "manifest.json"),
        JSON.stringify(result.manifest, null, 2) + "\n",
    );
    console.log(
        `Generated ${result.examples.length} Chrome files from ${new Set(result.manifest.map(m => JSON.stringify([m.page, m.language, m.blockIndex]))).size} documentation blocks; ${result.projects.length} project blocks.`,
    );
    return result.manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    try {
        const { values } = parseArgs({
            options: { root: { type: "string", default: defaultRoot } },
        });
        generate(values.root);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
