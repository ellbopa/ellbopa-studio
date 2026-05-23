import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          black: "#050505",
          red: "#e50914",
          gold: "#d9a441",
          smoke: "#111114",
          line: "#28211a"
        }
      },
      boxShadow: {
        glow: "0 0 34px rgba(229, 9, 20, 0.35)",
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
