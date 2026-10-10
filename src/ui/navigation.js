/**
 * NAVIGATION, SOUND TOGGLE & SCRAMBLE CONTROLLER
 * Manages minimal navbar, full-screen circular drawer, sound toggle & volume slider,
 * text decode/scramble micro-interactions, and footer scroll resolved chord.
 */

import { soundEngine } from '../engine/soundEngine.js';

export class NavigationModule {
  constructor(lenis = null) {
    this.lenis = lenis;
    this.nav = document.querySelector('#codex-nav');
    this.soundBtn = document.querySelector('#btn-sound-toggle');
    this.volumeSlider = document.querySelector('#audio-volume-slider');
    this.menuBtn = document.querySelector('#menu-toggle-btn');
    this.drawer = document.querySelector('#fullscreen-menu-drawer');
    this.drawerLinks = document.querySelectorAll('.drawer-link');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.btnAscend = document.querySelector('#btn-ascend');
    this.footerWordmark = document.querySelector('#monumental-wordmark');
    this.footer = document.querySelector('#codex-footer');

    this.isMenuOpen = false;
    this.hasPlayedFooterChord = false;
    this.init();
  }

  init() {
    this._bindSoundControls();
    this._bindMenuDrawer();
    this._bindInteractiveAudio();
    this._bindScrambleEffects();
    this._bindAscend();
    this._bindFooterFill();
  }

  _bindSoundControls() {
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const active = soundEngine.toggle();
        this._updateAudioUI(!soundEngine.isMuted, soundEngine.volume);
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        soundEngine.setVolume(val);
      });
    }

    window.addEventListener('aether:audio-state-changed', (e) => {
      const { isMuted, volume } = e.detail;
      this._updateAudioUI(!isMuted, volume);
    });
  }

  _updateAudioUI(isActive, volume) {
    if (this.soundBtn) {
      this.soundBtn.classList.toggle('sound-active', isActive);
      const label = this.soundBtn.querySelector('.sound-label');
      if (label) {
        label.textContent = isActive ? 'AUDIO ON' : 'AUDIO OFF';
      }
    }
    if (this.volumeSlider && volume !== undefined) {
      this.volumeSlider.value = volume;
    }
  }

  _bindMenuDrawer() {
    if (!this.menuBtn || !this.drawer) return;

    this.menuBtn.addEventListener('click', () => {
      this.isMenuOpen = !this.isMenuOpen;
      this.drawer.classList.toggle('open', this.isMenuOpen);
      soundEngine.playWhoosh(this.isMenuOpen);
    });

    this.drawerLinks.forEach(link => {
      link.addEventListener('mouseenter', () => soundEngine.playHoverTick());
      link.addEventListener('click', () => {
        this.isMenuOpen = false;
        this.drawer.classList.remove('open');
        soundEngine.playWhoosh(false);
      });
    });
  }

  _bindInteractiveAudio() {
    // Add hover ticks to buttons, links, cards, and nav items
    const hoverTargets = document.querySelectorAll(
      'a, button, .codex-card, .initiative-card, .impact-card, .partner-card, .day-tab-btn, .cmd-palette-btn'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        soundEngine.playHoverTick();
      });
    });

    // Add click sounds to all buttons
    const clickTargets = document.querySelectorAll('button, .btn-codex');
    clickTargets.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEngine.playButtonClick();
      });
    });
  }

  _bindScrambleEffects() {
    const scrambleTargets = document.querySelectorAll('.scramble-hover');
    const chars = 'ΔΞΨΩ∑∏λ01X#@!§µ';

    scrambleTargets.forEach(el => {
      const originalText = el.textContent;
      let interval = null;

      el.addEventListener('mouseenter', () => {
        soundEngine.playHoverTick();
        let iter = 0;
        clearInterval(interval);

        interval = setInterval(() => {
          el.textContent = originalText
            .split('')
            .map((char, index) => {
              if (char === ' ' || char === '/') return char;
              if (index < iter) return originalText[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

          if (iter >= originalText.length) {
            clearInterval(interval);
            el.textContent = originalText;
          }
          iter += 1;
        }, 25);
      });

      el.addEventListener('mouseleave', () => {
        clearInterval(interval);
        el.textContent = originalText;
      });
    });
  }

  _bindAscend() {
    if (this.btnAscend) {
      this.btnAscend.addEventListener('click', () => {
        soundEngine.playButtonClick();
        soundEngine.playLoaderChime();
        if (this.lenis) {
          this.lenis.scrollTo(0, { duration: 1.6 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  _bindFooterFill() {
    if (!this.footerWordmark || !this.footer) return;

    window.addEventListener('scroll', () => {
      const rect = this.footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight) {
        const visibleHeight = windowHeight - rect.top;
        const progress = Math.min(100, Math.max(0, (visibleHeight / (rect.height * 0.75)) * 100));
        this.footerWordmark.style.backgroundSize = `100% ${progress}%`;
        if (progress > 85) {
          this.footerWordmark.classList.add('filled');
          if (!this.hasPlayedFooterChord) {
            this.hasPlayedFooterChord = true;
            soundEngine.playResolvedChord();
          }
        } else {
          this.footerWordmark.classList.remove('filled');
          if (progress < 50) {
            this.hasPlayedFooterChord = false;
          }
        }
      }
    }, { passive: true });
  }
}
