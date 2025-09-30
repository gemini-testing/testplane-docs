import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
    content: ["./{src,docs,blog}/**/*.{jsx,tsx,html}"],
    theme: {
        screens: {
            xs: "380px",
            ...defaultTheme.screens,
        },
        fontFamily: {
            sans: ["Jost", "sans-serif"],
            mono: ["Roboto Mono", "monospace"],
        },
        extend: {},
    },
    plugins: [],
} satisfies Config;
