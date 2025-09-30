export function tailwindPlugin() {
    return {
        name: "tailwind-plugin",
        configurePostCss(postcssOptions: { plugins: unknown[] }) {
            postcssOptions.plugins = [require("@tailwindcss/postcss")];
            return postcssOptions;
        },
    };
}
