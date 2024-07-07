import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { tailwindPlugin } from "./plugins/tailwind";
import { svgFixDuplicateIdsPlugin } from "./plugins/svg-fix";

const config: Config = {
    title: "Testplane Docs",
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
        defaultLocale: "ru",
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
            disableSwitch: true,
        },
        image: "img/docusaurus-social-card.jpg",
        navbar: {
            title: "testplane",
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "mainSidebar",
                    position: "left",
                    label: "Docs",
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
                            href: "/docs/v8/config/main",
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
                            href: "/docs/v8/guides/how-to-write-your-own-plugin",
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
            copyright: `MIT License © ${new Date().getFullYear()}`,
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
    ],
};

export default config;
