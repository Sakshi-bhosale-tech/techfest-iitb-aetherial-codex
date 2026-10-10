/**
 * EASTER EGGS & CELEBRATORY MECHANISMS
 * - Type "ROBO": Robot parade marching across the viewport
 * - Konami Code: Celebratory 30th drone-show formation & chime
 * - 10s Idle: Meditative codex alignment
 */

import { soundEngine } from '../engine/soundEngine.js';

export class EasterEggModule {
  constructor() {
    this.keyBuffer = [];
    this.konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    this.konamiIndex = 0;
    this.idleTimer = null;
    this.init();
  }

  init() {
    this._bindKeyDetection();
    this._bindIdleTracker();

    window.addEventListener('aether:robot-parade', () => {
      this.triggerRobotParade();
    });
  }

  _bindKeyDetection() {
    window.addEventListener('keydown', (e) => {
      // 1. Check "ROBO" typing
      this.keyBuffer.push(e.key.toUpperCase());
      if (this.keyBuffer.length > 10) this.keyBuffer.shift();

      if (this.keyBuffer.join('').includes('ROBO')) {
        this.keyBuffer = [];
        this.triggerRobotParade();
      }

      // 2. Check Konami code
      const currentExpected = this.konamiCode[this.konamiIndex];
      if (e.code === currentExpected) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiCode.length) {
          this.konamiIndex = 0;
          this.triggerKonamiDroneShow();
        }
      } else {
        this.konamiIndex = 0;
      }
    });
  }

  triggerRobotParade() {
    soundEngine.playTick();

    const parade = document.createElement('div');
    parade.className = 'robot-parade-overlay';
    parade.style.position = 'fixed';
    parade.style.bottom = '15px';
    parade.style.left = '-300px';
    parade.style.zIndex = '99999';
    parade.style.display = 'flex';
    parade.style.gap = '30px';
    parade.style.pointerEvents = 'none';
    parade.style.transition = 'transform 8s linear';

    for (let i = 0; i < 5; i++) {
      const bot = document.createElement('div');
      bot.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D6A84F" stroke-width="1.5">
          <rect x="5" y="8" width="14" height="10" rx="2"/>
          <line x1="8" y1="12" x2="8" y2="12.01" stroke-width="3"/>
          <line x1="16" y1="12" x2="16" y2="12.01" stroke-width="3"/>
          <path d="M12 2v6"/>
          <circle cx="12" cy="2" r="1.5" fill="#4FE0F5"/>
          <line x1="2" y1="13" x2="5" y2="13"/>
          <line x1="19" y1="13" x2="22" y2="13"/>
          <path d="M7 18v3M17 18v3"/>
        </svg>
      `;
      bot.style.animation = `bounceBot 0.4s infinite alternate ${i * 0.08}s`;
      parade.appendChild(bot);
    }

    document.body.appendChild(parade);

    requestAnimationFrame(() => {
      parade.style.transform = `translateX(${window.innerWidth + 400}px)`;
    });

    setTimeout(() => {
      parade.remove();
    }, 8500);

    this._showCodexToast('EASTER EGG // "ROBO" PARADE MARCHING ACROSS CODEX');
  }

  triggerKonamiDroneShow() {
    soundEngine.playChime();
    this._showCodexToast('KONAMI CODE CONFIRMED // TECHFEST 30TH CELESTIAL DRONE FORMATION ENGAGED');
  }

  _bindIdleTracker() {
    const resetIdle = () => {
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        // 10s idle trigger
        window.dispatchEvent(new CustomEvent('aether:idle'));
      }, 10000);
    };

    window.addEventListener('pointermove', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    window.addEventListener('scroll', resetIdle, { passive: true });
    resetIdle();
  }

  _showCodexToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'codex-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.background = 'rgba(11, 13, 20, 0.95)';
    toast.style.border = '1px solid var(--gold-renaissance)';
    toast.style.borderRadius = '4px';
    toast.style.fontFamily = 'var(--font-mono)';
    toast.style.fontSize = '0.75rem';
    toast.style.color = 'var(--gold-renaissance-light)';
    toast.style.boxShadow = '0 0 30px var(--gold-glow)';
    toast.style.zIndex = '100000';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    toast.textContent = msg;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}
