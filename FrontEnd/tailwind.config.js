/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'false', // Forced Light Mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1e293b', // Dark blue/slate from Login button
                secondary: '#f1f5f9', // Light gray background
                accent: '#10b981', // Green from illustration/dashboard
            },
        },
    },
    plugins: [],
}
