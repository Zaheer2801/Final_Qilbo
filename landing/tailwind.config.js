/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // frontend-design.md's tokens — the actual brand, not a per-page guess.
        ink: "#2B2116", // near-black warm brown, primary text + hero background
        accent: "#B5651D", // amber/copper, spent sparingly
        confirmed: "#3F5D4F", // deep green, confirmed/success states
        muted: "#8A8272", // muted stone, secondary text
        paper: "#F6F1E7", // warm paper background for body sections
        receipt: "#FBF8F1", // thermal-paper white, the receipt artifact only
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      keyframes: {
        "print-line": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.5) rotate(-8deg)" },
          "60%": { opacity: "1", transform: "scale(0.95) rotate(-8deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-8deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "print-line": "print-line 0.35s ease-out both",
        "stamp-in": "stamp-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
