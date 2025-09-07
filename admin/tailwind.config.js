/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          900: "#0c4a6e",
        },
        success: {
          500: "#10b981",
        },
        warning: {
          500: "#f59e0b",
        },
        error: {
          500: "#ef4444",
        },
        info: {
          500: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};
