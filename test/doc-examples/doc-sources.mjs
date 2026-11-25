import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";

export const harness = "test/doc-examples/";
export const defaultRoot = fileURLToPath(new URL("../../", import.meta.url));
export const roots = ["docs/", "i18n/ru/docusaurus-plugin-content-docs/current/"];
export function readExemptions({ names, read }) {
    const file = `${harness}non-executable.json`;
    return names.includes(file) ? JSON.parse(read(file)) : [];
}
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
export const isDoc = name => roots.some(root => name.startsWith(root)) && /\.mdx?$/.test(name);
export const isMobile = name =>
    mobile.has(name.slice(roots.find(root => name.startsWith(root)).length).replace(/\.mdx?$/, ""));
export function blocks(page, source) {
    const result = [];
    const indexes = new Map();
    let section;
    const visit = node => {
        if (node.type === "heading") {
            const text = source.slice(node.position.start.offset, node.position.end.offset);
            section = /\/\*\s*#([\w-]+)\s*\*\//.exec(text)?.[1];
        }
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
                meta: node.meta || "",
                section,
            });
            if (jsxCode) return;
        }
        for (const child of node.children || []) visit(child);
    };
    visit(parser.parse(source));
    return result;
}

export function repository(directory = defaultRoot) {
    const root = fs.realpathSync(directory);
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
    const names = [
        ...new Set(git("ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0")),
    ]
        .filter(name => name && fs.existsSync(path.join(root, name)))
        .sort();
    return { root, git, read, names };
}

export function inventory(names, read, errors) {
    return names
        .filter(name => isDoc(name) && !isMobile(name))
        .flatMap(name => {
            try {
                return blocks(name, read(name));
            } catch (error) {
                errors.push(`${name}: ${error.message}`);
                return [];
            }
        });
}
