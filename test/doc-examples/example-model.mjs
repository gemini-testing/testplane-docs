import { parse } from "@babel/parser";
import { createRequire } from "node:module";
import { cliCommands, configModule } from "./project-recipes.mjs";

const require = createRequire(import.meta.url);
const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function marker(block) {
    const fields = new Map();
    for (const token of block.meta.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []) {
        const [, name, raw = ""] = /^([^=]+)(?:=(.*))?$/.exec(token);
        if (
            ![
                "testplane",
                "suite",
                "fixture",
                "testplane-html",
                "testplane-project",
                "transport",
            ].includes(name)
        )
            continue;
        if (fields.has(name)) throw new Error(`Duplicate ${name} metadata`);
        fields.set(name, raw.replace(/^(["'])(.*)\1$/, "$2"));
    }
    if (!fields.size) return null;
    if (fields.has("testplane-project")) {
        const kind = fields.get("testplane-project");
        const scriptLangs = ["js", "javascript", "ts", "typescript"];
        const langs = {
            config: scriptLangs,
            cli: ["bash", "shell", ""],
            event: ["js", "javascript"],
            collection: scriptLangs,
            reporter: [...scriptLangs, "bash", "shell"],
        };
        if (
            fields.size !== 1 ||
            !Object.hasOwn(langs, kind) ||
            !langs[kind].includes(block.language)
        )
            throw new Error(
                "Unknown project recipe or unsupported source language; see test/doc-examples/README.md",
            );
        return { kind, suite: "project" };
    }
    if (fields.has("testplane-html")) {
        const htmlFixture = fields.get("testplane-html");
        if (fields.size !== 1 || block.language !== "html" || !identifier.test(htmlFixture))
            throw new Error("Use html testplane-html=<fixture-name> on a companion HTML block");
        return { htmlFixture, suite: "chrome" };
    }
    const exampleId = fields.get("testplane");
    if (!exampleId || !identifier.test(exampleId))
        throw new Error("Use testplane=<stable-id> with a lowercase, hyphen-separated identifier");
    const suite = fields.get("suite") ?? "chrome";
    if (!["chrome", "selenium"].includes(suite)) throw new Error(`Unknown suite: ${suite}`);
    if (!["javascript", "js", "typescript", "ts"].includes(block.language))
        throw new Error(`Unsupported executable language: ${block.language}`);
    const fixture = fields.get("fixture");
    if (
        fixture !== undefined &&
        (!identifier.test(fixture) || !fixture.includes("-") || suite !== "chrome")
    )
        throw new Error("Use fixture=<group>-<variant> for local Chrome examples");
    const transport = fields.get("transport") ?? "bidi";
    if (!["bidi", "cdp"].includes(transport) || (transport === "cdp" && suite !== "chrome"))
        throw new Error("Select transport=bidi or transport=cdp for local Chrome");
    return {
        exampleId,
        suite,
        ...(transport === "cdp" ? { transport } : {}),
        ...(fixture ? { fixture } : {}),
    };
}

function testTitles(code, fixture = false, typed = false) {
    const ast = parse(code, {
        sourceType: typed ? "unambiguous" : "script",
        plugins: typed ? ["typescript"] : [],
    });
    const declarations = new Set();
    const titles = new Set();
    const register = (statements, parents = []) => {
        for (const statement of statements) {
            if (
                ["VariableDeclaration", "FunctionDeclaration", "EmptyStatement"].includes(
                    statement.type,
                )
            )
                continue;
            if (
                typed &&
                ["ImportDeclaration", "TSTypeAliasDeclaration", "TSInterfaceDeclaration"].includes(
                    statement.type,
                )
            )
                continue;
            const call = statement.type === "ExpressionStatement" && statement.expression;
            if (fixture && call?.type === "CallExpression" && call.callee.type === "Identifier") {
                if (call.callee.name === "describe") {
                    const [title, callback] = call.arguments;
                    if (
                        call.arguments.length !== 2 ||
                        title?.type !== "StringLiteral" ||
                        !title.value.trim() ||
                        !["FunctionExpression", "ArrowFunctionExpression"].includes(
                            callback?.type,
                        ) ||
                        callback.async ||
                        callback.generator ||
                        callback.body.type !== "BlockStatement"
                    )
                        throw new Error("Use static describe(title, () => { ... }) suites");
                    declarations.add(call.callee);
                    register(callback.body.body, [...parents, title.value]);
                    continue;
                }
                if (["beforeEach", "afterEach", "before", "after"].includes(call.callee.name)) {
                    const [fn] = call.arguments;
                    if (
                        call.arguments.length !== 1 ||
                        !["FunctionExpression", "ArrowFunctionExpression"].includes(fn?.type) ||
                        fn.generator
                    )
                        throw new Error("Use a function callback for each lifecycle hook");
                    declarations.add(call.callee);
                    continue;
                }
            }
            if (
                call?.type !== "CallExpression" ||
                call.callee.type !== "Identifier" ||
                call.callee.name !== "it"
            )
                throw new Error(
                    "Use unconditional top-level it(title, callback) tests, not fragments or dynamic registration",
                );
            const [title, callback] = call.arguments;
            if (title?.type !== "StringLiteral" || !title.value.trim())
                throw new Error("Each test title must be a nonempty string literal");
            if (
                call.arguments.length !== 2 ||
                callback?.generator ||
                !["ArrowFunctionExpression", "FunctionExpression"].includes(callback?.type)
            )
                throw new Error(
                    "Each it(title, callback) needs a non-generator function callback; pending tests are not supported",
                );
            const fullTitle = [...parents, title.value].join(" ");
            if (titles.has(fullTitle)) throw new Error(`Duplicate test title: ${fullTitle}`);
            titles.add(fullTitle);
            declarations.add(call.callee);
        }
    };
    register(ast.program.body);
    const visit = (node, parent) => {
        if (!node || typeof node !== "object") return;
        if (
            node.type === "Identifier" &&
            (["it", "describe"].includes(node.name) ||
                (parent?.callee === node &&
                    ["beforeEach", "afterEach", "before", "after"].includes(node.name))) &&
            !declarations.has(node)
        ) {
            const property =
                ["MemberExpression", "ObjectProperty", "ObjectMethod"].includes(parent?.type) &&
                !parent.computed &&
                (parent.property === node || parent.key === node);
            if (!property)
                throw new Error(
                    "Only direct top-level it(...) registration is supported; no nested or aliased tests",
                );
        }
        for (const [key, child] of Object.entries(node)) {
            if (["loc", "comments", "tokens"].includes(key)) continue;
            if (Array.isArray(child)) child.forEach(item => visit(item, node));
            else if (child && typeof child === "object") visit(child, node);
        }
    };
    visit(ast);
    if (!titles.size)
        throw new Error("Expected at least one complete top-level it(title, callback) test");
    return [...titles];
}

function compile(block, tag, html) {
    let source = block.value + "\n";
    const typed = ["ts", "typescript"].includes(block.language);
    if (typed) {
        const ts = require("typescript");
        const result = ts.transpileModule(source, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
            reportDiagnostics: true,
        });
        if (result.diagnostics.length)
            throw new Error(
                ts.flattenDiagnosticMessageText(result.diagnostics[0].messageText, "\n"),
            );
        source = result.outputText;
    }
    if (!tag.fixture) return { code: source, titles: testTitles(block.value, false, typed) };
    const [group, ...rest] = tag.fixture.split("-");
    const args = `browser, ${JSON.stringify(rest.join("-"))}`;
    const ast = parse(source, { sourceType: "script", allowAwaitOutsideFunction: true });
    // Type-only imports may emit only the CommonJS __esModule flag. Neither
    // that flag nor a comment makes a runnable browser example.
    if (
        !ast.program.body.some(
            s =>
                !["EmptyStatement"].includes(s.type) &&
                !/^Object\.defineProperty\(exports, ["']__esModule["'],/.test(
                    source.slice(s.start, s.end),
                ),
        )
    )
        throw new Error("Expected an executable statement, not an empty or type-only fragment");
    const full = ast.program.body.some(
        s =>
            s.type === "ExpressionStatement" &&
            s.expression.type === "CallExpression" &&
            ["describe", "it"].includes(s.expression.callee.name),
    );
    // Validate both forms with the same registration rules (including nested/aliased tests).
    const body = full
        ? source
        : `it(${JSON.stringify(tag.exampleId)}, async context => {\nconst { browser } = context;\n${source}\n});\n`;
    const titles = full ? testTitles(block.value, true, typed) : testTitles(body);
    const code = [
        `const fixture = require("../../fixtures/${group}.cjs");`,
        `describe(${JSON.stringify(tag.exampleId)}, () => {`,
        html
            ? `beforeEach(async ({ browser }) => require("../../fixtures/document.cjs").documentedPage(fixture, ${args}, ${JSON.stringify(html.value)}));`
            : `beforeEach(async ({ browser }) => fixture.setup(${args}));`,
        `afterEach(async ({ browser }) => fixture.verify?.(${args}));`,
        body,
        "});",
        "",
    ].join("\n");
    return { code, titles: titles.map(title => tag.exampleId + " " + title) };
}

export function collectExamples(blocks, exemptions, names = []) {
    const examples = new Map();
    const locations = new Set();
    const titleFiles = new Map();
    const manifest = [];
    const gridOnly = [];
    const errors = [];
    const tags = new Map();
    const projects = [];
    const inputs = new Map();
    const used = new Set();
    for (const block of blocks) {
        try {
            const tag = marker(block);
            if (!tag) continue;
            if (tag.kind) {
                if (tag.kind === "cli") cliCommands(block.value);
                else if (tag.kind === "config") configModule(block.value);
                projects.push({
                    kind: tag.kind,
                    page: block.page,
                    line: block.line,
                    language: block.language,
                    blockIndex: block.blockIndex,
                    source: block.value,
                    sha256: block.sha256,
                });
            } else if (tag.htmlFixture) {
                const key = `${block.page}\0${tag.htmlFixture}`;
                if (inputs.has(key)) throw new Error(`Duplicate HTML fixture: ${tag.htmlFixture}`);
                inputs.set(key, block);
            } else tags.set(block, tag);
        } catch (error) {
            errors.push(`${block.page}:${block.line}: ${error.message}`);
        }
    }
    for (const [block, tag] of tags) {
        try {
            const { exampleId, suite } = tag;
            const location = `${block.page}\0${exampleId}`;
            if (locations.has(location))
                throw new Error(`Duplicate example id on this page: ${exampleId}`);
            locations.add(location);
            if (
                tag.fixture &&
                !names.includes(`test/doc-examples/fixtures/${tag.fixture.split("-")[0]}.cjs`)
            )
                throw new Error(`Unknown fixture group: ${tag.fixture}`);
            const html = inputs.get(`${block.page}\0${tag.fixture}`);
            const previous = examples.get(exampleId);
            const built = compile(block, tag, html);
            if (
                previous &&
                (previous.source !== block.value ||
                    previous.code !== built.code ||
                    previous.suite !== suite ||
                    previous.transport !== tag.transport)
            )
                throw new Error(
                    `Conflicting code or suite for ${exampleId}; differs from ${previous.page}:${previous.line}`,
                );
            const count = built.titles.length;
            if (suite === "chrome")
                for (const title of built.titles) {
                    const key = (tag.transport ?? "bidi") + "\0" + title;
                    const other = titleFiles.get(key);
                    if (other && other !== exampleId)
                        throw new Error(
                            `Duplicate full test title "${title}" in ${other} and ${exampleId}`,
                        );
                    titleFiles.set(key, exampleId);
                }
            const test =
                suite === "chrome" ? `generated/chrome/${exampleId}.testplane.js` : undefined;
            examples.set(exampleId, {
                ...tag,
                test,
                source: block.value,
                code: built.code,
                testCount: count,
                page: block.page,
                line: block.line,
            });
            if (!test) {
                const approvals = exemptions.filter(entry => entry.exampleId === exampleId);
                const approval = approvals[0];
                if (
                    approvals.length !== 1 ||
                    approval.sha256 !== block.sha256 ||
                    !approval.reason?.trim()
                )
                    throw new Error(
                        `CI runs local Chrome only. Remove suite=selenium if supported, or review the Grid-only exception in non-executable.json (exampleId=${exampleId}, sha256=${block.sha256}).`,
                    );
                gridOnly.push({ ...block, reason: approval.reason.trim() });
                continue;
            }
            if (html) used.add(html);
            for (const input of [block, ...(html ? [html] : [])])
                manifest.push({
                    page: input.page,
                    language: input.language,
                    blockIndex: input.blockIndex,
                    exampleId,
                    suite,
                    ...(tag.transport ? { transport: tag.transport } : {}),
                    test,
                    testTitles: built.titles,
                    testCount: count,
                });
        } catch (error) {
            errors.push(`${block.page}:${block.line}: ${error.message}`);
        }
    }
    for (const block of inputs.values())
        if (!used.has(block))
            errors.push(`${block.page}:${block.line}: Unused documented HTML fixture`);
    return {
        manifest,
        projects,
        examples: [...examples.values()]
            .filter(example => example.test)
            .sort((a, b) => a.test.localeCompare(b.test)),
        gridOnly,
        errors,
    };
}
