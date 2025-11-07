/**
 * Scroll Reveal Initialization Script
 * Initializes the scroll reveal animation system
 */

import { initScrollReveal } from '@lib/animations';

// Initialize scroll reveal with default options
initScrollReveal({
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
  once: true,
  stagger: 100
});

// Add stagger indices to elements with data-scroll-stagger
document.addEventListener('DOMContentLoaded', () => {
  const staggerGroups = document.querySelectorAll('[data-scroll-stagger]');
  
  staggerGroups.forEach(group => {
    const children = group.querySelectorAll('[data-scroll-reveal]');
    children.forEach((child, index) => {
      (child as HTMLElement).style.setProperty('--stagger-index', index.toString());
    });
  });
});