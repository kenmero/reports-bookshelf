import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                custom: {
                    midnight: "#0F172A", // Slate 900
                    deep: "#1E293B",     // Slate 800
                    accent: "#38BDF8",   // Sky 400
                    text: "#F8FAFC",     // Slate 50
                    muted: "#94A3B8",    // Slate 400
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                mono: ['monospace'],
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
export default config;
