/**
 * MASTER BOOTLOADER // THE AETHERIAL CODEX
 * Techfest IIT Bombay 30th Edition
 * Initializes Lenis smooth scrolling, Central scheduler, procedural Audio, and all 10 folios.
 */

import Lenis from 'lenis';
import { scheduler } from './engine/scheduler.js';
import { soundEngine } from './engine/soundEngine.js';
import { IgnitionLoader } from './modules/loader.js';
import { HeroModule } from './modules/hero.js';
import { ManifestoModule } from './modules/manifesto.js';
import { FoliosModule } from './modules/folios.js';
import { ArenaModule } from './modules/arena.js';
import { ImpactModule } from './modules/impact.js';
import { TimelineModule } from './modules/timeline.js';
import { CatalystModule } from './modules/catalyst.js';
import { NavigationModule } from './ui/navigation.js';
import { CustomCursor } from './ui/cursor.js';
import { CommandPalette } from './ui/commandPalette.js';
import { EasterEggModule } from './ui/easterEggs.js';

class AetherialApp {
  constructor() {
    this.lenis = null;
    this.loader = null;
    this.hero = null;
    this.manifesto = null;
    this.folios = null;
    this.arena = null;
    this.impact = null;
    this.timeline = null;
    this.catalyst = null;
    this.navigation = null;
    this.cursor = null;
    this.commandPalette = null;
    this.easterEggs = null;

    this.init();
  }

  init() {
    console.log(
      '%c TECHFEST IIT BOMBAY 30TH EDITION %c THE AETHERIAL CODEX ',
      'background: #05060A; color: #D6A84F; font-weight: bold; border: 1px solid #D6A84F; padding: 4px;',
      'background: #D6A84F; color: #05060A; font-weight: bold; padding: 4px;'
    );

    // 1. Initialize Lenis Smooth Scrolling (unless reduced motion is preferred)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this._initLenis();
    }

    // 2. Initialize UI Interaction Layer
    this.cursor = new CustomCursor();
    this.commandPalette = new CommandPalette();
    this.easterEggs = new EasterEggModule();

    // 3. Initialize Folios
    this.hero = new HeroModule();
    this.manifesto = new ManifestoModule();
    this.folios = new FoliosModule();
    this.arena = new ArenaModule();
    this.impact = new ImpactModule();
    this.timeline = new TimelineModule();
    this.catalyst = new CatalystModule();
    this.navigation = new NavigationModule(this.lenis);

    // 4. Initialize Loader ("Ignition")
    this.loader = new IgnitionLoader({
      onComplete: () => {
        if (this.hero) {
          this.hero.reveal();
        }
      }
    });
  }

  _initLenis() {
    try {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5
      });

      // Bind Lenis step to central scheduler
      scheduler.addTask('lenisScroll', (delta, time) => {
        if (this.lenis) {
          this.lenis.raf(time * 1000);
        }
      });

      // Modulate audio drone filter based on scroll velocity
      this.lenis.on('scroll', (e) => {
        soundEngine.updateScrollVelocity(e.velocity);
      });
    } catch (err) {
      console.warn('Lenis smooth scrolling fallback to native:', err);
    }
  }
}

// Boot application upon DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.__AETHERIAL_APP__ = new AetherialApp();
});
