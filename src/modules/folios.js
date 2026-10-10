/**
 * FOLIO III // THE PILLARS (HORIZONTAL GALLERY CONTROLLER)
 * Handles drag, wheel, keyboard and indicator navigation across 8 full-bleed folios.
 */

import { soundEngine } from '../engine/soundEngine.js';

export class FoliosModule {
  constructor() {
    this.section = document.querySelector('#folios-section');
    this.wrapper = document.querySelector('#folios-pinned-wrapper');
    this.panels = document.querySelectorAll('.folio-panel');
    this.prevBtn = document.querySelector('#folio-prev-btn');
    this.nextBtn = document.querySelector('#folio-next-btn');
    this.indicatorsContainer = document.querySelector('#folio-indicators');

    this.currentIndex = 0;
    this.total = this.panels.length;
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;

    this.init();
  }

  init() {
    if (!this.section || !this.wrapper || this.total === 0) return;

    this._createIndicators();
    this._bindEvents();
    this.goTo(0, false);
  }

  _createIndicators() {
    if (!this.indicatorsContainer) return;
    this.indicatorsContainer.innerHTML = '';

    for (let i = 0; i < this.total; i++) {
      const tick = document.createElement('div');
      tick.className = `indicator-tick ${i === 0 ? 'active' : ''}`;
      tick.setAttribute('title', `Folio 0${i + 1}`);
      tick.addEventListener('click', () => this.goTo(i));
      this.indicatorsContainer.appendChild(tick);
    }
  }

  goTo(index, playSound = true) {
    if (index < 0) index = 0;
    if (index >= this.total) index = this.total - 1;

    this.currentIndex = index;
    const offset = -this.currentIndex * 100;
    this.wrapper.style.transform = `translateX(${offset}vw)`;

    // Update active class on panels
    this.panels.forEach((p, idx) => {
      if (idx === index) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Update indicators
    if (this.indicatorsContainer) {
      const ticks = this.indicatorsContainer.querySelectorAll('.indicator-tick');
      ticks.forEach((t, idx) => {
        if (idx === index) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
    }

    if (playSound) {
      soundEngine.playPaperTurn();
      const pillarType = this.panels[index]?.getAttribute('data-pillar');
      if (pillarType) {
        setTimeout(() => soundEngine.playPillarSound(pillarType), 140);
      }
    }
  }

  _bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('mouseenter', () => soundEngine.playHoverTick());
      this.prevBtn.addEventListener('click', () => {
        soundEngine.playButtonClick();
        this.goTo(this.currentIndex - 1);
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('mouseenter', () => soundEngine.playHoverTick());
      this.nextBtn.addEventListener('click', () => {
        soundEngine.playButtonClick();
        this.goTo(this.currentIndex + 1);
      });
    }

    // Keyboard Arrow navigation when section is in view
    window.addEventListener('keydown', (e) => {
      const rect = this.section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
      if (!inView) return;

      if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        this.goTo(this.currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        this.goTo(this.currentIndex - 1);
      }
    });

    // Wheel navigation
    let wheelCooldown = false;
    this.section.addEventListener('wheel', (e) => {
      // If at boundaries and trying to scroll past, let normal vertical scroll occur
      if (e.deltaY > 0 && this.currentIndex === this.total - 1) return;
      if (e.deltaY < 0 && this.currentIndex === 0) return;

      if (wheelCooldown) return;

      if (Math.abs(e.deltaY) > 30 || Math.abs(e.deltaX) > 30) {
        e.preventDefault();
        wheelCooldown = true;
        if (e.deltaY > 0 || e.deltaX > 0) {
          this.goTo(this.currentIndex + 1);
        } else {
          this.goTo(this.currentIndex - 1);
        }
        setTimeout(() => { wheelCooldown = false; }, 600);
      }
    }, { passive: false });

    // Touch & Pointer Drag navigation
    let touchStartX = 0;
    this.section.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.section.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.goTo(this.currentIndex + 1);
        } else {
          this.goTo(this.currentIndex - 1);
        }
      }
    }, { passive: true });
  }
}
