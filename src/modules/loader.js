/**
 * FOLIO 0 // THE IGNITION LOADER
 * Orchestrates Vitruvian geometry animation, hold-to-channel energy interactions,
 * particle morphing, audio feedback, and ink-dissolve transition to Hero.
 */

import { ParticleSwarm } from '../engine/particleSwarm.js';
import { ShapeSampler } from '../engine/shapeSampler.js';
import { scheduler } from '../engine/scheduler.js';
import { soundEngine } from '../engine/soundEngine.js';

export class IgnitionLoader {
  constructor(options = {}) {
    this.onComplete = options.onComplete || (() => {});
    this.container = document.querySelector('#loader-container');
    this.canvas = document.querySelector('#loader-canvas');
    this.trigger = document.querySelector('#hold-trigger');
    this.progressBar = document.querySelector('#hold-progress-bar');
    this.percentageText = document.querySelector('#progress-percentage');
    this.statusText = document.querySelector('#loader-status');
    this.shapeLabel = document.querySelector('#shape-label');
    this.shapeDiagram = document.querySelector('#shape-diagram-tag');
    this.skipBtn = document.querySelector('#skip-intro-btn');

    this.statEditions = document.querySelector('#stat-editions');
    this.statVisitors = document.querySelector('#stat-visitors');
    this.statColleges = document.querySelector('#stat-colleges');

    this.progress = 0;
    this.isHolding = false;
    this.isCompleted = false;
    this.currentStage = -1;

    // Morph shapes & labels
    this.stages = [
      {
        threshold: 0,
        name: 'ENGINEERING // VITRUVIAN GEAR',
        tag: 'DIAGRAM NO. 01 // MECHANICAL ART',
        points: ShapeSampler.getGear(1600)
      },
      {
        threshold: 0.22,
        name: 'ROBOTICS // ARTICULATED CYBERNETICS',
        tag: 'DIAGRAM NO. 02 // ROBOTIC KINEMATICS',
        points: ShapeSampler.getRobotArm(1600)
      },
      {
        threshold: 0.44,
        name: 'INTELLIGENCE // SYNAPTIC NEURAL NET',
        tag: 'DIAGRAM NO. 03 // DEEP AETHER COGNITION',
        points: ShapeSampler.getNeuralNet(1600)
      },
      {
        threshold: 0.66,
        name: 'AEROSPACE // AUTONOMOUS SWARM DRONE',
        tag: 'DIAGRAM NO. 04 // LIGHT FLIGHT SYSTEMS',
        points: ShapeSampler.getDrone(1600)
      },
      {
        threshold: 0.88,
        name: 'TECHFEST // IIT BOMBAY 30TH EDITION',
        tag: 'DIAGRAM NO. 05 // THE AETHERIAL CODEX',
        points: ShapeSampler.getTechfestWord(1600)
      }
    ];

    this.swarm = null;
    this.init();
  }

  init() {
    if (!this.container || !this.canvas) return;

    // Initialize 2D particle swarm
    this.swarm = new ParticleSwarm(this.canvas, 1600);
    this.swarm.setShape(this.stages[0].points, 0.8);

    // Register swarm render loop with scheduler
    scheduler.addTask('loaderSwarm', (delta, time) => {
      if (this.swarm && this.swarm.active) {
        this.swarm.update(delta, time);
        this.swarm.render();
      }
    });

    // Animate Vitruvian SVG geometry drawing
    requestAnimationFrame(() => {
      const geom = document.querySelector('.vitruvian-geometry');
      if (geom) geom.classList.add('drawn');
    });

    this._bindEvents();
    this._startProgressLoop();
    this.scrambleText(this.statusText, 'PRESS & HOLD TO CHANNEL AETHER');
  }

  _bindEvents() {
    const startHold = (e) => {
      if (this.isCompleted) return;
      if (e.type === 'keydown' && e.code !== 'Space') return;
      if (e.type === 'keydown') e.preventDefault();

      soundEngine.ensureReady();
      this.isHolding = true;
      if (this.trigger) this.trigger.classList.add('active');
      soundEngine.startLoaderDrone();
    };

    const stopHold = (e) => {
      if (this.isCompleted) return;
      if (e.type === 'keyup' && e.code !== 'Space') return;

      this.isHolding = false;
      if (this.trigger) this.trigger.classList.remove('active');
      soundEngine.stopLoaderDrone();
    };

    // Pointer events on trigger button
    if (this.trigger) {
      this.trigger.addEventListener('pointerdown', startHold);
      window.addEventListener('pointerup', stopHold);
      window.addEventListener('pointercancel', stopHold);
      // Extra touchstart listener for immediate mobile audio unlock
      this.trigger.addEventListener('touchstart', startHold, { passive: false });
      window.addEventListener('touchend', stopHold, { passive: true });
    }

    // Keyboard Space key support
    window.addEventListener('keydown', startHold);
    window.addEventListener('keyup', stopHold);

    // Skip intro button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        soundEngine.playButtonClick();
        this._completeIgnition(true);
      });
    }

    // Resize handling
    window.addEventListener('resize', () => {
      if (this.swarm) this.swarm.resize();
    });
  }

  _startProgressLoop() {
    scheduler.addTask('loaderProgress', (delta) => {
      if (this.isCompleted) return;

      if (this.isHolding) {
        // Holding accelerates progress (takes ~4.5s of dedicated hold)
        this.progress += delta * 0.22;
        soundEngine.updateLoaderProgress(this.progress);
      } else {
        // Subtle natural decay when released, with a gentle baseline crawl so user is never stranded
        this.progress = Math.max(this.progress - delta * 0.08, this.progress + delta * 0.025);
        soundEngine.updateLoaderProgress(this.progress);
      }

      this.progress = Math.min(1, Math.max(0, this.progress));
      this._updateUI(this.progress);

      if (this.progress >= 1) {
        this._completeIgnition(false);
      }
    });
  }

  _updateUI(p) {
    // Update SVG circle stroke (circumference ~ 440)
    if (this.progressBar) {
      const offset = 440 - p * 440;
      this.progressBar.style.strokeDashoffset = offset;
    }

    // Update Percentage
    const pct = Math.floor(p * 100);
    if (this.percentageText) {
      this.percentageText.textContent = `${pct}%`;
    }

    // Check Stage Transitions
    for (let i = this.stages.length - 1; i >= 0; i--) {
      if (p >= this.stages[i].threshold) {
        if (this.currentStage !== i) {
          this.currentStage = i;
          const stage = this.stages[i];
          this.swarm.setShape(stage.points, 0.9);
          this.scrambleText(this.shapeLabel, stage.name);
          if (this.shapeDiagram) this.shapeDiagram.textContent = stage.tag;
          soundEngine.playMorphTick(i);
        }
        break;
      }
    }

    // Ticking Live Counters
    if (this.statEditions) {
      this.statEditions.textContent = Math.floor(p * 30);
    }
    if (this.statVisitors) {
      const visitors = Math.floor(p * 175000);
      this.statVisitors.textContent = visitors > 0 ? `${visitors.toLocaleString('en-IN')}+` : '0';
    }
    if (this.statColleges) {
      const colleges = Math.floor(p * 2500);
      this.statColleges.textContent = colleges > 0 ? `${colleges.toLocaleString('en-IN')}+` : '0';
    }
  }

  _completeIgnition(skipped = false) {
    if (this.isCompleted) return;
    this.isCompleted = true;
    scheduler.removeTask('loaderProgress');

    soundEngine.stopLoaderDrone();
    if (!skipped) {
      soundEngine.playLoaderChime();
    }

    // Shockwave burst in swarm
    if (this.swarm) {
      this.swarm.triggerShockwave();
    }

    // Update labels to fully ignited
    if (this.percentageText) this.percentageText.textContent = '100%';
    if (this.statusText) this.scrambleText(this.statusText, 'AETHER IGNITED // WELCOME TO TECHFEST');

    // Ink dissolve transition via SVG filter displacement map
    setTimeout(() => {
      const filterDisp = document.querySelector('#ink-displacement');
      if (filterDisp) {
        // Animate displacement scale from 0 to 120
        let scale = 0;
        const dissolveAnim = () => {
          scale += 4;
          filterDisp.setAttribute('scale', scale);
          if (scale < 120) {
            requestAnimationFrame(dissolveAnim);
          }
        };
        requestAnimationFrame(dissolveAnim);
      }

      if (this.container) {
        this.container.classList.add('dissolving');
      }

      // Cleanup & trigger hero entrance
      setTimeout(() => {
        if (this.swarm) this.swarm.active = false;
        scheduler.removeTask('loaderSwarm');
        if (this.container) {
          this.container.style.display = 'none';
        }
        this.onComplete();
      }, 850);
    }, skipped ? 100 : 500);
  }

  scrambleText(el, targetText) {
    if (!el) return;
    const chars = 'ΔΞΨΩ∑∏λ01X#@!§µ¢£';
    let iter = 0;
    const len = targetText.length;
    clearInterval(el._scrambleInterval);

    el._scrambleInterval = setInterval(() => {
      el.textContent = targetText
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '/' || char === '.') return char;
          if (index < iter) {
            return targetText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iter >= len) {
        clearInterval(el._scrambleInterval);
        el.textContent = targetText;
      }
      iter += 1 / 2;
    }, 28);
  }
}
