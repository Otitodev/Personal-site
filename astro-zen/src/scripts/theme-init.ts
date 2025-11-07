/**
 * Theme initialization script
 * Initializes the enhanced theme system on page load
 */

import { enableThemeTransitions, getCurrentTheme } from '@lib/theme';

// Initialize theme system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Enable smooth transitions for theme changes
  enableThemeTransitions();
  
  // Log current theme state for debugging
  if (import.meta.env.DEV) {
    const currentTheme = getCurrentTheme();
    console.log('Theme system initialized:', currentTheme);
  }
});

// Export for potential use in other scripts
export { enableThemeTransitions, getCurrentTheme };