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

    // TODO: set to throw once we start adding actual docs pages
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
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
                    editUrl: "https://github.com/gemini-testing/testplane-docs/tree/main/docs/",
                },
                blog: {
                    showReadingTime: true,
                    editUrl: "https://github.com/gemini-testing/testplane-docs/tree/main/blog/",
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
                            label: "Installation",
                            to: "#",
                        },
                        {
                            label: "Writing your first tests",
                            to: "#",
                        },
                        {
                            label: "Why testplane?",
                            to: "#",
                        },
                    ],
                },
                {
                    title: "Core concepts",
                    items: [
                        {
                            label: "Browser commands",
                            href: "#",
                        },
                        {
                            label: "Testplane config",
                            href: "#",
                        },
                        {
                            label: "Testplane UI",
                            href: "#",
                        },
                    ],
                },
                {
                    title: "Customization",
                    items: [
                        {
                            label: "Custom commands",
                            href: "#",
                        },
                        {
                            label: "Plugins and reporters",
                            href: "#",
                        },
                        {
                            label: "Usage in CI",
                            href: "#",
                        },
                    ],
                },
                {
                    title: "Resources",
                    items: [
                        {
                            label: "Docs",
                            href: "#",
                        },
                        {
                            label: "Blog",
                            href: "#",
                        },
                        {
                            label: "Changelog",
                            to: "#",
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
    } satisfies Preset.ThemeConfig,

    plugins: ["docusaurus-plugin-sass", tailwindPlugin, svgFixDuplicateIdsPlugin],
};

export default config;
