/**
 * Test Runner for Animation Performance Tests
 * Provides a simple interface to run animation performance benchmarks
 */

import { runAnimationPerformanceTests, AnimationPerformanceTests } from './animation-performance.test';

/**
 * Browser-based test runner for animation performance
 */
export class AnimationTestRunner {
  private testSuite: AnimationPerformanceTests;
  private results: any = null;

  constructor() {
    this.testSuite = new AnimationPerformanceTests();
  }

  /**
   * Run all animation performance tests
   */
  async runTests(): Promise<void> {
    try {
      console.log('🚀 Starting Animation Performance Tests...');
      console.time('Total Test Duration');
      
      this.results = await this.testSuite.runAllBenchmarks();
      
      console.timeEnd('Total Test Duration');
      
      this.displayResults();
      
      if (this.results.overallPassed) {
        console.log('✅ All animation performance tests passed!');
      } else {
        console.error('❌ Some animation performance tests failed!');
        throw new Error(`${this.results.summary.failedTests} tests failed`);
      }
    } catch (error) {
      console.error('Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Display test results in a formatted way
   */
  private displayResults(): void {
    if (!this.results) return;

    const report = this.testSuite.generateReport(this.results);
    console.log(report);

    // Also create a visual report if running in browser
    if (typeof document !== 'undefined') {
      this.createVisualReport();
    }
  }

  /**
   * Create a visual report in the browser
   */
  private createVisualReport(): void {
    const reportContainer = document.createElement('div');
    reportContainer.id = 'animation-test-report';
    reportContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border: 2px solid ${this.results.overallPassed ? '#10b981' : '#ef4444'};
      border-radius: 8px;
      padding: 16px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      font-weight: bold;
      margin-bottom: 12px;
      color: ${this.results.overallPassed ? '#10b981' : '#ef4444'};
    `;
    header.textContent = `Animation Performance Tests ${this.results.overallPassed ? 'PASSED' : 'FAILED'}`;

    const summary = document.createElement('div');
    summary.style.cssText = 'margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;';
    summary.innerHTML = `
      <div>Total Tests: ${this.results.summary.totalTests}</div>
      <div>Passed: <span style="color: #10b981">${this.results.summary.passedTests}</span></div>
      <div>Failed: <span style="color: #ef4444">${this.results.summary.failedTests}</span></div>
      <div>Average FPS: ${this.results.summary.averageFps}</div>
    `;

    const details = document.createElement('div');
    this.results.results.forEach((result: any) => {
      const testDiv = document.createElement('div');
      testDiv.style.cssText = `
        margin-bottom: 12px;
        padding: 8px;
        border-radius: 4px;
        background: ${result.passed ? '#f0fdf4' : '#fef2f2'};
        border-left: 3px solid ${result.passed ? '#10b981' : '#ef4444'};
      `;
      
      testDiv.innerHTML = `
        <div style="font-weight: bold; color: ${result.passed ? '#10b981' : '#ef4444'}">
          ${result.passed ? '✓' : '✗'} ${result.name}
        </div>
        <div style="font-size: 11px; margin-top: 4px;">
          <div>Expected: ≥${result.expectedMinFps} FPS</div>
          <div>Actual: ${result.metrics.frameRate} FPS</div>
          <div>Dropped: ${result.metrics.droppedFrames}/${result.metrics.totalFrames} frames</div>
        </div>
      `;
      
      details.appendChild(testDiv);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 11px;
    `;
    closeButton.onclick = () => reportContainer.remove();

    reportContainer.appendChild(closeButton);
    reportContainer.appendChild(header);
    reportContainer.appendChild(summary);
    reportContainer.appendChild(details);

    // Remove any existing report
    const existing = document.getElementById('animation-test-report');
    if (existing) existing.remove();

    document.body.appendChild(reportContainer);
  }

  /**
   * Get the test results
   */
  getResults(): any {
    return this.results;
  }
}

/**
 * Initialize and run animation performance tests when DOM is ready
 */
export function initAnimationTests(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runTestsWhenReady();
    });
  } else {
    runTestsWhenReady();
  }
}

/**
 * Run tests when the page is ready
 */
async function runTestsWhenReady(): Promise<void> {
  // Wait a bit for the page to fully load and animations to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const runner = new AnimationTestRunner();
  await runner.runTests();
}

/**
 * Manual test execution function for development
 */
export async function runManualTests(): Promise<any> {
  const runner = new AnimationTestRunner();
  await runner.runTests();
  return runner.getResults();
}

// Export the main test function for external use
export { runAnimationPerformanceTests };