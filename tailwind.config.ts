import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          black: "#050505",
          red: "rgb(var(--color-studio-red, 229 9 20) / <alpha-value>)",
          gold: "rgb(var(--color-studio-gold, 217 164 65) / <alpha-value>)",
          smoke: "#111114",
          line: "#28211a"
        }
      },
      boxShadow: {
        glow: "0 0 34px var(--brand-glow)",
        gold: "0 0 28px rgba(217, 164, 65, 0.22)"
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "Arial", "sans-serif"],
        body: ["Inter", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
