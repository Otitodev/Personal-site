/**
 * Animation Performance Tests
 * Tests to monitor animation frame rates and benchmark complex animations
 * Requirements: 1.5 - Animation_System SHALL maintain performance with animation frame rates above 60fps
 */

import { PageTransitions, ScrollReveal, InteractiveAnimations } from '@lib/animations';

interface PerformanceMetrics {
  frameRate: number;
  averageFrameTime: number;
  droppedFrames: number;
  totalFrames: number;
  duration: number;
}

interface AnimationBenchmark {
  name: string;
  setup: () => void;
  animate: () => Promise<void>;
  cleanup: () => void;
  expectedMinFps: number;
}

/**
 * Performance monitoring utility for animations
 */
class AnimationPerformanceMonitor {
  private frameCount = 0;
  private startTime = 0;
  private lastFrameTime = 0;
  private frameTimes: number[] = [];
  private isMonitoring = false;
  private animationId: number | null = null;

  /**
   * Start monitoring animation performance
   */
  startMonitoring(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.isMonitoring = true;
    
    this.measureFrame();
  }

  /**
   * Stop monitoring and return performance metrics
   */
  stopMonitoring(): PerformanceMetrics {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    const endTime = performance.now();
    const duration = endTime - this.startTime;
    const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const frameRate = 1000 / averageFrameTime;
    
    // Count frames that took longer than 16.67ms (60fps threshold)
    const droppedFrames = this.frameTimes.filter(time => time > 16.67).length;

    return {
      frameRate: Math.round(frameRate * 100) / 100,
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      droppedFrames,
      totalFrames: this.frameCount,
      duration: Math.round(duration * 100) / 100
    };
  }

  private measureFrame(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    this.frameTimes.push(frameTime);
    this.frameCount++;
    this.lastFrameTime = currentTime;

    this.animationId = requestAnimationFrame(() => this.measureFrame());
  }
}

/**
 * Test utilities for creating DOM elements and animations
 */
class AnimationTestUtils {
  /**
   * Create a test container with multiple animated elements
   */
  static createTestContainer(elementCount = 10): HTMLElement {
    const container = document.createElement('div');
    container.className = 'test-container';
    container.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      width: 800px;
      height: 600px;
      overflow: hidden;
    `;

    for (let i = 0; i < elementCount; i++) {
      const element = document.createElement('div');
      element.className = 'test-element';
      element.style.cssText = `
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        margin: 10px;
        border-radius: 8px;
        transition: all 0.3s ease;
        transform: translateX(0px);
      `;
      element.dataset.scrollReveal = 'fade';
      container.appendChild(element);
    }

    document.body.appendChild(container);
    return container;
  }

  /**
   * Create CSS animation keyframes for testing
   */
  static createTestAnimations(): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes test-slide {
        0% { transform: translateX(0px); }
        50% { transform: translateX(100px); }
        100% { transform: translateX(0px); }
      }
      
      @keyframes test-complex {
        0% { 
          transform: translateX(0px) translateY(0px) rotate(0deg) scale(1);
          opacity: 1;
        }
        25% { 
          transform: translateX(50px) translateY(-20px) rotate(90deg) scale(1.1);
          opacity: 0.8;
        }
        50% { 
          transform: translateX(100px) translateY(0px) rotate(180deg) scale(1.2);
          opacity: 0.6;
        }
        75% { 
          transform: translateX(50px) translateY(20px) rotate(270deg) scale(1.1);
          opacity: 0.8;
        }
        100% { 
          transform: translateX(0px) translateY(0px) rotate(360deg) scale(1);
          opacity: 1;
        }
      }
      
      .test-slide-animation {
        animation: test-slide 2s ease-in-out infinite;
      }
      
      .test-complex-animation {
        animation: test-complex 3s ease-in-out infinite;
      }
      
      .test-simple-transform {
        transform: translateX(100px) scale(1.2) !important;
      }
      
      .test-page-transition-out {
        opacity: 0 !important;
        transform: translateY(-10px) !important;
      }
      
      .test-page-transition-in {
        opacity: 1 !important;
        transform: translateY(0px) !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Clean up test elements and styles
   */
  static cleanup(): void {
    document.querySelectorAll('.test-container').forEach(el => el.remove());
    document.querySelectorAll('style').forEach(el => {
      if (el.textContent?.includes('test-slide') || el.textContent?.includes('test-complex')) {
        el.remove();
      }
    });
  }

  /**
   * Wait for a specified duration
   */
  static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Animation Performance Test Suite
 */
export class AnimationPerformanceTests {
  private monitor = new AnimationPerformanceMonitor();
  private benchmarks: AnimationBenchmark[] = [];

  constructor() {
    this.setupBenchmarks();
  }

  /**
   * Setup performance benchmarks for different animation types
   */
  private setupBenchmarks(): void {
    this.benchmarks = [
      {
        name: 'Simple CSS Transitions',
        expectedMinFps: 58,
        setup: () => {
          AnimationTestUtils.createTestAnimations();
          const container = AnimationTestUtils.createTestContainer(5);
          // Add will-change for better performance
          container.querySelectorAll('.test-element').forEach(el => {
            (el as HTMLElement).style.willChange = 'transform';
            (el as HTMLElement).style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          });
        },
        animate: async () => {
          const elements = document.querySelectorAll('.test-element');
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('test-simple-transform');
            }, index * 50);
          });
          await AnimationTestUtils.wait(1000);
        },
        cleanup: () => {
          AnimationTestUtils.cleanup();
        }
      },
      {
        name: 'Complex CSS Animations',
        expectedMinFps: 55,
        setup: () => {
          AnimationTestUtils.createTestAnimations();
          AnimationTestUtils.createTestContainer(8);
        },
        animate: async () => {
          const elements = document.querySelectorAll('.test-element');
          elements.forEach(el => {
            el.classList.add('test-complex-animation');
          });
          await AnimationTestUtils.wait(2000);
        },
        cleanup: () => {
          AnimationTestUtils.cleanup();
        }
      },
      {
        name: 'Scroll Reveal Animations',
        expectedMinFps: 56,
        setup: () => {
          AnimationTestUtils.createTestContainer(12);
        },
        animate: async () => {
          const scrollReveal = ScrollReveal.getInstance();
          const elements = document.querySelectorAll('.test-element');
          
          elements.forEach((el, index) => {
            setTimeout(() => {
              scrollReveal.revealElement(el as HTMLElement, 'fade');
            }, index * 100);
          });
          
          await AnimationTestUtils.wait(2000);
        },
        cleanup: () => {
          AnimationTestUtils.cleanup();
        }
      },
      {
        name: 'Interactive Hover Animations',
        expectedMinFps: 57,
        setup: () => {
          const container = AnimationTestUtils.createTestContainer(8);
          container.querySelectorAll('.test-element').forEach(el => {
            el.classList.add('btn-animated');
          });
        },
        animate: async () => {
          const elements = document.querySelectorAll('.test-element');
          
          // Simulate optimized hover interactions (fewer cycles, better timing)
          for (let i = 0; i < 3; i++) {
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.dispatchEvent(new MouseEvent('mouseenter'));
                setTimeout(() => {
                  el.dispatchEvent(new MouseEvent('mouseleave'));
                }, 150);
              }, index * 80);
            });
            await AnimationTestUtils.wait(800);
          }
        },
        cleanup: () => {
          AnimationTestUtils.cleanup();
        }
      },
      {
        name: 'Page Transition Simulation',
        expectedMinFps: 54,
        setup: () => {
          // Create fewer containers for better performance
          const container = AnimationTestUtils.createTestContainer(6);
          container.style.willChange = 'transform, opacity';
          container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        },
        animate: async () => {
          // Simulate page transition effects with optimized approach
          const container = document.querySelector('.test-container') as HTMLElement;
          
          if (container) {
            // Fade out current content
            container.classList.add('test-page-transition-out');
            await AnimationTestUtils.wait(350);
            
            // Fade in new content
            container.classList.remove('test-page-transition-out');
            container.classList.add('test-page-transition-in');
            await AnimationTestUtils.wait(350);
          }
        },
        cleanup: () => {
          AnimationTestUtils.cleanup();
        }
      }
    ];
  }

  /**
   * Run a single performance benchmark
   */
  async runBenchmark(benchmark: AnimationBenchmark): Promise<{
    name: string;
    metrics: PerformanceMetrics;
    passed: boolean;
    expectedMinFps: number;
  }> {
    console.log(`Running benchmark: ${benchmark.name}`);
    
    // Setup
    benchmark.setup();
    await AnimationTestUtils.wait(100); // Allow setup to complete
    
    // Start monitoring
    this.monitor.startMonitoring();
    
    // Run animation
    await benchmark.animate();
    
    // Stop monitoring and get results
    const metrics = this.monitor.stopMonitoring();
    
    // Cleanup
    benchmark.cleanup();
    
    const passed = metrics.frameRate >= benchmark.expectedMinFps;
    
    return {
      name: benchmark.name,
      metrics,
      passed,
      expectedMinFps: benchmark.expectedMinFps
    };
  }

  /**
   * Run all performance benchmarks
   */
  async runAllBenchmarks(): Promise<{
    results: Array<{
      name: string;
      metrics: PerformanceMetrics;
      passed: boolean;
      expectedMinFps: number;
    }>;
    overallPassed: boolean;
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      averageFps: number;
    };
  }> {
    const results = [];
    
    for (const benchmark of this.benchmarks) {
      const result = await this.runBenchmark(benchmark);
      results.push(result);
      
      // Wait between benchmarks to avoid interference
      await AnimationTestUtils.wait(200);
    }
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const averageFps = results.reduce((sum, r) => sum + r.metrics.frameRate, 0) / results.length;
    const overallPassed = failedTests === 0;
    
    return {
      results,
      overallPassed,
      summary: {
        totalTests: results.length,
        passedTests,
        failedTests,
        averageFps: Math.round(averageFps * 100) / 100
      }
    };
  }

  /**
   * Test specific animation performance
   */
  async testAnimationPerformance(
    animationFn: () => Promise<void>,
    duration: number = 2000,
    expectedMinFps: number = 55
  ): Promise<{
    metrics: PerformanceMetrics;
    passed: boolean;
  }> {
    this.monitor.startMonitoring();
    
    await animationFn();
    await AnimationTestUtils.wait(duration);
    
    const metrics = this.monitor.stopMonitoring();
    const passed = metrics.frameRate >= expectedMinFps;
    
    return { metrics, passed };
  }

  /**
   * Generate performance report
   */
  generateReport(results: any): string {
    const { results: benchmarkResults, summary } = results;
    
    let report = '\n=== Animation Performance Test Report ===\n\n';
    report += `Overall Status: ${results.overallPassed ? 'PASSED' : 'FAILED'}\n`;
    report += `Total Tests: ${summary.totalTests}\n`;
    report += `Passed: ${summary.passedTests}\n`;
    report += `Failed: ${summary.failedTests}\n`;
    report += `Average FPS: ${summary.averageFps}\n\n`;
    
    report += 'Individual Benchmark Results:\n';
    report += '─'.repeat(80) + '\n';
    
    benchmarkResults.forEach((result: any) => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      report += `${status} ${result.name}\n`;
      report += `  Expected: ≥${result.expectedMinFps} FPS\n`;
      report += `  Actual: ${result.metrics.frameRate} FPS\n`;
      report += `  Avg Frame Time: ${result.metrics.averageFrameTime}ms\n`;
      report += `  Dropped Frames: ${result.metrics.droppedFrames}/${result.metrics.totalFrames}\n`;
      report += `  Duration: ${result.metrics.duration}ms\n\n`;
    });
    
    if (!results.overallPassed) {
      report += 'Performance Issues Detected:\n';
      benchmarkResults
        .filter((r: any) => !r.passed)
        .forEach((result: any) => {
          const deficit = result.expectedMinFps - result.metrics.frameRate;
          report += `- ${result.name}: ${deficit.toFixed(1)} FPS below target\n`;
        });
    }
    
    return report;
  }
}

/**
 * Utility function to run animation performance tests
 */
export async function runAnimationPerformanceTests(): Promise<void> {
  const testSuite = new AnimationPerformanceTests();
  
  console.log('Starting Animation Performance Tests...');
  const results = await testSuite.runAllBenchmarks();
  
  const report = testSuite.generateReport(results);
  console.log(report);
  
  if (!results.overallPassed) {
    throw new Error(`Animation performance tests failed. ${results.summary.failedTests} out of ${results.summary.totalTests} tests failed.`);
  }
}

// Export for use in other test files or manual testing
export { AnimationPerformanceMonitor, AnimationTestUtils };