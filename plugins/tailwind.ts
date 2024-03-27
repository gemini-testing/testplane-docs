export function tailwindPlugin() {
    return {
        name: "tailwind-plugin",
        configurePostCss(postcssOptions: { plugins: unknown[] }) {
            postcssOptions.plugins = [
                require("postcss-import"),
                require("tailwindcss"),
                require("autoprefixer"),
            ];
            return postcssOptions;
        },
    };
}
