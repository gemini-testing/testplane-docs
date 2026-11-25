# Testplane Docs Website

Testplane is a modern and robust end-to-end testing framework. It features support for every browser with a single API, testing on real devices, great extensibility and vast visual testing capabilities.

This repository is a home for Testplane docs website.

## Development

### Install dependencies

```shell
nvm use
npm ci
```

### Run local dev server

```shell
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Check your changes

This repository uses TypeScript, Eslint and Prettier.

To run linting, type checks and the example-checker unit tests, run:

```shell
npm test
```

To check types, run:

```shell
npm run typecheck
```

To fix code issues and formatting, run:

```shell
npm run reformat
```

### Check documentation examples

Write the example once, in the documentation. Add `testplane=<stable-id>` to a JavaScript or TypeScript fence; short snippets can use a fixture and the HTML shown on the same page. For CLI, configuration or API examples, use a temporary-project recipe. CI regenerates and runs all enrolled examples on every PR. A new or changed block on a current non-mobile EN/RU page must have coverage or a reviewed exception. The report lists unchanged, untested examples separately from runtime results.

The Chrome suite uses Node.js 22.21.1, **not** the version in the site's `.nvmrc`. From the repository root, install both sets of dependencies and run it:

```shell
nvm install 22.21.1
nvm use 22.21.1
npm ci
npm --prefix test/doc-examples ci --legacy-peer-deps
npm run check:examples -- --base origin/master
npm run test:examples
```

Browser tests run separately from `npm test`. To inspect the generated files without
launching a browser, run `npm run generate:examples`. Do not commit the generated files.
See the [example authoring and Chrome setup guide](test/doc-examples/README.md).
