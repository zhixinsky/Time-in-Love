/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))'
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px'
      },
      boxShadow: {
        glass: '0 24px 80px rgba(178, 118, 174, 0.16)',
        soft: '0 14px 50px rgba(115, 80, 135, 0.12)'
      }
    }
  },
  plugins: []
}
