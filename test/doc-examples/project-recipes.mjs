import { parse } from "@babel/parser";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Only declarative configs belong in this recipe. A callback, plugin, or import
// with side effects needs its own integration fixture, not arbitrary execution.
export function configModule(source) {
    const bindings = new Set();
    function data(node) {
        switch (node?.type) {
            case "TSSatisfiesExpression":
            case "TSAsExpression":
                return data(node.expression);
            case "ObjectExpression":
                return node.properties.every(
                    p =>
                        p.type === "ObjectProperty" &&
                        !p.computed &&
                        !["__proto__", "prototype", "constructor"].includes(
                            p.key.name ?? p.key.value,
                        ) &&
                        data(p.value),
                );
            case "ArrayExpression":
                return node.elements.every(data);
            case "UnaryExpression":
                return (
                    ["+", "-"].includes(node.operator) && node.argument.type === "NumericLiteral"
                );
            case "Identifier":
                return bindings.has(node.name);
            default:
                return [
                    "BooleanLiteral",
                    "StringLiteral",
                    "NumericLiteral",
                    "NullLiteral",
                    "RegExpLiteral",
                ].includes(node?.type);
        }
    }
    let exports = 0;
    for (const node of parse(source, { sourceType: "unambiguous", plugins: ["typescript"] }).program
        .body) {
        if (node.type === "ImportDeclaration" && node.importKind === "type") continue;
        if (
            node.type === "VariableDeclaration" &&
            node.kind === "const" &&
            node.declarations.every(
                d => d.id.type === "Identifier" && data(d.init) && bindings.add(d.id.name),
            )
        )
            continue;
        let value;
        if (node.type === "ExportDefaultDeclaration") value = node.declaration;
        if (node.type === "TSExportAssignment") value = node.expression;
        if (node.type === "ExpressionStatement") {
            const e = node.expression;
            if (
                e.type === "AssignmentExpression" &&
                e.operator === "=" &&
                e.left.type === "MemberExpression" &&
                !e.left.computed &&
                e.left.object.name === "module" &&
                e.left.property.name === "exports"
            )
                value = e.right;
        }
        if (!value || !data(value) || ++exports > 1)
            throw new Error(
                "Expected a declarative Testplane config export (no calls, hooks, or runtime imports)",
            );
    }
    if (exports !== 1) throw new Error("Expected one Testplane config export");
    const ts = require("typescript");
    return ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
}

// Config reference snippets may omit their project's desktop capabilities, but a
// typo or invalid explicit value must be seen by the real configuration parser.
export function withFixtureBrowsers(options) {
    const desktop = Object.fromEntries(
        ["chrome", "firefox", "safari"].map(name => [
            name,
            { desiredCapabilities: { browserName: name } },
        ]),
    );
    const object = o => o !== null && typeof o === "object" && !Array.isArray(o);
    const input = Object.hasOwn(options, "browsers") ? options.browsers : desktop;
    if (!object(input)) throw new Error("Expected a browsers object");
    const browsers = Object.fromEntries(
        Object.entries(input).map(([name, definition]) => {
            if (!object(definition)) throw new Error("Expected a browser definition: " + name);
            return [name, { ...(desktop[name] ?? {}), ...definition }];
        }),
    );
    return { ...options, browsers };
}

// No shell or npx process is spawned. Names are resolved to the lockfile's CLI.
// The option allowlist is intentionally small; new writable paths are not accepted.
const options = {
    run: { "--browser": /^chrome$/, "--set": /^desktop$/ },
    "--version": {},
    "--help": {},
    config: { "--space": /^\d$/, "--help": null },
    "list-browsers": { "--format": /^(plain|json)$/, "--type": /^(tags|ids)$/, "--help": null },
    "list-tests": {
        "--formatter": /^(tree|list)$/,
        "--browser": /^chrome$/,
        "--set": /^desktop$/,
        "--grep": /^[\w -]+$/,
        "--output-file": /^\.\/tests\.json$/,
        "--silent": null,
        "--help": null,
        "--config": /^\.\/local\.testplane\.config\.ts$/,
    },
};
export function cliCommands(source) {
    const commands = [];
    for (const line of source
        .split("\n")
        .map(s => s.trim())
        .filter(s => s && !s.startsWith("#"))) {
        const token = /"([^"]*)"|'([^']*)'|([\w./-]+)/y;
        const words = [];
        for (let i = 0; i < line.length; ) {
            token.lastIndex = i;
            const match = token.exec(line);
            if (!match || (token.lastIndex < line.length && line[token.lastIndex] !== " "))
                throw new Error("Unsupported CLI syntax");
            words.push(match[1] ?? match[2] ?? match[3]);
            i = token.lastIndex;
            while (line[i] === " ") i++;
        }
        if (words[0] === "npx") words.shift();
        if (words.shift() !== "testplane") throw new Error("Expected a local Testplane command");
        const run = !words.length || ["--set", "--browser"].includes(words[0]);
        if (!run && (!Object.hasOwn(options, words[0]) || words[0] === "run"))
            throw new Error("Unsupported Testplane command");
        const allowed = run ? options.run : options[words[0]];
        for (let i = run ? 0 : 1; i < words.length; i++) {
            const key = words[i];
            if (
                !Object.hasOwn(allowed, key) ||
                (allowed[key] && !allowed[key].test(words[++i] ?? ""))
            )
                throw new Error("Unsupported CLI option or argument: " + key);
        }
        commands.push(words);
    }
    if (!commands.length) throw new Error("No Testplane CLI commands");
    return commands;
}
