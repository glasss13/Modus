/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        ee: "rgb(20 83 45)",
        me: "rgb(34 197 94)",
        ae: "rgb(234 179 8)",
        be: "rgb(239 68 68)",
        ne: "rgb(0 0 0)",
      },
    },
  },
  safelist: ["bg-ee", "bg-me", "bg-ae", "bg-be", "bg-ne"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["business"],
  },
  important: true,
};
