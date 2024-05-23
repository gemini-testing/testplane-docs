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
    safelist: [
        // Classes used for code highlighting
        "text-green-400",
        "text-pink-500",
        "text-violet-400",
        "italic",
        // Classes used for "add to cart" button on demo page
        "hidden",
        "outline",
        "outline-2",
        "outline-indigo-300",
    ],
    plugins: [],
} satisfies Config;
