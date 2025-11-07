/**
 * Production Animation Performance Monitor
 * Lightweight performance monitoring for animation systems in production
 */

interface PerformanceData {
  fps: number;
  frameTime: number;
  timestamp: number;
  animationType?: string;
}

interface PerformanceThresholds {
  minFps: number;
  maxFrameTime: number;
  warningThreshold: number;
}

/**
 * Lightweight performance monitor for production use
 */
export class ProductionPerformanceMonitor {
  private static instance: ProductionPerformanceMonitor;
  private isMonitoring = false;
  private frameCount = 0;
  private lastTime = 0;
  private frameTimes: number[] = [];
  private thresholds: PerformanceThresholds;
  private onPerformanceIssue?: (data: PerformanceData) => void;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      minFps: 55,
      maxFrameTime: 18, // Slightly more lenient for production
      warningThreshold: 50,
      ...thresholds
    };
  }

  static getInstance(thresholds?: Partial<PerformanceThresholds>): ProductionPerformanceMonitor {
    if (!ProductionPerformanceMonitor.instance) {
      ProductionPerformanceMonitor.instance = new ProductionPerformanceMonitor(thresholds);
    }
    return ProductionPerformanceMonitor.instance;
  }

  /**
   * Start monitoring animation performance
   */
  startMonitoring(animationType?: string): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.frameTimes = [];
    this.lastTime = performance.now();
    
    this.monitorFrame(animationType);
  }

  /**
   * Stop monitoring and return performance data
   */
  stopMonitoring(): PerformanceData | null {
    if (!this.isMonitoring) return null;

    this.isMonitoring = false;
    
    if (this.frameTimes.length === 0) return null;

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;

    const data: PerformanceData = {
      fps: Math.round(fps * 100) / 100,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      timestamp: Date.now()
    };

    // Check for performance issues
    if (fps < this.thresholds.minFps || avgFrameTime > this.thresholds.maxFrameTime) {
      this.onPerformanceIssue?.(data);
    }

    return data;
  }

  /**
   * Set callback for performance issues
   */
  onIssue(callback: (data: PerformanceData) => void): void {
    this.onPerformanceIssue = callback;
  }

  /**
   * Monitor a single frame
   */
  private monitorFrame(animationType?: string): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    
    if (this.frameCount > 0) { // Skip first frame
      this.frameTimes.push(frameTime);
      
      // Keep only recent frames (sliding window)
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
    }

    this.frameCount++;
    this.lastTime = currentTime;

    requestAnimationFrame(() => this.monitorFrame(animationType));
  }

  /**
   * Quick performance check for specific animations
   */
  async measureAnimation(
    animationFn: () => Promise<void> | void,
    animationType?: string
  ): Promise<PerformanceData | null> {
    this.startMonitoring(animationType);
    
    try {
      await animationFn();
      // Wait a bit for animation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn('Animation measurement failed:', error);
    }
    
    return this.stopMonitoring();
  }

  /**
   * Get current performance status
   */
  getCurrentPerformance(): { fps: number; status: 'good' | 'warning' | 'poor' } | null {
    if (this.frameTimes.length < 10) return null;

    const recentFrames = this.frameTimes.slice(-10);
    const avgFrameTime = recentFrames.reduce((a, b) => a + b, 0) / recentFrames.length;
    const fps = 1000 / avgFrameTime;

    let status: 'good' | 'warning' | 'poor' = 'good';
    if (fps < this.thresholds.warningThreshold) {
      status = 'poor';
    } else if (fps < this.thresholds.minFps) {
      status = 'warning';
    }

    return { fps: Math.round(fps), status };
  }
}

/**
 * Simple decorator for monitoring animation performance
 */
export function monitorAnimation(animationType?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = ProductionPerformanceMonitor.getInstance();
      const data = await monitor.measureAnimation(
        () => method.apply(this, args),
        animationType
      );

      if (data && data.fps < 55) {
        console.warn(`Animation performance issue in ${propertyName}:`, data);
      }

      return data;
    };

    return descriptor;
  };
}

/**
 * Initialize performance monitoring for the application
 */
export function initPerformanceMonitoring(options: {
  enableLogging?: boolean;
  thresholds?: Partial<PerformanceThresholds>;
  onIssue?: (data: PerformanceData) => void;
} = {}): ProductionPerformanceMonitor {
  const monitor = ProductionPerformanceMonitor.getInstance(options.thresholds);

  if (options.onIssue) {
    monitor.onIssue(options.onIssue);
  }

  // Default issue handler
  if (options.enableLogging !== false) {
    monitor.onIssue((data) => {
      console.warn('Animation performance issue detected:', {
        fps: data.fps,
        frameTime: data.frameTime,
        type: data.animationType || 'unknown'
      });
    });
  }

  return monitor;
}

/**
 * Utility to check if device supports high-performance animations
 */
export function getDevicePerformanceLevel(): 'high' | 'medium' | 'low' {
  // Simple heuristic based on available APIs and hardware
  const hasWebGL = !!document.createElement('canvas').getContext('webgl');
  const hasViewTransitions = 'startViewTransition' in document;
  const hardwareConcurrency = navigator.hardwareConcurrency || 1;
  const deviceMemory = (navigator as any).deviceMemory || 4;

  if (hasWebGL && hasViewTransitions && hardwareConcurrency >= 4 && deviceMemory >= 4) {
    return 'high';
  } else if (hasWebGL && hardwareConcurrency >= 2) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Adaptive animation configuration based on device performance
 */
export function getAdaptiveAnimationConfig() {
  const performanceLevel = getDevicePerformanceLevel();
  
  switch (performanceLevel) {
    case 'high':
      return {
        enableComplexAnimations: true,
        maxConcurrentAnimations: 5,
        animationDuration: 1.0,
        enableParallax: true,
        enableBlur: true
      };
    case 'medium':
      return {
        enableComplexAnimations: true,
        maxConcurrentAnimations: 3,
        animationDuration: 0.8,
        enableParallax: false,
        enableBlur: false
      };
    case 'low':
      return {
        enableComplexAnimations: false,
        maxConcurrentAnimations: 1,
        animationDuration: 0.5,
        enableParallax: false,
        enableBlur: false
      };
  }
}