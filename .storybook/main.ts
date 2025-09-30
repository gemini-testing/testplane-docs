import path from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@chromatic-com/storybook",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    docs: {
        autodocs: "tag",
    },
    swc: () => ({
        jsc: {
            transform: {
                react: {
                    runtime: "automatic",
                },
            },
        },
    }),
    webpackFinal: config => {
        if (config.module && config.module.rules) {
            const { rules } = config.module;

            const fileLoaderRule = rules.find(rule => rule?.test && rule.test.test(".svg")) as
                | { exclude: RegExp }
                | undefined;
            if (fileLoaderRule) {
                fileLoaderRule.exclude = /\.svg$/;
            }

            const cssLoaderIndex = rules.findIndex(rule => rule?.test && rule.test.test(".css"));
            rules.splice(cssLoaderIndex, 1);
        }

        const postCssLoader = {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    ident: "postcss",
                    plugins: [require("@tailwindcss/postcss")],
                },
            },
        };

        return {
            ...config,
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve?.alias,
                    "@site": path.resolve(fileURLToPath(import.meta.url), "../.."),
                },
            },
            module: {
                ...config.module,
                rules: [
                    ...(config.module?.rules as Record<string, any>[]),
                    {
                        test: /\.(sa|sc)ss$/,
                        use: ["style-loader", "css-loader", postCssLoader, "sass-loader"],
                    },
                    {
                        test: /\.css$/,
                        use: ["style-loader", "css-loader", postCssLoader],
                    },
                    {
                        test: /\.svg$/,
                        use: ["@svgr/webpack"],
                    },
                ],
            },
        };
    },
};
export default config;
