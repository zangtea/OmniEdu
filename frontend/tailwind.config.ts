import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        indigo: { DEFAULT: '#4B6FD4', 50: '#EEF1FB', 300: '#A3B8F0', 500: '#4B6FD4' },
        green:  { DEFAULT: '#1CB87E', 50: '#E8FBF4', 500: '#1CB87E' },
        coral:  { DEFAULT: '#FF6B35' },
        purple: { DEFAULT: '#7C5CBF', 50: '#F3EFFC', 700: '#563D82' },
        amber:  { DEFAULT: '#FFB800' },
        red:    { DEFAULT: '#EF4444', 50: '#FEF2F2', 200: '#FECACA', 400: '#F87171', 600: '#DC2626' },
        
        // Semantic Colors
        base: '#F5F7FF',
        card: '#FFFFFF',
        main: '#1A1D2E',
        sub:  '#6B7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;