/**
 * Animation utilities for the enhanced site experience
 * Provides page transitions, scroll animations, and interactive effects
 */

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'bounce';
  duration: number;
  delay: number;
  easing: string;
  trigger: 'scroll' | 'hover' | 'focus' | 'load';
}

export interface ScrollRevealOptions {
  threshold: number;
  rootMargin: string;
  once: boolean;
  stagger: number;
}

/**
 * Page Transition System
 * Uses View Transitions API with CSS fallbacks
 */
export class PageTransitions {
  private static instance: PageTransitions;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'startViewTransition' in document;
    this.init();
  }

  static getInstance(): PageTransitions {
    if (!PageTransitions.instance) {
      PageTransitions.instance = new PageTransitions();
    }
    return PageTransitions.instance;
  }

  private init(): void {
    if (this.isSupported) {
      this.setupViewTransitions();
    } else {
      this.setupFallbackTransitions();
    }
  }

  private setupViewTransitions(): void {
    // Intercept navigation for View Transitions API
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && this.shouldTransition(link)) {
        e.preventDefault();
        this.navigateWithTransition(link.href);
      }
    });
  }

  private setupFallbackTransitions(): void {
    // Add CSS-based transition classes for older browsers
    document.documentElement.classList.add('no-view-transitions');
    
    // Add page load animation
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('page-loaded');
    });
  }

  private shouldTransition(link: HTMLAnchorElement): boolean {
    // Only transition internal links
    return link.hostname === window.location.hostname && 
           !link.hasAttribute('data-no-transition') &&
           !link.href.includes('#');
  }

  private async navigateWithTransition(url: string): Promise<void> {
    if (!this.isSupported) {
      window.location.href = url;
      return;
    }

    try {
      // @ts-ignore - View Transitions API
      await document.startViewTransition(() => {
        window.location.href = url;
      }).finished;
    } catch (error) {
      console.warn('View transition failed, falling back to normal navigation:', error);
      window.location.href = url;
    }
  }

  /**
   * Manually trigger a page transition
   */
  public async transitionTo(url: string): Promise<void> {
    await this.navigateWithTransition(url);
  }
}

/**
 * Initialize page transitions when DOM is ready
 */
export function initPageTransitions(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PageTransitions.getInstance();
    });
  } else {
    PageTransitions.getInstance();
  }
}

/**
 * Scroll Reveal Animation System
 * Uses Intersection Observer for performance-optimized scroll animations
 */
export class ScrollReveal {
  private static instance: ScrollReveal;
  private observer: IntersectionObserver;
  private animatedElements = new Set<Element>();

  constructor(options: Partial<ScrollRevealOptions> = {}) {
    const defaultOptions: ScrollRevealOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      once: true,
      stagger: 100
    };

    const config = { ...defaultOptions, ...options };
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries, config),
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin
      }
    );

    this.init();
  }

  static getInstance(options?: Partial<ScrollRevealOptions>): ScrollReveal {
    if (!ScrollReveal.instance) {
      ScrollReveal.instance = new ScrollReveal(options);
    }
    return ScrollReveal.instance;
  }

  private init(): void {
    // Find all elements with scroll reveal attributes
    this.observeElements();
    
    // Re-observe elements when new content is added
    const mutationObserver = new MutationObserver(() => {
      this.observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private observeElements(): void {
    const elements = document.querySelectorAll('[data-scroll-reveal]');
    elements.forEach(element => {
      if (!this.animatedElements.has(element)) {
        this.observer.observe(element);
      }
    });
  }

  private handleIntersection(entries: IntersectionObserverEntry[], config: ScrollRevealOptions): void {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const animationType = element.dataset.scrollReveal || 'fade';
        const delay = parseInt(element.dataset.scrollDelay || '0') + (index * config.stagger);

        setTimeout(() => {
          this.animateElement(element, animationType);
        }, delay);

        if (config.once) {
          this.observer.unobserve(element);
          this.animatedElements.add(element);
        }
      }
    });
  }

  private animateElement(element: HTMLElement, animationType: string): void {
    element.classList.add('scroll-revealed');
    element.classList.add(`scroll-reveal-${animationType}`);
    
    // Remove initial hidden state
    element.style.opacity = '';
    element.style.transform = '';
  }

  /**
   * Manually reveal an element
   */
  public revealElement(element: HTMLElement, animationType = 'fade'): void {
    this.animateElement(element, animationType);
  }

  /**
   * Reset all animations (useful for testing or re-triggering)
   */
  public reset(): void {
    this.animatedElements.clear();
    document.querySelectorAll('.scroll-revealed').forEach(element => {
      element.classList.remove('scroll-revealed');
      element.classList.remove(...Array.from(element.classList).filter(cls => cls.startsWith('scroll-reveal-')));
    });
    this.observeElements();
  }
}

/**
 * Initialize scroll reveal animations
 */
export function initScrollReveal(options?: Partial<ScrollRevealOptions>): ScrollReveal {
  return ScrollReveal.getInstance(options);
}

/**
 * Interactive Animation Utilities
 * Provides helper functions for interactive animations
 */
export class InteractiveAnimations {
  /**
   * Add animation classes to an element
   */
  static addAnimation(element: HTMLElement, animationType: string): void {
    element.classList.add(`${animationType}-animated`);
  }

  /**
   * Remove animation classes from an element
   */
  static removeAnimation(element: HTMLElement, animationType: string): void {
    element.classList.remove(`${animationType}-animated`);
  }

  /**
   * Trigger a temporary animation (like bounce or shake)
   */
  static triggerAnimation(element: HTMLElement, animationType: 'bounce' | 'shake' | 'pulse'): void {
    element.classList.add(`${animationType}-animated`);
    
    // Remove the class after animation completes
    const duration = animationType === 'pulse' ? 2000 : animationType === 'bounce' ? 1000 : 500;
    setTimeout(() => {
      element.classList.remove(`${animationType}-animated`);
    }, duration);
  }

  /**
   * Initialize interactive animations for common elements
   */
  static init(): void {
    // Auto-apply animations to elements with data attributes
    document.addEventListener('DOMContentLoaded', () => {
      // Buttons
      document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
        if (!el.classList.contains('no-animation')) {
          el.classList.add('btn-animated');
        }
      });

      // Cards
      document.querySelectorAll('.card, [data-card]').forEach(el => {
        if (!el.classList.contains('no-animation')) {
          el.classList.add('card-animated');
        }
      });

      // Links
      document.querySelectorAll('a:not(.btn):not(.card)').forEach(el => {
        if (!el.classList.contains('no-animation')) {
          el.classList.add('link-animated');
        }
      });

      // Images
      document.querySelectorAll('.image-container, [data-image]').forEach(el => {
        if (!el.classList.contains('no-animation')) {
          el.classList.add('image-animated');
        }
      });

      // Form inputs
      document.querySelectorAll('input, textarea, select').forEach(el => {
        if (!el.classList.contains('no-animation')) {
          el.classList.add('input-animated');
        }
      });
    });
  }
}

/**
 * Initialize interactive animations
 */
export function initInteractiveAnimations(): void {
  InteractiveAnimations.init();
}