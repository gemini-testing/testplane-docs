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
                        test: /\.(sa|sc|c)ss$/,
                        use: [
                            "style-loader",
                            "css-loader",
                            {
                                loader: "postcss-loader",
                                options: {
                                    postcssOptions: {
                                        ident: "postcss",
                                        plugins: [
                                            require("postcss-import"),
                                            require("tailwindcss"),
                                            require("autoprefixer"),
                                        ],
                                    },
                                },
                            },
                            "sass-loader",
                        ],
                    },
                ],
            },
        };
    },
};
export default config;
