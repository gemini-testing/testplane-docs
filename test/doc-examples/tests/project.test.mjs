import assert from "node:assert/strict";
import { test } from "node:test";
import { configModule, cliCommands, withFixtureBrowsers } from "../project-recipes.mjs";

test("project setup only fills missing browser fields, never invalid documented values", () => {
    for (const browsers of [null, [], false, { chrome: false }, { chrome: null }, { chrome: [] }])
        assert.throws(() => withFixtureBrowsers({ browsers }));
    assert.equal(
        withFixtureBrowsers({ browsers: { chrome: { desiredCapabilities: null } } }).browsers.chrome
            .desiredCapabilities,
        null,
    );
    assert.equal(
        withFixtureBrowsers({ browsers: { chrome: { retry: 2 } } }).browsers.chrome
            .desiredCapabilities.browserName,
        "chrome",
    );
    assert.deepEqual(withFixtureBrowsers({ browsers: {} }).browsers, {});
});

test("loads the published TypeScript config, not a hand-written equivalent", () => {
    const module = configModule(
        'import type { ConfigInput } from "testplane";\nconst retries = 3;\nexport default {retry: retries} satisfies ConfigInput;',
    );
    assert.match(module, /retries = 3/);
    assert.match(module, /retry: retries/);
});

test("config recipes do not execute hooks, installers, or unknown imports", () => {
    for (const source of [
        'import "./run"; export default {retry: 3};',
        'export default {prepareEnvironment() { throw "ran"; }};',
        'export default {retry: Number("3")};',
        "export default {retry: missing};",
    ])
        assert.throws(() => configModule(source));
});

test("CLI recipes allow only explicit local inspection commands, never a shell", () => {
    assert.deepEqual(cliCommands('npx testplane list-tests --grep "nested path"'), [
        ["list-tests", "--grep", "nested path"],
    ]);
    assert.deepEqual(cliCommands("npx testplane\ntestplane --browser chrome"), [
        [],
        ["--browser", "chrome"],
    ]);
    for (const source of [
        "npx another-package",
        "testplane --help && echo ok",
        "testplane list-tests --output-file ../other",
        "testplane list-tests --require ./code",
        "testplane config; pwd",
        "testplane install-deps",
    ])
        assert.throws(() => cliCommands(source), source);
});
