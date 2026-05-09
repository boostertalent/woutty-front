import type { Config } from "tailwindcss";
// Import standard pour shadcn/ui et les animations
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  // En v4, Next.js gère souvent cela, mais le garder assure la rétrocompatibilité
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs Booster Talent
        'booster-yellow': '#F5C200',
        'booster-bg': '#050505',
        'booster-card': '#0A0A0A',
        
        // Mappage pour shadcn/ui
        border: "var(--border)",
        input: "var(--border)",
        ring: "#F5C200",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#F5C200",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#0A0A0A",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
   animation: {
  carousel: "scroll 60s ease-in-out infinite",
},
keyframes: {
  scroll: {
    "0%":   { transform: "translateX(0)" },
    "40%":  { transform: "translateX(-25%)" },
    "45%":  { transform: "translateX(-25%)" },  // pause milieu
    "90%":  { transform: "translateX(-50%)" },
    "100%": { transform: "translateX(-50%)" },  // pause fin
  },
}, 
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;