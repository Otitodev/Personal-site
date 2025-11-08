/**
 * Dynamic Theme Manager
 * Updates CSS custom properties based on image color analysis
 * Ensures accessibility compliance and smooth transitions
 */

import {
  extractDominantColors,
  generateAccentPalette,
  meetsAccessibilityStandards,
  getContrastRatio,
  type AccentPalette,
  type ColorPalette
} from './color-analyzer';

export interface ThemeState {
  baseTheme: 'light' | 'dark';
  accentColors: AccentPalette;
  imageInfluence: boolean;
  lastUpdated: Date;
}

/**
 * Theme Manager class for handling dynamic theme updates
 */
export class ThemeManager {
  private currentState: ThemeState;
  private transitionDuration = 300; // ms
  private defaultAccents: AccentPalette = {
    primary: '#2563eb',
    secondary: '#3b82f6',
    light: '#eff6ff',
    contrast: '#ffffff'
  };

  constructor() {
    this.currentState = {
      baseTheme: 'light',
      accentColors: this.defaultAccents,
      imageInfluence: false,
      lastUpdated: new Date()
    };
  }

  /**
   * Analyze an image and update theme colors
   */
  async analyzeAndApplyTheme(imageElement: HTMLImageElement): Promise<void> {
    try {
      // Extract colors from image
      const palette = await extractDominantColors(imageElement);
      
      // Generate accent palette
      const accentPalette = generateAccentPalette(palette.vibrant.length > 0 ? palette.vibrant : palette.dominant);
      
      // Validate accessibility
      const validatedPalette = this.validateAccessibility(accentPalette);
      
      // Apply theme with transition
      await this.applyTheme(validatedPalette, true);
      
      // Update state
      this.currentState = {
        ...this.currentState,
        accentColors: validatedPalette,
        imageInfluence: true,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to analyze image and apply theme:', error);
      // Fallback to default theme
      await this.resetToDefaultTheme();
    }
  }

  /**
   * Validate and adjust colors for accessibility compliance
   */
  private validateAccessibility(palette: AccentPalette): AccentPalette {
    const validated = { ...palette };
    
    // Check primary color against white background
    if (!meetsAccessibilityStandards(validated.primary, '#ffffff', 'AA')) {
      // Darken the primary color until it meets standards
      validated.primary = this.adjustColorForContrast(validated.primary, '#ffffff');
    }
    
    // Check secondary color against white background
    if (!meetsAccessibilityStandards(validated.secondary, '#ffffff', 'AA')) {
      validated.secondary = this.adjustColorForContrast(validated.secondary, '#ffffff');
    }
    
    // Ensure light variant is actually light
    const lightContrast = getContrastRatio(validated.light, '#ffffff');
    if (lightContrast > 1.5) {
      // Light color is too dark, make it lighter
      validated.light = this.lightenColor(validated.light);
    }
    
    return validated;
  }

  /**
   * Adjust color to meet contrast requirements
   */
  private adjustColorForContrast(color: string, background: string): string {
    // Import color utilities
    const { hexToRgb, rgbToHsl, hslToHex } = require('./color-analyzer');
    
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb);
    
    // Darken by reducing lightness
    let adjustedHsl = { ...hsl };
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!meetsAccessibilityStandards(hslToHex(adjustedHsl), background, 'AA') && attempts < maxAttempts) {
      adjustedHsl.l = Math.max(0.1, adjustedHsl.l - 0.05);
      attempts++;
    }
    
    return hslToHex(adjustedHsl);
  }

  /**
   * Lighten a color
   */
  private lightenColor(color: string): string {
    const { hexToRgb, rgbToHsl, hslToHex } = require('./color-analyzer');
    
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb);
    
    // Increase lightness and reduce saturation
    const lightHsl = {
      h: hsl.h,
      s: Math.max(0.2, hsl.s - 0.3),
      l: Math.min(0.95, hsl.l + 0.3)
    };
    
    return hslToHex(lightHsl);
  }

  /**
   * Apply theme colors to CSS custom properties
   */
  async applyTheme(palette: AccentPalette, withTransition: boolean = true): Promise<void> {
    const root = document.documentElement;
    
    // Add transition class if requested
    if (withTransition) {
      root.classList.add('theme-transitioning');
    }
    
    // Update CSS custom properties
    root.style.setProperty('--color-accent-primary', palette.primary);
    root.style.setProperty('--color-accent-secondary', palette.secondary);
    root.style.setProperty('--color-accent-light', palette.light);
    root.style.setProperty('--color-accent-hover', this.darkenColor(palette.primary));
    
    // Also update the primary color variables for consistency
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-hover', this.darkenColor(palette.primary));
    root.style.setProperty('--color-primary-light', palette.light);
    
    // Wait for transition to complete
    if (withTransition) {
      await new Promise(resolve => setTimeout(resolve, this.transitionDuration));
      root.classList.remove('theme-transitioning');
    }
  }

  /**
   * Darken a color for hover states
   */
  private darkenColor(color: string): string {
    const { hexToRgb, rgbToHsl, hslToHex } = require('./color-analyzer');
    
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb);
    
    const darkerHsl = {
      h: hsl.h,
      s: Math.min(1, hsl.s + 0.05),
      l: Math.max(0.1, hsl.l - 0.1)
    };
    
    return hslToHex(darkerHsl);
  }

  /**
   * Reset to default blue theme
   */
  async resetToDefaultTheme(): Promise<void> {
    await this.applyTheme(this.defaultAccents, true);
    
    this.currentState = {
      ...this.currentState,
      accentColors: this.defaultAccents,
      imageInfluence: false,
      lastUpdated: new Date()
    };
  }

  /**
   * Get current theme state
   */
  getState(): ThemeState {
    return { ...this.currentState };
  }

  /**
   * Set transition duration
   */
  setTransitionDuration(duration: number): void {
    this.transitionDuration = duration;
  }
}

/**
 * Global theme manager instance
 */
let themeManagerInstance: ThemeManager | null = null;

/**
 * Get or create theme manager instance
 */
export function getThemeManager(): ThemeManager {
  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager();
  }
  return themeManagerInstance;
}

/**
 * Initialize theme system with automatic image detection
 */
export function initializeThemeSystem(options: {
  autoDetect?: boolean;
  selector?: string;
  transitionDuration?: number;
} = {}): void {
  const {
    autoDetect = true,
    selector = 'img[data-theme-source]',
    transitionDuration = 300
  } = options;

  const manager = getThemeManager();
  manager.setTransitionDuration(transitionDuration);

  if (autoDetect) {
    // Find images marked for theme extraction
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    
    if (images.length > 0) {
      // Use the first image found
      const firstImage = images[0];
      
      if (firstImage.complete) {
        // Image already loaded
        manager.analyzeAndApplyTheme(firstImage);
      } else {
        // Wait for image to load
        firstImage.addEventListener('load', () => {
          manager.analyzeAndApplyTheme(firstImage);
        });
      }
    }
  }
}

/**
 * Apply theme from a specific image element
 */
export async function applyThemeFromImage(imageElement: HTMLImageElement): Promise<void> {
  const manager = getThemeManager();
  await manager.analyzeAndApplyTheme(imageElement);
}

/**
 * Reset theme to default
 */
export async function resetTheme(): Promise<void> {
  const manager = getThemeManager();
  await manager.resetToDefaultTheme();
}
