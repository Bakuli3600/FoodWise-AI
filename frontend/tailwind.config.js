/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8F5",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#315B43",
          hover: "#264834",
          light: "#EAF0E7",
        },
        accent: {
          DEFAULT: "#78956A",
          hover: "#637d57",
        },
        text: {
          primary: "#202820",
          secondary: "#737C72",
          muted: "#9AA299",
        },
        border: "#E5E9E2",
        warning: "#D99A42",
        danger: "#C65C50",
        charcoal: "#181E18",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
