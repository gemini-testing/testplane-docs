import * as path from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-onboarding",
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
                        test: /\.(sa|sc|c)ss$/, // Test for .sass, .scss and .css files
                        use: [
                            // MiniCssExtractPlugin.loader, // Extract css into separate files
                            "style-loader",
                            "css-loader", // Translates CSS into CommonJS
                            {
                                loader: "postcss-loader", // Loader for webpack to process CSS with PostCSS
                                options: {
                                    postcssOptions: {
                                        ident: "postcss",
                                        plugins: [
                                            require("postcss-import"),
                                            require("tailwindcss"), // use tailwindcss
                                            require("autoprefixer"), // add vendor prefixes
                                        ],
                                    },
                                },
                            },
                            "sass-loader", // Compiles Sass to CSS
                        ],
                    },
                ],
            },
        };
    },
};
export default config;
