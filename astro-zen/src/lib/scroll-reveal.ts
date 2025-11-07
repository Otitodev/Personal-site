/**
 * Scroll Reveal Animation System
 * 
 * Provides Intersection Observer-based animations for elements as they come into view.
 * Supports various animation types with staggered timing for lists and grids.
 */

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  stagger?: number;
  delay?: number;
}

export type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'bounce';

interface ScrollRevealElement {
  element: Element;
  animationType: AnimationType;
  options: ScrollRevealOptions;
  hasAnimated: boolean;
}

class ScrollRevealManager {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, ScrollRevealElement> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      this.revealAllElements();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.isInitialized = true;
    this.scanForElements();
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      const elementData = this.elements.get(entry.target);
      if (!elementData) return;

      if (entry.isIntersecting && !elementData.hasAnimated) {
        this.animateElement(elementData);
        
        if (elementData.options.once !== false) {
          elementData.hasAnimated = true;
          this.observer?.unobserve(entry.target);
        }
      } else if (!entry.isIntersecting && elementData.options.once === false) {
        // Reset animation if once is false and element is out of view
        this.resetElement(elementData);
      }
    });
  }

  private animateElement(elementData: ScrollRevealElement): void {
    const { element, animationType, options } = elementData;
    
    // Apply stagger delay if specified
    const staggerDelay = this.calculateStaggerDelay(element, options.stagger);
    const totalDelay = (options.delay || 0) + staggerDelay;

    setTimeout(() => {
      element.classList.add(`scroll-reveal-${animationType}`);
      
      // Dispatch custom event for additional handling
      element.dispatchEvent(new CustomEvent('scroll-reveal', {
        detail: { animationType, options }
      }));
    }, totalDelay);
  }

  private resetElement(elementData: ScrollRevealElement): void {
    const { element, animationType } = elementData;
    element.classList.remove(`scroll-reveal-${animationType}`);
  }

  private calculateStaggerDelay(element: Element, stagger?: number): number {
    if (!stagger) return 0;

    // Find stagger index from data attribute or sibling position
    const staggerIndex = element.getAttribute('data-scroll-stagger');
    if (staggerIndex) {
      return parseInt(staggerIndex, 10) * stagger;
    }

    // Calculate based on sibling position
    const parent = element.parentElement;
    if (!parent) return 0;

    const siblings = Array.from(parent.children).filter(child => 
      child.hasAttribute('data-scroll-reveal')
    );
    const index = siblings.indexOf(element);
    
    return index >= 0 ? index * stagger : 0;
  }

  private scanForElements(): void {
    const elements = document.querySelectorAll('[data-scroll-reveal]');
    
    elements.forEach((element) => {
      const animationType = element.getAttribute('data-scroll-reveal') as AnimationType;
      if (!animationType) return;

      const options: ScrollRevealOptions = {
        threshold: parseFloat(element.getAttribute('data-scroll-threshold') || '0.1'),
        rootMargin: element.getAttribute('data-scroll-margin') || '0px 0px -50px 0px',
        once: element.getAttribute('data-scroll-once') !== 'false',
        stagger: parseFloat(element.getAttribute('data-scroll-stagger-delay') || '0'),
        delay: parseFloat(element.getAttribute('data-scroll-delay') || '0')
      };

      this.addElement(element, animationType, options);
    });
  }

  private revealAllElements(): void {
    // Immediately show all elements for users who prefer reduced motion
    const elements = document.querySelectorAll('[data-scroll-reveal]');
    elements.forEach((element) => {
      const animationType = element.getAttribute('data-scroll-reveal') as AnimationType;
      if (animationType) {
        element.classList.add(`scroll-reveal-${animationType}`);
      }
    });
  }

  public addElement(
    element: Element, 
    animationType: AnimationType, 
    options: ScrollRevealOptions = {}
  ): void {
    const elementData: ScrollRevealElement = {
      element,
      animationType,
      options: { once: true, ...options },
      hasAnimated: false
    };

    this.elements.set(element, elementData);
    
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  public removeElement(element: Element): void {
    this.elements.delete(element);
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  public refresh(): void {
    // Re-scan for new elements
    this.scanForElements();
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.elements.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
let scrollRevealManager: ScrollRevealManager | null = null;

export function initScrollReveal(): ScrollRevealManager {
  if (!scrollRevealManager) {
    scrollRevealManager = new ScrollRevealManager();
  }
  return scrollRevealManager;
}

export function getScrollRevealManager(): ScrollRevealManager | null {
  return scrollRevealManager;
}

// Utility functions for easy use
export function revealElement(
  element: Element, 
  animationType: AnimationType, 
  options?: ScrollRevealOptions
): void {
  const manager = initScrollReveal();
  manager.addElement(element, animationType, options);
}

export function revealElements(
  selector: string, 
  animationType: AnimationType, 
  options?: ScrollRevealOptions
): void {
  const elements = document.querySelectorAll(selector);
  const manager = initScrollReveal();
  
  elements.forEach((element, index) => {
    const elementOptions = options?.stagger 
      ? { ...options, delay: (options.delay || 0) + (index * options.stagger) }
      : options;
    
    manager.addElement(element, animationType, elementOptions);
  });
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initScrollReveal());
  } else {
    initScrollReveal();
  }
}