import eslint from "@eslint/js";
import geminiTesting from "eslint-config-gemini-testing";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import reactJsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "node_modules/**",
            ".docusaurus/**",
            "babel.config.js",
            "eslint.config.mjs",
            "storybook-static/**",
            "build/**",
            "tmp/**",
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        files: ["plugins/tailwind.ts"],
        languageOptions: {
            globals: {
                require: true,
            },
        },
    },
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    reactRecommended,
    reactJsxRuntime,
    {
        rules: geminiTesting.rules,
    },
    prettier,
);
