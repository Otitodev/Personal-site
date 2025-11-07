/**
 * Client-side initialization for scroll reveal animations
 * This script runs in the browser to set up scroll-based animations
 */

import { initScrollReveal } from '@/lib/scroll-reveal';

// Initialize scroll reveal system
const manager = initScrollReveal();

// Handle page navigation (for SPAs or dynamic content)
document.addEventListener('astro:page-load', () => {
  // Refresh scroll reveal for new content
  manager.refresh();
});

// Handle dynamic content updates
const observer = new MutationObserver((mutations) => {
  let shouldRefresh = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.hasAttribute('data-scroll-reveal') || 
              element.querySelector('[data-scroll-reveal]')) {
            shouldRefresh = true;
          }
        }
      });
    }
  });
  
  if (shouldRefresh) {
    manager.refresh();
  }
});

// Start observing document changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  observer.disconnect();
  manager.destroy();
});