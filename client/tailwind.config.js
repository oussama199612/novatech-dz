/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                novatech: {
                    dark: '#0a0a0f', // Approx from logo background
                    card: 'rgba(255, 255, 255, 0.05)',
                    blue: '#1a56db', // Placeholder for logo blue
                    cyan: '#06b6d4', // Logo cyan
                    purple: '#7c3aed', // Logo hint
                    gold: '#fbbf24', // Accent
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Premium feel
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
