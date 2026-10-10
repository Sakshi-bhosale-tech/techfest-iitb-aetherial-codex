/**
 * FOLIO IV // ROBOWARS ARENA MODULE
 * Full-bleed interactive 2D combat simulator with particle physics sparks,
 * screen shake, health bars, and knockout mechanics.
 */

import { scheduler } from '../engine/scheduler.js';
import { soundEngine } from '../engine/soundEngine.js';

export class ArenaModule {
  constructor() {
    this.section = document.querySelector('#arena-section');
    this.canvas = document.querySelector('#arena-spark-canvas');
    this.btnClash = document.querySelector('#btn-arena-clash');
    this.botA = document.querySelector('#robot-actor-a');
    this.botB = document.querySelector('#robot-actor-b');
    this.healthBarA = document.querySelector('#health-bar-a');
    this.healthBarB = document.querySelector('#health-bar-b');
    this.battleStage = document.querySelector('#battle-stage');
    this.koBanner = document.querySelector('#ko-banner');
    this.koWinner = document.querySelector('#ko-winner-text');
    this.btnReset = document.querySelector('#btn-arena-reset');

    this.ctx = null;
    this.sparks = [];
    this.healthA = 100;
    this.healthB = 100;
    this.isFighting = false;
    this.isGameOver = false;

    this.init();
  }

  init() {
    if (!this.section || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // Register spark rendering with scheduler
    scheduler.addTask('arenaSparks', (delta) => {
      this._updateSparks(delta);
    });

    this._bindEvents();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.section.clientWidth;
    this.height = this.section.clientHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _bindEvents() {
    if (this.btnClash) {
      this.btnClash.addEventListener('click', () => this.triggerClash());
    }

    if (this.battleStage) {
      this.battleStage.addEventListener('click', (e) => {
        if (e.target !== this.btnReset) {
          this.triggerClash();
        }
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.resetMatch());
    }

    window.addEventListener('resize', () => this.resize());
  }

  triggerClash() {
    if (this.isFighting || this.isGameOver) return;
    this.isFighting = true;

    // Start high-velocity spinning blade buzz before collision
    soundEngine.startBladeBuzz();

    // Surge bots inward
    this.botA.classList.add('clashing');
    this.botB.classList.add('clashing');

    // Impact timing
    setTimeout(() => {
      soundEngine.stopBladeBuzz();
      soundEngine.playClash();

      // Screen shake (2D transform)
      this.section.classList.remove('shake');
      void this.section.offsetWidth; // Trigger reflow
      this.section.classList.add('shake');

      // Spawn 75 physical sparks at impact center
      const stageRect = this.battleStage.getBoundingClientRect();
      const sectionRect = this.section.getBoundingClientRect();
      const sparkX = this.width / 2;
      const sparkY = stageRect.top - sectionRect.top + stageRect.height * 0.5;

      this._spawnSparks(sparkX, sparkY, 75);

      // Calculate damage
      const dmgA = Math.floor(18 + Math.random() * 22);
      const dmgB = Math.floor(18 + Math.random() * 22);

      // Random winner or simultaneous damage
      const targetBot = Math.random() > 0.5 ? 'A' : 'B';
      if (targetBot === 'A') {
        this.healthA = Math.max(0, this.healthA - dmgA);
        this._showDamagePopup(sparkX - 80, sparkY - 40, `-${dmgA}`);
      } else {
        this.healthB = Math.max(0, this.healthB - dmgB);
        this._showDamagePopup(sparkX + 80, sparkY - 40, `-${dmgB}`);
      }

      // Update HUD bars
      if (this.healthBarA) this.healthBarA.style.width = `${this.healthA}%`;
      if (this.healthBarB) this.healthBarB.style.width = `${this.healthB}%`;

      // Recoil bots
      this.botA.classList.remove('clashing');
      this.botB.classList.remove('clashing');
      this.botA.classList.add('recoil');
      this.botB.classList.add('recoil');

      // Check KO
      if (this.healthA <= 0 || this.healthB <= 0) {
        this.isGameOver = true;
        const winner = this.healthA > 0 ? 'CYBER-COLOSSUS' : 'AETHER-SCYTHE';
        soundEngine.playWinSting();
        soundEngine.speakCombatVoice(`KNOCKOUT. ${winner} CLAIMS VICTORY.`);

        setTimeout(() => {
          if (this.koWinner) this.koWinner.textContent = `${winner} VICTORIOUS`;
          if (this.koBanner) this.koBanner.classList.add('visible');
        }, 300);
      }

      // Return to neutral ready stance
      setTimeout(() => {
        this.botA.classList.remove('recoil');
        this.botB.classList.remove('recoil');
        this.isFighting = false;
      }, 350);
    }, 150);
  }

  _showDamagePopup(x, y, text) {
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    this.section.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 800);
  }

  _spawnSparks(cx, cy, count) {
    const colors = ['#FFFFFF', '#FFDD55', '#FF9248', '#FF5A36'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.8 - Math.PI / 2;
      const speed = 6 + Math.random() * 16;
      this.sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.02 + Math.random() * 0.035,
        gravity: 0.4
      });
    }
  }

  _updateSparks(delta) {
    if (!this.ctx || this.sparks.length === 0) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += s.gravity;
      s.life -= s.decay;

      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = s.life;
      this.ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }
    this.ctx.globalAlpha = 1;
  }

  resetMatch() {
    this.healthA = 100;
    this.healthB = 100;
    this.isGameOver = false;
    this.isFighting = false;

    if (this.healthBarA) this.healthBarA.style.width = '100%';
    if (this.healthBarB) this.healthBarB.style.width = '100%';
    if (this.koBanner) this.koBanner.classList.remove('visible');

    soundEngine.playTick();
  }
}
