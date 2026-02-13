/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Reformatted to 'solace' palette based on user request
                primary: '#0dccf2',
                'background-light': '#f5f8f8',
                'background-dark': '#101f22',

                nebula: { // Keeping for legacy/safety
                    bg: '#05060A',
                    surface: '#0B0F1A',
                    text: '#F5F7FF',
                    muted: '#AAB1C5',
                    border: '#1C2438',
                    violet: '#7C3AED',
                    blue: '#3B82F6',
                    cyan: '#22D3EE',
                },
                // Keeping legacy mapped to new for safety
                shoe: {
                    primary: '#F5F7FF',
                    secondary: '#05060A',
                    accent: '#7C3AED',
                    gray: '#0B0F1A',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Body
                display: ['"Space Grotesk"', '"Sora"', 'sans-serif'], // Headers
            },
            backgroundImage: {
                'nebula-gradient': 'linear-gradient(90deg, #7C3AED, #3B82F6, #22D3EE)',
                'nebula-glow': 'radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            },
            animation: {
                'marquee': 'marquee 30s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
