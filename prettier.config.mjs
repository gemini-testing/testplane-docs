/** @type {import("prettier").Config} */
export default {
    printWidth: 100,
    useTabs: false,
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "avoid",
    plugins: ["prettier-plugin-tailwindcss"],
};
