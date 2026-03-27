import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        text: "var(--text)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        border: "var(--border)",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["Courier New", "Courier", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        reading: "640px",
      },
    },
  },
  plugins: [],
};

export default config;
