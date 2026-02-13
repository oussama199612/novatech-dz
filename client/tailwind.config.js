/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                shoe: {
                    primary: '#000000', // Deep Black
                    secondary: '#FFFFFF', // Pure White
                    accent: '#2563EB', // Electric Blue (default accent)
                    gray: '#F3F4F6', // Light Gray background
                    darkgray: '#1F2937',
                    red: '#EF4444', // Sale/Hot
                },
                novatech: { // Keeping for backward compatibility if needed temporarily
                    dark: '#0F172A',
                    blue: '#1a56db',
                    cyan: '#06b6d4',
                    gold: '#D4AF37',
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'Inter', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
                display: ['"Oswald"', 'sans-serif'], // Added for bold headers
            },
            animation: {
                'marquee': 'marquee 25s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            },
            backgroundImage: {
                'shoe-gradient': 'linear-gradient(to right, #000000, #1a1a1a)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
