/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'cv-base': '#080b14',
                'cv-surface': '#0f1629',
                'cv-elevated': '#141d35',
                'cv-border': 'rgba(99,102,241,0.12)',
                'cv-indigo': '#6366f1',
                'cv-violet': '#8b5cf6',
                'cv-cyan': '#06b6d4',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fadeInUp': 'fadeInUp 0.5s ease-out forwards',
                'shimmer': 'shimmer 1.5s infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            boxShadow: {
                'glow-indigo': '0 0 24px rgba(99,102,241,0.3)',
                'glow-violet': '0 0 24px rgba(139,92,246,0.3)',
                'glow-cyan': '0 0 24px rgba(6,182,212,0.3)',
                'glow-green': '0 0 24px rgba(34,197,94,0.3)',
                'glow-orange': '0 0 24px rgba(249,115,22,0.3)',
                'card': '0 4px 24px rgba(0,0,0,0.4)',
            },
        },
    },
    plugins: [],
}
