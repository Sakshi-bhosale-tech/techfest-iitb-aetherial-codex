/**
 * ADVANCED CUSTOM CURSOR WITH DRONE-SWARM TRAILING PARTICLES
 * Dot + ring follower with text morphing (DRAG, VIEW, PLAY, CLASH)
 * and 16 spring-physics trailing particles.
 */

import { scheduler } from '../engine/scheduler.js';

export class CustomCursor {
  constructor() {
    this.dot = document.querySelector('#custom-cursor-dot');
    this.ring = document.querySelector('#custom-cursor-ring');
    this.tag = document.querySelector('#cursor-tag-text');

    this.mouse = { x: -100, y: -100 };
    this.ringPos = { x: -100, y: -100 };
    this.isHoveringInteractive = false;

    // 16 Drone-Swarm trailing particles
    this.trailParticles = [];
    this.numTrail = 16;
    this.trailCanvas = document.querySelector('#cursor-trail-canvas');
    this.trailCtx = null;

    this.init();
  }

  init() {
    if (!this.dot || !this.ring) return;

    // Check touch device
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    if (this.trailCanvas) {
      this.trailCtx = this.trailCanvas.getContext('2d');
      this.resizeCanvas();
      this._initTrail();
    }

    this._bindEvents();

    // Central scheduler task for smooth spring damping
    scheduler.addTask('cursorSpring', (delta) => {
      // Spring interpolation for outer ring
      this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.18;
      this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.18;

      this.dot.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px)`;
      this.ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px)`;

      this._updateTrail(delta);
    });
  }

  resizeCanvas() {
    if (!this.trailCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.trailCanvas.width = window.innerWidth * dpr;
    this.trailCanvas.height = window.innerHeight * dpr;
    this.trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _initTrail() {
    this.trailParticles = [];
    for (let i = 0; i < this.numTrail; i++) {
      this.trailParticles.push({
        x: -100,
        y: -100,
        vx: 0,
        vy: 0,
        size: 1.2 + Math.random() * 1.5,
        color: i % 2 === 0 ? 'rgba(214, 168, 79, ' : 'rgba(79, 224, 245, ',
        lag: 0.08 + (i / this.numTrail) * 0.12
      });
    }
  }

  _bindEvents() {
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    // Morph detection on elements with data-cursor
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor');
        this.ring.classList.add('cursor-morph');
        if (this.tag) this.tag.textContent = text;
      } else if (e.target.closest('a, button, input, .clickable')) {
        this.ring.classList.add('cursor-morph');
        if (this.tag) this.tag.textContent = 'EXPLORE';
      } else {
        this.ring.classList.remove('cursor-morph');
        if (this.tag) this.tag.textContent = '';
      }
    });

    // Scatter on click
    window.addEventListener('pointerdown', () => {
      this.trailParticles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const force = 4 + Math.random() * 8;
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      });
    });

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  _updateTrail(delta) {
    if (!this.trailCtx) return;
    this.trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const len = this.trailParticles.length;
    for (let i = 0; i < len; i++) {
      const p = this.trailParticles[i];

      // Spring towards pointer with individual lag factor
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      p.vx = p.vx * 0.85 + dx * p.lag;
      p.vy = p.vy * 0.85 + dy * p.lag;

      p.x += p.vx;
      p.y += p.vy;

      const alpha = 0.6 - (i / len) * 0.45;
      this.trailCtx.fillStyle = `${p.color}${alpha})`;
      this.trailCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
}
