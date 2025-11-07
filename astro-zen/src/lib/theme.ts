/**
 * Theme utility functions for dynamic color management
 * Supports the enhanced white/grey base theme with blue accents
 */

export interface ColorPalette {
  dominant: string[];
  vibrant: string[];
  muted: string[];
}

export interface AccentPalette {
  primary: string;
  secondary: string;
  light: string;
  hover: string;
  contrast: string;
}

export interface ThemeState {
  baseTheme: 'light';
  accentColors: AccentPalette;
  imageInfluence: boolean;
  lastUpdated: Date;
}

/**
 * Default blue accent palette
 */
export const DEFAULT_ACCENT_PALETTE: AccentPalette = {
  primary: '#2563eb',
  secondary: '#3b82f6',
  light: '#eff6ff',
  hover: '#1d4ed8',
  contrast: '#ffffff'
};

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Calculate luminance of a color for contrast checking
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsAccessibilityStandards(foreground: string, background: string): boolean {
  const contrast = getContrastRatio(foreground, background);
  return contrast >= 4.5; // WCAG AA standard for normal text
}

/**
 * Generate lighter/darker variations of a color
 */
export function generateColorVariations(baseColor: string): {
  light: string;
  hover: string;
  contrast: string;
} {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return {
    light: DEFAULT_ACCENT_PALETTE.light,
    hover: DEFAULT_ACCENT_PALETTE.hover,
    contrast: DEFAULT_ACCENT_PALETTE.contrast
  };

  const { r, g, b } = rgb;
  
  // Generate lighter version (for backgrounds)
  const lightR = Math.min(255, r + Math.floor((255 - r) * 0.9));
  const lightG = Math.min(255, g + Math.floor((255 - g) * 0.9));
  const lightB = Math.min(255, b + Math.floor((255 - b) * 0.9));
  const light = rgbToHex(lightR, lightG, lightB);
  
  // Generate darker version (for hover states)
  const hoverR = Math.max(0, Math.floor(r * 0.8));
  const hoverG = Math.max(0, Math.floor(g * 0.8));
  const hoverB = Math.max(0, Math.floor(b * 0.8));
  const hover = rgbToHex(hoverR, hoverG, hoverB);
  
  // Determine contrast color (white or dark grey)
  const contrast = meetsAccessibilityStandards('#ffffff', baseColor) ? '#ffffff' : '#111827';
  
  return { light, hover, contrast };
}

/**
 * Update CSS custom properties with new accent colors
 */
export function updateThemeVariables(palette: AccentPalette): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  root.style.setProperty('--color-accent-primary', palette.primary);
  root.style.setProperty('--color-accent-secondary', palette.secondary);
  root.style.setProperty('--color-accent-light', palette.light);
  root.style.setProperty('--color-accent-hover', palette.hover);
  
  // Also update the primary color for backward compatibility
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-primary-hover', palette.hover);
  root.style.setProperty('--color-primary-light', palette.light);
}

/**
 * Reset theme to default blue accent colors
 */
export function resetToDefaultTheme(): void {
  updateThemeVariables(DEFAULT_ACCENT_PALETTE);
}

/**
 * Apply accent colors from a base color, ensuring accessibility
 */
export function applyAccentColor(baseColor: string): AccentPalette {
  // Validate the base color
  if (!hexToRgb(baseColor)) {
    console.warn('Invalid color provided, using default theme');
    return DEFAULT_ACCENT_PALETTE;
  }
  
  const variations = generateColorVariations(baseColor);
  
  // Ensure the primary color has good contrast against white background
  const primaryColor = meetsAccessibilityStandards(baseColor, '#ffffff') 
    ? baseColor 
    : DEFAULT_ACCENT_PALETTE.primary;
  
  const palette: AccentPalette = {
    primary: primaryColor,
    secondary: baseColor,
    light: variations.light,
    hover: variations.hover,
    contrast: variations.contrast
  };
  
  updateThemeVariables(palette);
  return palette;
}

/**
 * Get current theme state
 */
export function getCurrentTheme(): ThemeState {
  if (typeof document === 'undefined') {
    return {
      baseTheme: 'light',
      accentColors: DEFAULT_ACCENT_PALETTE,
      imageInfluence: false,
      lastUpdated: new Date()
    };
  }
  
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const accentColors: AccentPalette = {
    primary: computedStyle.getPropertyValue('--color-accent-primary').trim() || DEFAULT_ACCENT_PALETTE.primary,
    secondary: computedStyle.getPropertyValue('--color-accent-secondary').trim() || DEFAULT_ACCENT_PALETTE.secondary,
    light: computedStyle.getPropertyValue('--color-accent-light').trim() || DEFAULT_ACCENT_PALETTE.light,
    hover: computedStyle.getPropertyValue('--color-accent-hover').trim() || DEFAULT_ACCENT_PALETTE.hover,
    contrast: computedStyle.getPropertyValue('--color-accent-contrast').trim() || DEFAULT_ACCENT_PALETTE.contrast
  };
  
  return {
    baseTheme: 'light',
    accentColors,
    imageInfluence: false,
    lastUpdated: new Date()
  };
}

/**
 * Smooth transition between theme changes
 */
export function enableThemeTransitions(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.style.setProperty('--theme-transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease');
  
  // Apply transition to common elements
  const style = document.createElement('style');
  style.textContent = `
    * {
      transition: var(--theme-transition);
    }
    
    .theme-transition-disable * {
      transition: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Disable theme transitions temporarily (useful during bulk updates)
 */
export function disableThemeTransitions(): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.classList.add('theme-transition-disable');
  
  // Re-enable after a short delay
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition-disable');
  }, 100);
}