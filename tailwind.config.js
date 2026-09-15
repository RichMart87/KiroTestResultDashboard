import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        pass: '#22c55e',
        fail: '#ef4444',
        skip: '#f59e0b',
        flaky: '#a855f7'
      }
    }
  },
  plugins: [forms]
}
