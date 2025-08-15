// Modern Color Palette - Emerald & Teal Theme
export const colors = {
  // Primary colors - Emerald green
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5', 
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main primary
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  
  // Secondary colors - Teal
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main secondary
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a'
  },
  
  // Accent colors - Orange
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main accent
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12'
  },
  
  // Supporting colors - Purple
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },
  
  // Supporting colors - Pink
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843'
  },
  
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  },
  
  // Status colors
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444',   // red-500
  info: '#3b82f6',    // blue-500
  
  // Background gradients
  gradients: {
    primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    secondary: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    accent: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    warm: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    cool: 'linear-gradient(135deg, #14b8a6 0%, #a855f7 100%)',
    rainbow: 'linear-gradient(135deg, #10b981 0%, #14b8a6 25%, #a855f7 50%, #ec4899 75%, #f97316 100%)'
  }
};

// CSS custom properties for easy use
export const cssVariables = `
  :root {
    --color-primary: ${colors.primary[500]};
    --color-primary-light: ${colors.primary[400]};
    --color-primary-dark: ${colors.primary[600]};
    
    --color-secondary: ${colors.secondary[500]};
    --color-secondary-light: ${colors.secondary[400]};
    --color-secondary-dark: ${colors.secondary[600]};
    
    --color-accent: ${colors.accent[500]};
    --color-accent-light: ${colors.accent[400]};
    --color-accent-dark: ${colors.accent[600]};
    
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
    --color-error: ${colors.error};
    --color-info: ${colors.info};
    
    --gradient-primary: ${colors.gradients.primary};
    --gradient-secondary: ${colors.gradients.secondary};
    --gradient-accent: ${colors.gradients.accent};
    --gradient-warm: ${colors.gradients.warm};
    --gradient-cool: ${colors.gradients.cool};
    --gradient-rainbow: ${colors.gradients.rainbow};
  }
`;

export default colors;
