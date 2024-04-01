import type { Config } from "tailwindcss";

export default {
    content: ["./{src,docs,blog}/**/*.{jsx,tsx,html}"],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;
