/**
 * FOLIO I // HERO "AWAKENING" MODULE
 * Generative 2D flow field, Vitruvian machine 2D parallax,
 * word-preserving per-character reveal, and live countdown timer to Dec 16, 2026.
 */

import { FlowField } from '../engine/flowfield.js';
import { scheduler } from '../engine/scheduler.js';
import { soundEngine } from '../engine/soundEngine.js';

export class HeroModule {
  constructor() {
    this.section = document.querySelector('#hero-section');
    this.canvas = document.querySelector('#hero-flow-canvas');
    this.machineWrap = document.querySelector('#vitruvian-machine-wrap');
    this.title = document.querySelector('#hero-title');
    this.countdownDays = document.querySelector('#cd-days');
    this.countdownHours = document.querySelector('#cd-hours');
    this.countdownMins = document.querySelector('#cd-mins');
    this.countdownSecs = document.querySelector('#cd-secs');

    this.flowField = null;
    this.targetDecDate = new Date('2026-12-16T09:00:00+05:30').getTime();

    this.init();
  }

  init() {
    if (!this.section) return;

    // Initialize Generative Flow Field
    if (this.canvas) {
      this.flowField = new FlowField(this.canvas);
      scheduler.addTask('heroFlowField', (delta, time) => {
        if (this.flowField && this.flowField.active) {
          this.flowField.update(delta, time);
          this.flowField.render();
        }
      });
    }

    // Pause canvas if Hero is completely offscreen
    this._setupIntersectionObserver();

    // Prepare Title Per-Character Reveal (word-wrapped)
    this._setupTitleReveal();

    // Setup Live Countdown
    this._startCountdown();

    // 2D Mouse Parallax & Limb interaction
    this._bindInteractions();
  }

  _setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (this.flowField) {
          this.flowField.active = entry.isIntersecting;
        }
        if (entry.isIntersecting) {
          soundEngine.startHeroAmbient();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(this.section);
  }

  _setupTitleReveal() {
    if (!this.title) return;

    // Define the exact words: "An", "Aetherial" (italic gold), "Renaissance"
    const wordsConfig = [
      { text: 'An', isItalicGold: false },
      { text: 'Aetherial', isItalicGold: true },
      { text: 'Renaissance', isItalicGold: false }
    ];

    this.title.innerHTML = '';
    let globalCharIndex = 0;

    wordsConfig.forEach((wordObj) => {
      const wordContainer = document.createElement(wordObj.isItalicGold ? 'em' : 'span');
      wordContainer.className = `title-word ${wordObj.isItalicGold ? 'italic-gold' : ''}`;

      for (let i = 0; i < wordObj.text.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = wordObj.text[i];
        charSpan.style.transitionDelay = `${globalCharIndex * 32}ms`;
        wordContainer.appendChild(charSpan);
        globalCharIndex++;
      }

      this.title.appendChild(wordContainer);
    });
  }

  reveal() {
    if (this.title) {
      this.title.classList.add('revealed');
      soundEngine.playHeroShimmer();
      soundEngine.startHeroAmbient();
    }
  }

  _startCountdown() {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, this.targetDecDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      if (this.countdownDays) this.countdownDays.textContent = String(days).padStart(2, '0');
      if (this.countdownHours) this.countdownHours.textContent = String(hours).padStart(2, '0');
      if (this.countdownMins) this.countdownMins.textContent = String(mins).padStart(2, '0');
      if (this.countdownSecs) this.countdownSecs.textContent = String(secs).padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  _bindInteractions() {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('pointermove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX = (e.clientX - cx) / cx;
      mouseY = (e.clientY - cy) / cy;

      if (this.flowField) {
        this.flowField.setMouse(e.clientX, e.clientY);
      }
    }, { passive: true });

    // Smooth damping for Vitruvian Machine 2D parallax
    scheduler.addTask('heroParallax', (delta) => {
      if (!this.machineWrap || (this.flowField && !this.flowField.active)) return;
      currentX += (mouseX * 16 - currentX) * 0.08;
      currentY += (mouseY * 16 - currentY) * 0.08;
      this.machineWrap.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    });

    // Limb sound feedback
    const limbs = document.querySelectorAll('.vitruvian-svg .limb, .vitruvian-svg .core-reactor');
    limbs.forEach(limb => {
      limb.addEventListener('mouseenter', () => {
        soundEngine.playHoverTick();
      });
    });

    window.addEventListener('resize', () => {
      if (this.flowField) this.flowField.resize();
    });
  }
}
