/**
 * Color Analysis Utility
 * Extracts dominant colors from images using Canvas API
 * Generates accessible color palettes for dynamic theming
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
  contrast: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Extracts dominant colors from an image using Canvas API
 */
export async function extractDominantColors(
  imageElement: HTMLImageElement
): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Scale down image for faster processing
      const maxSize = 100;
      const scale = Math.min(maxSize / imageElement.width, maxSize / imageElement.height);
      canvas.width = imageElement.width * scale;
      canvas.height = imageElement.height * scale;

      // Draw image to canvas
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Extract colors using k-means clustering
      const colors = extractColors(pixels, 5);
      
      // Categorize colors
      const categorized = categorizeColors(colors);

      resolve(categorized);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Extract colors from pixel data using simplified k-means clustering
 */
function extractColors(pixels: Uint8ClampedArray, k: number): RGB[] {
  const colors: RGB[] = [];
  const colorCounts = new Map<string, { color: RGB; count: number }>();

  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Skip very light or very dark pixels (likely background)
    const brightness = (r + g + b) / 3;
    if (brightness > 240 || brightness < 15) continue;

    // Quantize colors to reduce variations
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { color: { r: qr, g: qg, b: qb }, count: 1 });
    }
  }

  // Sort by frequency and take top k colors
  const sortedColors = Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, k)
    .map(item => item.color);

  return sortedColors;
}

/**
 * Categorize colors into dominant, vibrant, and muted
 */
function categorizeColors(colors: RGB[]): ColorPalette {
  const dominant: string[] = [];
  const vibrant: string[] = [];
  const muted: string[] = [];

  for (const color of colors) {
    const hex = rgbToHex(color);
    const hsl = rgbToHsl(color);

    dominant.push(hex);

    // Vibrant: high saturation
    if (hsl.s > 0.4) {
      vibrant.push(hex);
    }

    // Muted: low saturation
    if (hsl.s <= 0.4) {
      muted.push(hex);
    }
  }

  return {
    dominant: dominant.slice(0, 5),
    vibrant: vibrant.slice(0, 3),
    muted: muted.slice(0, 3)
  };
}

/**
 * Generate an accent palette from dominant colors
 */
export function generateAccentPalette(dominantColors: string[]): AccentPalette {
  if (dominantColors.length === 0) {
    // Fallback to default blue theme
    return {
      primary: '#2563eb',
      secondary: '#3b82f6',
      light: '#eff6ff',
      contrast: '#ffffff'
    };
  }

  // Use the most vibrant color as primary
  const primaryColor = findMostVibrant(dominantColors);
  const primaryRgb = hexToRgb(primaryColor);
  const primaryHsl = rgbToHsl(primaryRgb);

  // Generate secondary (slightly lighter/different hue)
  const secondaryHsl = {
    h: (primaryHsl.h + 15) % 360,
    s: Math.max(0.4, primaryHsl.s - 0.1),
    l: Math.min(0.6, primaryHsl.l + 0.1)
  };
  const secondary = hslToHex(secondaryHsl);

  // Generate light variant
  const lightHsl = {
    h: primaryHsl.h,
    s: Math.max(0.3, primaryHsl.s - 0.2),
    l: 0.95
  };
  const light = hslToHex(lightHsl);

  // Determine contrast color (white or dark)
  const contrast = primaryHsl.l > 0.5 ? '#111827' : '#ffffff';

  return {
    primary: primaryColor,
    secondary,
    light,
    contrast
  };
}

/**
 * Find the most vibrant color from a list
 */
function findMostVibrant(colors: string[]): string {
  let mostVibrant = colors[0];
  let maxSaturation = 0;

  for (const color of colors) {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb);
    
    // Prefer colors with high saturation and medium lightness
    const vibrancy = hsl.s * (1 - Math.abs(hsl.l - 0.5));
    
    if (vibrancy > maxSaturation) {
      maxSaturation = vibrancy;
      mostVibrant = color;
    }
  }

  return mostVibrant;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s, l };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s;
  const l = hsl.l;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return rgbToHex({
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  });
}

/**
 * Calculate relative luminance for WCAG contrast calculations
 */
export function getRelativeLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards (4.5:1 for normal text)
 */
export function meetsAccessibilityStandards(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  return ratio >= minRatio;
}
