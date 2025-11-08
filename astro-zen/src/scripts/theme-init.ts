/**
 * Theme System Initialization Script
 * Automatically detects and applies themes from hero images
 */

import { initializeThemeSystem } from '../lib/theme-manager';

// Initialize theme system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

function initTheme() {
  // Initialize with default options
  initializeThemeSystem({
    autoDetect: true,
    selector: 'img[data-theme-source]',
    transitionDuration: 300
  });
}

// Re-initialize on page navigation (for SPAs or View Transitions)
document.addEventListener('astro:page-load', () => {
  initTheme();
});
