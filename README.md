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

Write the test once, in a JavaScript code block, and add `testplane=<stable-id>` to the opening fence. CI generates the test from that block on every run. On current non-mobile EN/RU pages, a new or changed block without coverage fails the check unless it is explicitly classified as non-executable.

The browser suites use Node.js 22.21.1, **not** the version in the site's `.nvmrc`. From the repository root, install both sets of dependencies and run the Chrome suite:

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
See the [example authoring and Selenium setup guide](test/doc-examples/README.md).
