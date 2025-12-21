import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { tailwindPlugin } from "./plugins/tailwind";
import { svgFixDuplicateIdsPlugin } from "./plugins/svg-fix";

const config: Config = {
    title: "Testplane",
    tagline: "Testplane is a modern end-to-end testing framework.",
    favicon: "img/favicon.ico",

    // Set the production url of your site here
    url: process.env.DOCUSAURUS_URL ?? "https://testplane.example.com",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: process.env.DOCUSAURUS_BASE_URL ?? "/",

    // GitHub pages deployment config.
    organizationName: "gemini-testing",
    projectName: "testplane-docs",

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "throw",

    trailingSlash: true,

    i18n: {
        defaultLocale: "en",
        locales: ["en", "ru"],
    },
    headTags: [
        {
            tagName: "link",
            attributes: {
                href: "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap",
                rel: "stylesheet",
            },
        },
    ],
    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl: "https://github.com/gemini-testing/testplane-docs/tree/master/",
                    lastVersion: "current",
                    breadcrumbs: false,
                    versions: {
                        current: {
                            label: "v8",
                            path: "v8",
                        },
                    },
                },
                blog: {
                    showReadingTime: true,
                    editUrl: "https://github.com/gemini-testing/testplane-docs/tree/master/",
                },
                theme: {
                    customCss: "./src/scss/custom.scss",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        colorMode: {
            disableSwitch: false,
        },
        image: "img/docusaurus-social-card.jpg",
        navbar: {
            hideOnScroll: true,
            title: "testplane",
            logo: {
                alt: "Testplane Logo",
                src: "img/logo.svg",
                srcDark: "img/logo-dark.svg",
                target: "_self",
                width: 28,
                height: 28,
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "mainSidebar",
                    position: "left",
                    label: "Docs",
                },
                {
                    type: "docSidebar",
                    sidebarId: "api",
                    position: "left",
                    label: "API",
                },
                {
                    type: "docSidebar",
                    sidebarId: "ui",
                    position: "left",
                    label: "UI",
                },
                { to: "/blog", label: "Blog", position: "left" },
                {
                    type: "docsVersionDropdown",
                    position: "right",
                    dropdownItemsAfter: [{ to: "/versions", label: "All versions" }],
                    dropdownActiveClassDisabled: true,
                },
                {
                    type: "localeDropdown",
                    position: "right",
                },
                {
                    href: "https://github.com/gemini-testing/testplane",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Quickstart",
                    items: [
                        {
                            label: "Overview",
                            to: "/docs/v8",
                        },
                        {
                            label: "Installation",
                            to: "/docs/v8/quickstart",
                        },
                        {
                            label: "Why testplane?",
                            to: "/docs/v8#why-testplane",
                        },
                    ],
                },
                {
                    title: "Core concepts",
                    items: [
                        {
                            label: "Browser commands",
                            href: "/docs/v8/commands/overview",
                        },
                        {
                            label: "Testplane config",
                            href: "/docs/v8/reference/config/main",
                        },
                        {
                            label: "Testplane UI",
                            href: "/docs/v8/html-reporter/html-reporter-setup",
                        },
                    ],
                },
                {
                    title: "Customization",
                    items: [
                        {
                            label: "Testplane API",
                            href: "/docs/v8/reference/testplane-api",
                        },
                        {
                            label: "Testplane events",
                            href: "/docs/v8/reference/testplane-events",
                        },
                        {
                            label: "Plugins",
                            href: "/docs/v8/plugins/hermione-browser-version-changer",
                        },
                    ],
                },
                {
                    title: "Resources",
                    items: [
                        {
                            label: "Docs",
                            href: "/docs/v8",
                        },
                        {
                            label: "Blog",
                            href: "/blog",
                        },
                        {
                            label: "Changelog",
                            to: "https://github.com/gemini-testing/testplane/blob/master/CHANGELOG.md",
                        },
                    ],
                },
            ],
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
        algolia: {
            appId: "GEUAOEJ3NK",
            apiKey: "329ccc709854898024bad32d341d441f",
            indexName: "testplane",
        },
    } satisfies Preset.ThemeConfig,

    plugins: [
        "docusaurus-plugin-sass",
        tailwindPlugin,
        svgFixDuplicateIdsPlugin,
        [
            "docusaurus-plugin-yandex-metrica",
            {
                counterID: "97719088",
                webvisor: true,
                trackHash: true,
            },
        ],
        [
            "@docusaurus/plugin-client-redirects",
            {
                redirects: [
                    // Guides moved to Basic Guides
                    {
                        from: "/docs/v8/guides/component-testing",
                        to: "/docs/v8/basic-guides/component-testing",
                    },
                    {
                        from: "/docs/v8/guides/custom-commands",
                        to: "/docs/v8/basic-guides/custom-commands",
                    },
                    {
                        from: "/docs/v8/guides/how-to-debug-test",
                        to: "/docs/v8/basic-guides/debugging-tests",
                    },
                    {
                        from: "/docs/v8/guides/local-browsers",
                        to: "/docs/v8/basic-guides/managing-browsers",
                    },
                    {
                        from: "/docs/v8/guides/how-to-get-report",
                        to: "/docs/v8/basic-guides/reporters",
                    },
                    {
                        from: "/docs/v8/guides/time-travel",
                        to: "/docs/v8/basic-guides/time-travel",
                    },

                    // Visual Testing moved to Basic Guides
                    {
                        from: "/docs/v8/visual-testing/with-storybook",
                        to: "/docs/v8/basic-guides/visual-testing-with-storybook",
                    },
                    {
                        from: "/docs/v8/visual-testing/visual-testing-intro",
                        to: "/docs/v8/basic-guides/visual-testing",
                    },

                    // Guides restructured
                    {
                        from: "/docs/v8/guides/how-to-hide-scrollbars",
                        to: "/docs/v8/guides/visual-checks-best-practices/hiding-scrollbars",
                    },

                    // Command Line moved to Reference
                    {
                        from: "/docs/v8/command-line",
                        to: "/docs/v8/reference/cli",
                    },

                    // Config moved to Reference/Config
                    {
                        from: "/docs/v8/config/after-all",
                        to: "/docs/v8/reference/config/after-all",
                    },
                    {
                        from: "/docs/v8/config/before-all",
                        to: "/docs/v8/reference/config/before-all",
                    },
                    {
                        from: "/docs/v8/config/browsers",
                        to: "/docs/v8/reference/config/browsers",
                    },
                    {
                        from: "/docs/v8/config/dev-server",
                        to: "/docs/v8/reference/config/dev-server",
                    },
                    {
                        from: "/docs/v8/config/last-failed",
                        to: "/docs/v8/reference/config/last-failed",
                    },
                    {
                        from: "/docs/v8/config/main",
                        to: "/docs/v8/reference/config/main",
                    },
                    {
                        from: "/docs/v8/config/plugins",
                        to: "/docs/v8/reference/config/plugins",
                    },
                    {
                        from: "/docs/v8/config/prepare-browser",
                        to: "/docs/v8/reference/config/prepare-browser",
                    },
                    {
                        from: "/docs/v8/config/prepare-environment",
                        to: "/docs/v8/reference/config/prepare-environment",
                    },
                    {
                        from: "/docs/v8/config/sets",
                        to: "/docs/v8/reference/config/sets",
                    },
                    {
                        from: "/docs/v8/config/system",
                        to: "/docs/v8/reference/config/system",
                    },
                ],
            },
        ],
    ],
};

export default config;
