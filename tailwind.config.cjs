/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{tsx,ts,js,jsx,css}",
    "./src/app/**/*.{tsx,ts,js,jsx,css}",
    "./src/components/**/*.{tsx,ts,js,jsx,css}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        "ink-2": "var(--color-ink-2)",
        "ink-3": "var(--color-ink-3)",
        paper: "var(--color-paper)",
        "paper-muted": "var(--color-paper-muted)",
        line: "var(--color-line)",
        "line-strong": "var(--color-line-strong)",
        ember: "var(--color-ember)",
        "ember-text": "var(--color-ember-text)",
        arena: "var(--color-arena)",
        "arena-accent": "var(--color-arena-accent)"
      },
      fontFamily: {
        syne: "var(--font-syne)",
        figtree: "var(--font-figtree)",
        newsreader: "var(--font-newsreader)"
      }
    }
  },
  darkMode: "class",
  plugins: []
};
