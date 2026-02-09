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
                    dark: '#0F172A', // Deep Navy/Black
                    card: 'rgba(255, 255, 255, 0.03)',
                    blue: '#1a56db',
                    cyan: '#06b6d4',
                    purple: '#7c3aed',
                    gold: '#D4AF37', // Luxury Gold
                },
                luxury: {
                    black: '#0F172A',
                    gold: '#D4AF37',
                    'gold-light': '#FCD34D',
                    white: '#F8FAFC',
                    gray: '#334155'
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
