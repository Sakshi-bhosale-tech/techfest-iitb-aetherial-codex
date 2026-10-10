/**
 * SCHEDULER & PERFORMANCE ENGINE
 * Centralized requestAnimationFrame loop with:
 * - Delta time & elapsed time calculations
 * - Adaptive performance throttling (caps particles / skips heavy calculations if frame time > 20ms)
 * - Auto-pause on tab invisibility (document.hidden)
 * - Device Pixel Ratio capping (capped at 2 for mobile & high-DPI displays)
 */

class Scheduler {
  constructor() {
    this.tasks = new Map(); // id -> callback(deltaTime, elapsedTime)
    this.isRunning = false;
    this.lastTime = 0;
    this.elapsedTime = 0;
    this.fps = 60;
    this.frameTimeHistory = [];
    this.isLowPerformance = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this._bindEvents();
  }

  _bindEvents() {
    // Pause when tab is inactive to preserve battery and 0% CPU consumption
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    window.addEventListener('resize', () => {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    });
  }

  addTask(id, callback) {
    this.tasks.set(id, callback);
    if (!this.isRunning && this.tasks.size > 0 && !document.hidden) {
      this.start();
    }
  }

  removeTask(id) {
    this.tasks.delete(id);
    if (this.tasks.size === 0) {
      this.stop();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
  }

  _loop = (currentTime) => {
    if (!this.isRunning) return;

    const rawDelta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta to prevent huge jumps on tab switch / lag spike
    const delta = Math.min(rawDelta, 0.1);
    this.elapsedTime += delta;

    // Monitor frame performance
    const frameMs = rawDelta * 1000;
    this.frameTimeHistory.push(frameMs);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
      const avgFrameMs = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
      this.fps = 1000 / avgFrameMs;
      // If consistently taking > 20ms (< 50fps), activate adaptive quality mode
      if (avgFrameMs > 20 && !this.isLowPerformance) {
        this.isLowPerformance = true;
        window.dispatchEvent(new CustomEvent('aether:low-performance', { detail: { low: true } }));
      } else if (avgFrameMs < 17 && this.isLowPerformance) {
        this.isLowPerformance = false;
        window.dispatchEvent(new CustomEvent('aether:low-performance', { detail: { low: false } }));
      }
    }

    // Execute registered render callbacks
    for (const [_, task] of this.tasks) {
      try {
        task(delta, this.elapsedTime);
      } catch (err) {
        console.error('Scheduler task error:', err);
      }
    }

    requestAnimationFrame(this._loop);
  };
}

export const scheduler = new Scheduler();
