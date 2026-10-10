/**
 * GENERATIVE 2D FLOW FIELD ENGINE
 * Pure Canvas 2D mathematical vector flow field with Perlin/Simplex-style noise.
 * Thin hairline Renaissance gold and aether cyan streamlines reacting to mouse movement.
 * Zero 3D, zero WebGL. Ultra-fast performance with DPR capping.
 */

export class FlowField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.particles = [];
    this.numParticles = 240; // High visual fidelity, low CPU overhead
    this.cellSize = 40;
    this.cols = 0;
    this.rows = 0;
    this.field = [];
    this.zOff = 0;

    this.mouse = { x: -9999, y: -9999, vx: 0, vy: 0, lastX: 0, lastY: 0 };
    this.active = true;

    this.resize();
    this._initParticles();
  }

  resize() {
    this.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    this.height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cols = Math.ceil(this.width / this.cellSize) + 1;
    this.rows = Math.ceil(this.height / this.cellSize) + 1;
    this.field = new Float32Array(this.cols * this.rows);
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      const isCyan = Math.random() > 0.65;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        lastX: 0,
        lastY: 0,
        vx: 0,
        vy: 0,
        speed: 1.5 + Math.random() * 2,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 150,
        color: isCyan ? 'rgba(79, 224, 245, 0.4)' : 'rgba(214, 168, 79, 0.35)',
        width: isCyan ? 1.0 : 0.8
      });
      this.particles[i].lastX = this.particles[i].x;
      this.particles[i].lastY = this.particles[i].y;
    }
  }

  // Lightweight pseudo-noise algorithm for angle field
  _noise(x, y, z) {
    const n = Math.sin(x * 0.7 + z * 0.2) + Math.cos(y * 0.8 + z * 0.3) + Math.sin((x + y) * 0.5);
    return n * Math.PI;
  }

  update(delta, time) {
    if (!this.active) return;

    this.zOff += delta * 0.15;

    // Recalculate vector grid
    const scale = 0.003;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        const angle = this._noise(c * this.cellSize * scale, r * this.cellSize * scale, this.zOff);
        this.field[idx] = angle;
      }
    }

    // Update particles along the vector grid
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      p.lastX = p.x;
      p.lastY = p.y;

      const c = Math.floor(p.x / this.cellSize);
      const r = Math.floor(p.y / this.cellSize);

      let angle = 0;
      if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
        angle = this.field[r * this.cols + c];
      }

      p.vx = Math.cos(angle) * p.speed;
      p.vy = Math.sin(angle) * p.speed;

      // Mouse deflection / vortex effect
      const mdx = p.x - this.mouse.x;
      const mdy = p.y - this.mouse.y;
      const mDist = Math.hypot(mdx, mdy);
      if (mDist < 180 && mDist > 0) {
        const force = (1 - mDist / 180) * 4;
        // Tangential + outward push
        p.vx += (mdx / mDist) * force - (mdy / mDist) * force * 1.5;
        p.vy += (mdy / mDist) * force + (mdx / mDist) * force * 1.5;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      // Respawn particle if it leaves canvas bounds or reaches maxLife
      if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height || p.life > p.maxLife) {
        p.x = Math.random() * this.width;
        p.y = Math.random() * this.height;
        p.lastX = p.x;
        p.lastY = p.y;
        p.life = 0;
      }
    }
  }

  render() {
    if (!this.active) return;
    const ctx = this.ctx;

    // Subtle fade trail effect for organic ink flow
    ctx.fillStyle = 'rgba(5, 6, 10, 0.08)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.lineCap = 'round';

    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      const alphaFade = Math.sin((p.life / p.maxLife) * Math.PI);

      ctx.beginPath();
      ctx.moveTo(p.lastX, p.lastY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.globalAlpha = Math.max(0.1, alphaFade * 0.6);
      ctx.stroke();
    }

    ctx.restore();
  }

  setMouse(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }
}
