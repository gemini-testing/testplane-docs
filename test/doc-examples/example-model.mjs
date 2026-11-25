import { parse } from "@babel/parser";

export function marker(block) {
    const fields = new Map();
    for (const token of block.meta.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []) {
        const [, name, raw = ""] = /^([^=]+)(?:=(.*))?$/.exec(token);
        if (!["testplane", "suite"].includes(name)) continue;
        if (fields.has(name)) throw new Error(`Duplicate ${name} metadata`);
        fields.set(name, raw.replace(/^(["'])(.*)\1$/, "$2"));
    }
    if (!fields.size) return null;
    const exampleId = fields.get("testplane");
    if (!exampleId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(exampleId))
        throw new Error("Use testplane=<stable-id> with a lowercase, hyphen-separated identifier");
    const suite = fields.get("suite") ?? "chrome";
    if (!["chrome", "selenium"].includes(suite)) throw new Error(`Unknown suite: ${suite}`);
    if (!["javascript", "js"].includes(block.language))
        throw new Error(
            `Unsupported executable language: ${block.language}; use JavaScript/CommonJS`,
        );
    return { exampleId, suite };
}

function testCount(code) {
    const ast = parse(code, { sourceType: "script" });
    const declarations = new Set();
    const titles = new Set();
    for (const statement of ast.program.body) {
        if (
            ["VariableDeclaration", "FunctionDeclaration", "EmptyStatement"].includes(
                statement.type,
            )
        )
            continue;
        const call = statement.type === "ExpressionStatement" && statement.expression;
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
        if (titles.has(title.value)) throw new Error(`Duplicate test title: ${title.value}`);
        titles.add(title.value);
        declarations.add(call.callee);
    }
    const visit = (node, parent) => {
        if (!node || typeof node !== "object") return;
        if (node.type === "Identifier" && node.name === "it" && !declarations.has(node)) {
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
    return titles.size;
}

export function collectExamples(blocks) {
    const examples = new Map();
    const locations = new Set();
    const manifest = [];
    const errors = [];
    for (const block of blocks) {
        try {
            const tag = marker(block);
            if (!tag) continue;
            const { exampleId, suite } = tag;
            const location = `${block.page}\0${exampleId}`;
            if (locations.has(location))
                throw new Error(`Duplicate example id on this page: ${exampleId}`);
            locations.add(location);
            const previous = examples.get(exampleId);
            if (previous && (previous.code !== block.value + "\n" || previous.suite !== suite))
                throw new Error(
                    `Conflicting code or suite for ${exampleId}; differs from ${previous.page}:${previous.line}`,
                );
            const count = previous?.testCount ?? testCount(block.value);
            const test = `generated/${suite}/${exampleId}.testplane.js`;
            examples.set(exampleId, {
                ...tag,
                test,
                code: block.value + "\n",
                testCount: count,
                page: block.page,
                line: block.line,
            });
            manifest.push({
                page: block.page,
                language: block.language,
                blockIndex: block.blockIndex,
                exampleId,
                suite,
                test,
                testCount: count,
            });
        } catch (error) {
            errors.push(`${block.page}:${block.line}: ${error.message}`);
        }
    }
    return {
        manifest,
        examples: [...examples.values()].sort((a, b) => a.test.localeCompare(b.test)),
        errors,
    };
}
