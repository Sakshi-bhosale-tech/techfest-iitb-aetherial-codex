/**
 * PARTICLE SWARM ENGINE — 2D DRONE LIGHT SHOW SIMULATION
 * 1500+ interactive particles morphing through silhouettes with spring physics,
 * noise turbulence, and shockwave burst capabilities.
 */

import { ShapeSampler } from './shapeSampler.js';

export class ParticleSwarm {
  constructor(canvas, count = 1600) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.count = count;
    this.particles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.currentShapePoints = [];
    this.targetShapePoints = [];
    this.morphProgress = 1;
    this.morphDuration = 1.2;
    this.morphTime = 0;

    this.shockwaveRadius = 0;
    this.shockwaveMax = 0;
    this.isShockwaving = false;

    this.mouse = { x: -9999, y: -9999, isHover: false };
    this.active = true;

    this._initParticles();
    this.resize();
  }

  resize() {
    this.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    this.height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _initParticles() {
    this.particles = [];
    const initialPoints = ShapeSampler.sampleCircle(this.count, 0.4);
    this.currentShapePoints = initialPoints;
    this.targetShapePoints = initialPoints;

    for (let i = 0; i < this.count; i++) {
      // Color palette: mostly Renaissance gold and aether cyan
      const isGold = Math.random() > 0.35;
      const color = isGold ? '#D6A84F' : '#4FE0F5';
      const glowColor = isGold ? 'rgba(214, 168, 79, 0.4)' : 'rgba(79, 224, 245, 0.4)';
      const size = 1.2 + Math.random() * 1.8;

      this.particles.push({
        x: (Math.random() - 0.5) * window.innerWidth,
        y: (Math.random() - 0.5) * window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        tx: 0,
        ty: 0,
        color,
        glowColor,
        size,
        baseSize: size,
        alpha: 0.2 + Math.random() * 0.8,
        wanderOffset: Math.random() * Math.PI * 2,
        speedFactor: 0.04 + Math.random() * 0.05
      });
    }
  }

  setShape(points, duration = 1.0) {
    this.currentShapePoints = this.targetShapePoints;
    this.targetShapePoints = points;
    this.morphProgress = 0;
    this.morphDuration = duration;
    this.morphTime = 0;
  }

  triggerShockwave() {
    this.isShockwaving = true;
    this.shockwaveRadius = 10;
    this.shockwaveMax = Math.max(this.width, this.height) * 0.9;

    // Give all particles an explosive outward radial impulse
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.particles.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const force = 12 + Math.random() * 20;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    });
  }

  update(delta, time, scaleMult = 1) {
    if (!this.active) return;

    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseScale = Math.min(this.width, this.height) * 0.36 * scaleMult;

    // Advance morph progress
    if (this.morphProgress < 1) {
      this.morphTime += delta;
      this.morphProgress = Math.min(1, this.morphTime / this.morphDuration);
      // Quintic ease out
      var ease = 1 - Math.pow(1 - this.morphProgress, 4);
    } else {
      var ease = 1;
    }

    // Update shockwave
    if (this.isShockwaving) {
      this.shockwaveRadius += delta * 1200;
      if (this.shockwaveRadius > this.shockwaveMax) {
        this.isShockwaving = false;
      }
    }

    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      // Interpolate target position between old shape and new shape
      const ptCurr = this.currentShapePoints[i % this.currentShapePoints.length] || { x: 0, y: 0 };
      const ptTarg = this.targetShapePoints[i % this.targetShapePoints.length] || { x: 0, y: 0 };

      const normX = ptCurr.x + (ptTarg.x - ptCurr.x) * ease;
      const normY = ptCurr.y + (ptTarg.y - ptCurr.y) * ease;

      // Small organic floating drift (homage to autonomous drone position-hold in wind)
      const driftAngle = time * 1.5 + p.wanderOffset;
      const driftX = Math.cos(driftAngle) * 4;
      const driftY = Math.sin(driftAngle) * 4;

      p.tx = cx + normX * baseScale + driftX;
      p.ty = cy + normY * baseScale + driftY;

      // Spring towards target
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      p.vx = p.vx * 0.88 + dx * p.speedFactor;
      p.vy = p.vy * 0.88 + dy * p.speedFactor;

      // Mouse repulsion / attraction
      if (this.mouse.isHover) {
        const mdx = p.x - this.mouse.x;
        const mdy = p.y - this.mouse.y;
        const mDist = Math.hypot(mdx, mdy);
        if (mDist < 120 && mDist > 0) {
          const repel = (1 - mDist / 120) * 8;
          p.vx += (mdx / mDist) * repel;
          p.vy += (mdy / mDist) * repel;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
    }
  }

  render() {
    if (!this.active) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;

      // Render crisp light point
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    // Render shockwave pulse ring if active
    if (this.isShockwaving) {
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, this.shockwaveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#D6A84F';
      const waveAlpha = Math.max(0, 1 - this.shockwaveRadius / this.shockwaveMax);
      ctx.globalAlpha = waveAlpha * 0.8;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner cyan echo
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, Math.max(0, this.shockwaveRadius - 20), 0, Math.PI * 2);
      ctx.strokeStyle = '#4FE0F5';
      ctx.globalAlpha = waveAlpha * 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }
}
