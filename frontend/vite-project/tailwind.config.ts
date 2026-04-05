import type { Config } from "tailwindcss";

/**
 * Tailwind v4 + `@tailwindcss/vite` reads design tokens from `src/index.css`
 * (`@import "tailwindcss"`, `@theme { ... }`, keyframes, `@custom-variant dark`).
 *
 * The former `theme.extend` colors, radii, fontFamily, and `tailwindcss-animate`
 * keyframes/animations from the shadcn template live there so utilities like
 * `border-border`, `bg-background`, and `animate-accordion-down` resolve correctly.
 */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
} satisfies Config;
