import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { tailwindPlugin } from "./plugins/tailwind";

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
                    customCss: "./src/scss/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: "img/docusaurus-social-card.jpg",
        navbar: {
            title: "testplane",
            logo: {
                alt: "Testplane Logo",
                src: "img/logo.svg",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "mainSidebar",
                    position: "left",
                    label: "Tutorial",
                },
                { to: "#", label: "Blog", position: "left" },
                {
                    href: "https://github.com/facebook/docusaurus",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Configuration",
                            to: "#",
                        },
                        {
                            label: "Events",
                            to: "#",
                        },
                        {
                            label: "API reference",
                            to: "#",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/gemini-testing/testplane",
                        },
                        {
                            label: "Stack Overflow",
                            href: "https://stackoverflow.com/questions/tagged/testplane",
                        },
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "Releases",
                            to: "https://github.com/gemini-testing/testplane/releases",
                        },
                        {
                            label: "Installation",
                            href: "#",
                        },
                        {
                            label: "First tests with testplane",
                            href: "#",
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

    plugins: ["docusaurus-plugin-sass", tailwindPlugin],
};

export default config;
