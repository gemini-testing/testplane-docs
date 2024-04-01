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

To run all tests available, run:

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
