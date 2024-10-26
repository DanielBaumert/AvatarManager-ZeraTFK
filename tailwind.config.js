const { visitEachChild } = require('typescript');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,tsx}"
  ],
  theme: {
    tooltip: { 
      "transform": "scale(var(--tooltipScale))",
      "transform-origin": "bottom left",
      "show" : { 
        "--tooptipScale": 1,
        
      },
      "hide": { 
        "--tooptipScale": 0,
      }
    },
    extend: {
    },
  },
  plugins: [],
}

