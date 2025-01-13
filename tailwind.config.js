module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  safelist: [
    'from-violet-500/20',
    'to-violet-500/5',
    'hover:from-violet-500/30',
    'hover:to-violet-500/10',
    'from-blue-500/20',
    'to-blue-500/5',
    'hover:from-blue-500/30',
    'hover:to-blue-500/10',
    'from-emerald-500/20',
    'to-emerald-500/5',
    'hover:from-emerald-500/30',
    'hover:to-emerald-500/10',
    'from-amber-500/20',
    'to-amber-500/5',
    'hover:from-amber-500/30',
    'hover:to-amber-500/10',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          accent: '#3b82f6'
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-slow-reverse': 'spin 2s linear infinite reverse',
        'timeline-node': 'timeline-node 3s infinite',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-x': 'gradient-x 15s ease infinite',
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-slow': 'float 15s ease-in-out infinite',
        'ambient-glow': 'ambient-glow 8s ease-in-out infinite',
        'message-appear': 'message-appear 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-fade': 'slideFade 0.2s ease-out',
        'bounce': 'bounce 1s infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-out',
      },
      keyframes: {
        'timeline-node': {
          '0%, 100%': {
            transform: 'scale(1) translateX(-50%)',
            boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.3)',
          },
          '50%': {
            transform: 'scale(1.05) translateX(-48%)',
            boxShadow: '0 0 0 10px rgba(139, 92, 246, 0)',
          },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-40px) translateX(20px)' },
        },
        'ambient-glow': {
          '0%, 100%': { opacity: 0.5, transform: 'translate(0, 0)' },
          '50%': { opacity: 0.8, transform: 'translate(10px, -10px)' },
        },
        'message-appear': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideFade: {
          '0%': { transform: 'translateY(-4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(10px)', opacity: '0' },
        },
      },
      transformStyle: {
        'perspective-1000': 'perspective(1000px)',
      },
      touchAction: {
        manipulation: 'manipulation',
      },
    },
  },
  variants: {
    extend: {
      touchAction: ['responsive'],
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.perspective-1000': {
          'transform-style': 'preserve-3d',
          'perspective': '1000px',
        },
        '.rotate-y-180': {
          'transform': 'rotateY(180deg)',
        },
      });
    },
  ],
}
