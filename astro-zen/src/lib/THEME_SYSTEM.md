# Dynamic Theme System

## Overview

The dynamic theme system analyzes images and extracts their dominant colors to create accessible accent color palettes. The system maintains the white/grey base theme while adapting accent colors (blues by default) to complement visual content.

## Features

- **Canvas API-based color extraction**: Analyzes images to find dominant, vibrant, and muted colors
- **Automatic accessibility validation**: Ensures all colors meet WCAG 2.1 AA standards (4.5:1 contrast ratio)
- **Smooth transitions**: CSS-based transitions for seamless theme changes
- **Fallback support**: Gracefully falls back to default blue theme if analysis fails

## Usage

### Basic Usage with ThemeImage Component

```astro
---
import ThemeImage from '@components/ThemeImage.astro';
---

<ThemeImage
  src="/path/to/image.jpg"
  alt="Description"
  enableTheme={true}
  class="w-full"
/>
```

### Manual Theme Application

```typescript
import { applyThemeFromImage, resetTheme } from '@lib/theme-manager';

// Apply theme from an image element
const img = document.querySelector('img');
await applyThemeFromImage(img);

// Reset to default theme
await resetTheme();
```

### Automatic Initialization

Add the theme initialization script to your layout:

```astro
---
// In your Layout.astro
---
<script src="../scripts/theme-init.ts"></script>
```

The system will automatically detect images with `data-theme-source` attribute and apply themes.

## How It Works

1. **Color Extraction**: Uses Canvas API to sample image pixels and extract dominant colors using k-means clustering
2. **Color Categorization**: Separates colors into dominant, vibrant, and muted categories based on saturation
3. **Palette Generation**: Creates an accent palette with primary, secondary, light, and contrast colors
4. **Accessibility Validation**: Checks contrast ratios and adjusts colors to meet WCAG standards
5. **CSS Variable Updates**: Applies colors to CSS custom properties with smooth transitions

## CSS Variables

The system updates the following CSS custom properties:

- `--color-accent-primary`: Main accent color
- `--color-accent-secondary`: Secondary accent color
- `--color-accent-light`: Light variant for backgrounds
- `--color-accent-hover`: Darker variant for hover states
- `--color-primary`: Alias for accent-primary
- `--color-primary-hover`: Alias for accent-hover
- `--color-primary-light`: Alias for accent-light

## Accessibility

All generated colors are validated against WCAG 2.1 AA standards:

- Minimum contrast ratio of 4.5:1 for normal text
- Automatic color adjustment if standards aren't met
- Preserves readability across all theme variations

## Demo

Visit `/theme-demo` to see the dynamic theming system in action with interactive examples.

## API Reference

### color-analyzer.ts

- `extractDominantColors(image)`: Extract color palette from image
- `generateAccentPalette(colors)`: Generate accent palette from colors
- `meetsAccessibilityStandards(fg, bg)`: Check WCAG compliance
- `getContrastRatio(color1, color2)`: Calculate contrast ratio

### theme-manager.ts

- `ThemeManager`: Main class for theme management
- `getThemeManager()`: Get singleton instance
- `initializeThemeSystem(options)`: Initialize with auto-detection
- `applyThemeFromImage(image)`: Apply theme from specific image
- `resetTheme()`: Reset to default theme
