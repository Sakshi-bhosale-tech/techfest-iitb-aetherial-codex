/**
 * FOLIO V // LIVE IMPACT NUMBERS & DOT-MATRIX MAP MODULE
 * Pure 2D Canvas wave propagation from Mumbai coordinates,
 * coupled with smooth easing counters for festival reach.
 */

import { scheduler } from '../engine/scheduler.js';
import { soundEngine } from '../engine/soundEngine.js';

export class ImpactModule {
  constructor() {
    this.section = document.querySelector('#impact-section');
    this.canvas = document.querySelector('#dot-matrix-canvas');
    this.counters = document.querySelectorAll('.card-num-val');

    this.ctx = null;
    this.dots = [];
    this.waves = [];
    this.hasAnimatedCounters = false;
    this.mumbaiPos = { x: 0, y: 0 };

    this.init();
  }

  init() {
    if (!this.section || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this._initDotGrid();

    // Spawn wave from Mumbai every 2.4s
    setInterval(() => {
      this._emitWave(this.mumbaiPos.x, this.mumbaiPos.y);
    }, 2400);

    // Initial wave
    this._emitWave(this.mumbaiPos.x, this.mumbaiPos.y);

    // Register render loop with scheduler
    scheduler.addTask('impactDotMatrix', (delta) => {
      this._updateAndRender(delta);
    });

    this._setupObserver();
    this._bindEvents();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.section.clientWidth;
    this.height = this.section.clientHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, this.dpr, 0, 0);

    // Anchor Mumbai geographically in the subcontinental map coordinates
    this.mumbaiPos = {
      x: this.width * 0.42,
      y: this.height * 0.52
    };

    this._initDotGrid();
  }

  _initDotGrid() {
    this.dots = [];
    const spacing = 26;
    const cols = Math.floor(this.width / spacing);
    const rows = Math.floor(this.height / spacing);
    const startX = (this.width - cols * spacing) / 2;
    const startY = (this.height - rows * spacing) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacing;
        const y = startY + r * spacing;

        // Subcontinent silhouette mask check (pure 2D math approximation of peninsular triangular shape)
        const normX = (x - this.width * 0.5) / (this.width * 0.28);
        const normY = (y - this.height * 0.45) / (this.height * 0.35);

        // Triangular inverted shape down south, wider up north
        const isSubcontinent = normY > -1 && normY < 1.1 && Math.abs(normX) < (1.1 - normY * 0.55);

        this.dots.push({
          x,
          y,
          baseAlpha: isSubcontinent ? 0.25 : 0.08,
          alpha: isSubcontinent ? 0.25 : 0.08,
          isKey: isSubcontinent && Math.random() > 0.88,
          size: isSubcontinent ? 1.8 : 1.2
        });
      }
    }
  }

  _emitWave(x, y) {
    this.waves.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(this.width, this.height) * 0.85,
      speed: 280,
      strength: 1.0
    });
  }

  _bindEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this._emitWave(e.clientX - rect.left, e.clientY - rect.top);
    });

    window.addEventListener('resize', () => this.resize());
  }

  _updateAndRender(delta) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update expanding waves
    for (let w = this.waves.length - 1; w >= 0; w--) {
      const wave = this.waves[w];
      wave.radius += wave.speed * delta;
      if (wave.radius > wave.maxRadius) {
        this.waves.splice(w, 1);
      }
    }

    // Render dots
    const len = this.dots.length;
    for (let i = 0; i < len; i++) {
      const d = this.dots[i];
      let illumination = 0;

      // Check distance to all active waves
      for (let w = 0; w < this.waves.length; w++) {
        const wave = this.waves[w];
        const dist = Math.hypot(d.x - wave.x, d.y - wave.y);
        const diff = Math.abs(dist - wave.radius);
        if (diff < 50) {
          const waveFactor = 1 - diff / 50;
          illumination = Math.max(illumination, waveFactor * (1 - wave.radius / wave.maxRadius));
        }
      }

      const totalAlpha = Math.min(1, d.baseAlpha + illumination * 0.8);

      if (illumination > 0.3) {
        this.ctx.fillStyle = d.isKey ? '#4FE0F5' : '#D6A84F';
      } else {
        this.ctx.fillStyle = '#EDE6D3';
      }

      this.ctx.globalAlpha = totalAlpha;
      const r = d.size + illumination * 1.5;
      this.ctx.fillRect(d.x - r / 2, d.y - r / 2, r, r);
    }

    // Draw Mumbai glowing epicenter beacon
    this.ctx.globalAlpha = 0.9;
    this.ctx.fillStyle = '#D6A84F';
    this.ctx.beginPath();
    this.ctx.arc(this.mumbaiPos.x, this.mumbaiPos.y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.globalAlpha = 1;
  }

  _setupObserver() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimatedCounters) {
          this.hasAnimatedCounters = true;
          this._animateCounters();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(this.section);
  }

  _animateCounters() {
    soundEngine.startCounterRoll();

    let completedCount = 0;
    const totalCounters = this.counters.length;

    this.counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      if (isNaN(target)) return;

      const duration = 2000;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out expo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(target * ease);

        counter.textContent = `${prefix}${currentVal.toLocaleString('en-IN')}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = `${prefix}${target.toLocaleString('en-IN')}${suffix}`;
          completedCount++;
          if (completedCount >= totalCounters) {
            soundEngine.stopCounterRoll();
            soundEngine.playCounterChime();
          }
        }
      };

      requestAnimationFrame(updateCount);
    });
  }
}
