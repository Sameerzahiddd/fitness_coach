import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080808",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        accent: "#00ff88",
        "accent-dim": "rgba(0, 255, 136, 0.12)",
        "accent-glow": "rgba(0, 255, 136, 0.4)",
        border: "#252525",
        "border-lit": "#3a3a3a",
        dim: "#666666",
        muted: "#999999",
        orange: "#ff6b35",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      animation: {
        "scan": "scan 3s ease-in-out infinite",
        "pulse-accent": "pulseAccent 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "reticle": "reticle 4s ease-in-out infinite",
        "blink": "blink 1.2s step-end infinite",
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { transform: "translateY(100vh)", opacity: "0.6" },
        },
        pulseAccent: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0,255,136,0.4)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 40px rgba(0,255,136,0.2)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        reticle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
        "dot-pattern": "radial-gradient(circle, rgba(0,255,136,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "60px 60px",
        "dot": "30px 30px",
      },
    },
  },
  plugins: [],
};
export default config;
