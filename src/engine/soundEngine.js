/**
 * CENTRAL AUDIO ENGINE — PROCEDURAL WEB AUDIO SYNTHESIZER
 * Zero external audio files. 100% synthesized in real-time.
 * Single AudioContext, Master Gain (~0.8), DynamicsCompressorNode to prevent clipping.
 * Auto-unlocked on first user interaction (click, touch, key).
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.isMuted = true;
    this.volume = 0.8;
    this.isUnlocked = false;

    // Ambient loop nodes
    this.heroPadGain = null;
    this.heroPadOsc1 = null;
    this.heroPadOsc2 = null;
    this.heroPadFilter = null;

    // Loader drone nodes
    this.loaderDroneGain = null;
    this.loaderDroneOsc1 = null;
    this.loaderDroneOsc2 = null;
    this.loaderDroneFilter = null;
    this.loaderWhooshGain = null;
    this.loaderWhooshSource = null;

    // Arena blade buzz
    this.bladeGain = null;
    this.bladeOsc = null;

    // Rate limiter for hovers (max ~8 per second)
    this.lastHoverTime = 0;

    // Rolling counter tick interval
    this.counterTickInterval = null;

    this._bindGestureUnlock();
    this._bindVisibilityHandling();
  }

  _initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Dynamics Compressor to avoid any clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      const initialVol = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);
    } catch (e) {
      console.warn('Web Audio Context initialization error:', e);
    }
  }

  _bindGestureUnlock() {
    const unlock = () => {
      this._initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.isUnlocked) {
        this.isUnlocked = true;
        // Turn audio on automatically after first user gesture as required
        this.isMuted = false;
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
        }
        window.dispatchEvent(new CustomEvent('aether:audio-state-changed', {
          detail: { isMuted: this.isMuted, volume: this.volume }
        }));
      }
    };

    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: false, passive: true });
    });
  }

  _bindVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) {
        if (this.masterGain) {
          this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        }
      } else {
        const targetVol = this.isMuted ? 0 : this.volume;
        if (this.masterGain) {
          this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
        }
      }
    });
  }

  ensureReady() {
    this._initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    window.dispatchEvent(new CustomEvent('aether:audio-state-changed', {
      detail: { isMuted: this.isMuted, volume: this.volume }
    }));
  }

  toggle() {
    this.ensureReady();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetVol = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    }
    window.dispatchEvent(new CustomEvent('aether:audio-state-changed', {
      detail: { isMuted: this.isMuted, volume: this.volume }
    }));
    return !this.isMuted;
  }

  /* --------------------------------------------------------------------------
     A) LOADER SOUNDS
     -------------------------------------------------------------------------- */
  startLoaderDrone() {
    this.ensureReady();
    if (!this.ctx || this.loaderDroneOsc1) return;
    try {
      const now = this.ctx.currentTime;
      this.loaderDroneGain = this.ctx.createGain();
      this.loaderDroneGain.gain.setValueAtTime(0.001, now);
      this.loaderDroneGain.gain.exponentialRampToValueAtTime(0.25, now + 0.3);

      this.loaderDroneFilter = this.ctx.createBiquadFilter();
      this.loaderDroneFilter.type = 'lowpass';
      this.loaderDroneFilter.frequency.setValueAtTime(180, now);

      this.loaderDroneOsc1 = this.ctx.createOscillator();
      this.loaderDroneOsc1.type = 'sawtooth';
      this.loaderDroneOsc1.frequency.setValueAtTime(65, now);

      this.loaderDroneOsc2 = this.ctx.createOscillator();
      this.loaderDroneOsc2.type = 'triangle';
      this.loaderDroneOsc2.frequency.setValueAtTime(97.5, now);

      this.loaderDroneOsc1.connect(this.loaderDroneFilter);
      this.loaderDroneOsc2.connect(this.loaderDroneFilter);
      this.loaderDroneFilter.connect(this.loaderDroneGain);
      this.loaderDroneGain.connect(this.masterGain);

      this.loaderDroneOsc1.start();
      this.loaderDroneOsc2.start();

      // Rising pink-noise whoosh
      this._startLoaderWhoosh();
    } catch (e) {}
  }

  _startLoaderWhoosh() {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.4;
      }
      this.loaderWhooshSource = this.ctx.createBufferSource();
      this.loaderWhooshSource.buffer = noiseBuffer;
      this.loaderWhooshSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      this.loaderWhooshGain = this.ctx.createGain();
      this.loaderWhooshGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.loaderWhooshSource.connect(filter);
      filter.connect(this.loaderWhooshGain);
      this.loaderWhooshGain.connect(this.masterGain);
      this.loaderWhooshSource.start();
    } catch (e) {}
  }

  updateLoaderProgress(progress) {
    if (!this.ctx || !this.loaderDroneOsc1) return;
    const now = this.ctx.currentTime;
    const p = Math.max(0, Math.min(1, progress));
    // Pitch rises from 65Hz to 260Hz
    const freq1 = 65 + p * 200;
    const freq2 = 97.5 + p * 300;
    this.loaderDroneOsc1.frequency.setTargetAtTime(freq1, now, 0.05);
    this.loaderDroneOsc2.frequency.setTargetAtTime(freq2, now, 0.05);
    if (this.loaderDroneFilter) {
      this.loaderDroneFilter.frequency.setTargetAtTime(180 + p * 800, now, 0.05);
    }
    if (this.loaderDroneGain) {
      this.loaderDroneGain.gain.setTargetAtTime(0.2 + p * 0.25, now, 0.05);
    }
    if (this.loaderWhooshGain) {
      this.loaderWhooshGain.gain.setTargetAtTime(p * 0.2, now, 0.05);
    }
  }

  stopLoaderDrone() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.loaderDroneGain) {
      this.loaderDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      setTimeout(() => {
        try {
          if (this.loaderDroneOsc1) { this.loaderDroneOsc1.stop(); this.loaderDroneOsc1.disconnect(); }
          if (this.loaderDroneOsc2) { this.loaderDroneOsc2.stop(); this.loaderDroneOsc2.disconnect(); }
          this.loaderDroneOsc1 = null;
          this.loaderDroneOsc2 = null;
          this.loaderDroneGain = null;
        } catch (e) {}
      }, 350);
    }
    if (this.loaderWhooshGain) {
      this.loaderWhooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      setTimeout(() => {
        try {
          if (this.loaderWhooshSource) { this.loaderWhooshSource.stop(); this.loaderWhooshSource.disconnect(); }
          this.loaderWhooshSource = null;
          this.loaderWhooshGain = null;
        } catch (e) {}
      }, 250);
    }
  }

  playMorphTick(stageIndex = 0) {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freqs = [520, 680, 840, 1020, 1320];
      const freq = freqs[stageIndex % freqs.length] || 600;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  playLoaderChime() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Big sub impact
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(35, now + 0.4);
      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.55);

      // 2. Resonant chime chords (D major 9 pentatonic)
      const notes = [587.33, 739.99, 880, 1174.66, 1479.98, 1760];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 2.6);
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     B) HERO SOUNDS
     -------------------------------------------------------------------------- */
  startHeroAmbient() {
    this.ensureReady();
    if (!this.ctx || this.heroPadGain) return;
    try {
      const now = this.ctx.currentTime;
      this.heroPadGain = this.ctx.createGain();
      this.heroPadGain.gain.setValueAtTime(0.001, now);
      this.heroPadGain.gain.exponentialRampToValueAtTime(0.12, now + 1.5);

      this.heroPadFilter = this.ctx.createBiquadFilter();
      this.heroPadFilter.type = 'lowpass';
      this.heroPadFilter.frequency.setValueAtTime(160, now);

      this.heroPadOsc1 = this.ctx.createOscillator();
      this.heroPadOsc1.type = 'sine';
      this.heroPadOsc1.frequency.setValueAtTime(55, now); // A1

      this.heroPadOsc2 = this.ctx.createOscillator();
      this.heroPadOsc2.type = 'triangle';
      this.heroPadOsc2.frequency.setValueAtTime(82.4, now); // E2

      this.heroPadOsc1.connect(this.heroPadFilter);
      this.heroPadOsc2.connect(this.heroPadFilter);
      this.heroPadFilter.connect(this.heroPadGain);
      this.heroPadGain.connect(this.masterGain);

      this.heroPadOsc1.start();
      this.heroPadOsc2.start();
    } catch (e) {}
  }

  playHeroShimmer() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [1174.66, 1318.51, 1567.98, 1760, 2093];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 1.3);
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     C) NAVIGATION & UI SOUNDS
     -------------------------------------------------------------------------- */
  playHoverTick() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    const nowTime = performance.now();
    // Rate limit to max 8 ticks/sec (~120ms gap)
    if (nowTime - this.lastHoverTime < 110) return;
    this.lastHoverTime = nowTime;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.018);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  playButtonClick() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  playWhoosh(isOpen = true) {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2, now);

      if (isOpen) {
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
      } else {
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + 0.18);
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
      }

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     D) SCROLL SOUNDS
     -------------------------------------------------------------------------- */
  updateScrollVelocity(velocity) {
    if (this.isMuted || !this.heroPadFilter || !this.ctx) return;
    const absVel = Math.min(Math.abs(velocity || 0), 40);
    const targetFreq = 160 + absVel * 14;
    this.heroPadFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  playSectionWhoosh() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.linearRampToValueAtTime(700, now + 0.15);
      filter.frequency.linearRampToValueAtTime(200, now + 0.35);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.15);
      osc.frequency.linearRampToValueAtTime(90, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playPaperTurn() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.13);
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     E) PILLARS UNIQUE SOUNDS (1 per pillar)
     -------------------------------------------------------------------------- */
  playPillarSound(pillar) {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    switch (pillar) {
      case 'robowars': {
        // Metallic clanks
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'ai': {
        // Digital synaptic blips
        [880, 1320, 1760].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.15, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.06);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.07);
        });
        break;
      }
      case 'aerospace': {
        // Drone motor whir
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(480, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.32);
        break;
      }
      case 'hackathons': {
        // Mechanical typing clicks
        [0, 0.05, 0.11].forEach((delay) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1600 + Math.random() * 400, now + delay);
          gain.gain.setValueAtTime(0.14, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.04);
        });
        break;
      }
      case 'lectures': {
        // Reverberant chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.3);
        break;
      }
      case 'exhibitions': {
        // Automaton servo whir
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.linearRampToValueAtTime(280, now + 0.18);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'fintech': {
        // Cryptographic coin chime
        [1046.5, 1567.98].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.18, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.45);
        });
        break;
      }
      case 'mun': {
        // Gavel strike resonance
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }
      default:
        this.playHoverTick();
    }
  }

  /* --------------------------------------------------------------------------
     F) ROBOWARS ARENA SOUNDS
     -------------------------------------------------------------------------- */
  playClash() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Heavy low impact punch
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(32, now + 0.22);
      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.26);

      // 2. Metallic clang
      const clang = this.ctx.createOscillator();
      const clangGain = this.ctx.createGain();
      clang.type = 'sawtooth';
      clang.frequency.setValueAtTime(1200, now);
      clang.frequency.exponentialRampToValueAtTime(380, now + 0.12);
      clangGain.gain.setValueAtTime(0.3, now);
      clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      clang.connect(clangGain);
      clangGain.connect(this.masterGain);
      clang.start(now);
      clang.stop(now + 0.16);

      // 3. Electric sparks sizzle
      this.playSparks();
    } catch (e) {}
  }

  playSparks() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.random();
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.16);
    } catch (e) {}
  }

  startBladeBuzz() {
    this.ensureReady();
    if (!this.ctx || this.bladeGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      this.bladeGain = this.ctx.createGain();
      this.bladeGain.gain.setValueAtTime(0.001, now);
      this.bladeGain.gain.exponentialRampToValueAtTime(0.12, now + 0.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      this.bladeOsc = this.ctx.createOscillator();
      this.bladeOsc.type = 'sawtooth';
      this.bladeOsc.frequency.setValueAtTime(140, now);

      this.bladeOsc.connect(filter);
      filter.connect(this.bladeGain);
      this.bladeGain.connect(this.masterGain);
      this.bladeOsc.start();
    } catch (e) {}
  }

  stopBladeBuzz() {
    if (!this.ctx || !this.bladeGain) return;
    const now = this.ctx.currentTime;
    this.bladeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    setTimeout(() => {
      try {
        if (this.bladeOsc) { this.bladeOsc.stop(); this.bladeOsc.disconnect(); }
        this.bladeOsc = null;
        this.bladeGain = null;
      } catch (e) {}
    }, 180);
  }

  playWinSting() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.8);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.85);
      });
    } catch (e) {}
  }

  playLoseSting() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [311.13, 293.66, 277.18, 220]; // Descending minor
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.55);
      });
    } catch (e) {}
  }

  speakCombatVoice(text) {
    if (this.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.55;
        utterance.volume = this.volume;
        window.speechSynthesis.speak(utterance);
      } else {
        // Synthesize robotic vocal announcement tones
        this.playWinSting();
      }
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     G) IMPACT NUMBERS SOUNDS
     -------------------------------------------------------------------------- */
  startCounterRoll() {
    if (this.counterTickInterval || this.isMuted) return;
    this.counterTickInterval = setInterval(() => {
      this.playCounterTick();
    }, 70);
  }

  playCounterTick() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 + Math.random() * 200, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  stopCounterRoll() {
    if (this.counterTickInterval) {
      clearInterval(this.counterTickInterval);
      this.counterTickInterval = null;
    }
  }

  playCounterChime() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1108.73, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.18, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 1.25);
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     H) SCHEDULE TAB SOUND
     -------------------------------------------------------------------------- */
  playTabClick() {
    this.playButtonClick();
  }

  /* --------------------------------------------------------------------------
     I) FOOTER RESOLVED CHORD
     -------------------------------------------------------------------------- */
  playResolvedChord() {
    this.ensureReady();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // D minor / Renaissance majestic resolve: D2, A2, D3, F#3, A3, D4
      const freqs = [73.42, 110, 146.83, 185.0, 220, 293.66];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx < 2 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 3.1);
      });
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     AUDIO VERIFICATION TEST HELPER
     -------------------------------------------------------------------------- */
  testAllSounds() {
    this.ensureReady();
    this.isMuted = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    console.log('%c[AUDIO TEST]%c Starting sequential sound engine audit...', 'color: #D6A84F; font-weight: bold;', 'color: #4FE0F5;');

    const sequence = [
      { name: '1. Hover Tick', fn: () => this.playHoverTick() },
      { name: '2. Button Click', fn: () => this.playButtonClick() },
      { name: '3. Morph Tick', fn: () => this.playMorphTick(2) },
      { name: '4. Whoosh', fn: () => this.playWhoosh(true) },
      { name: '5. Hero Shimmer', fn: () => this.playHeroShimmer() },
      { name: '6. Paper Turn', fn: () => this.playPaperTurn() },
      { name: '7. Pillar Sound: Robowars', fn: () => this.playPillarSound('robowars') },
      { name: '8. Pillar Sound: AI', fn: () => this.playPillarSound('ai') },
      { name: '9. Pillar Sound: Aerospace', fn: () => this.playPillarSound('aerospace') },
      { name: '10. Pillar Sound: Hackathons', fn: () => this.playPillarSound('hackathons') },
      { name: '11. Pillar Sound: Fintech', fn: () => this.playPillarSound('fintech') },
      { name: '12. Robowars Metal Clash & Sparks', fn: () => this.playClash() },
      { name: '13. Robot Announcer Voice', fn: () => this.speakCombatVoice('COMBAT READY') },
      { name: '14. Win Sting', fn: () => this.playWinSting() },
      { name: '15. Counter Chime', fn: () => this.playCounterChime() },
      { name: '16. Loader Chime', fn: () => this.playLoaderChime() },
      { name: '17. Footer Resolved Chord', fn: () => this.playResolvedChord() }
    ];

    sequence.forEach((item, idx) => {
      setTimeout(() => {
        console.log(`%c[AUDIO TEST] Playing: ${item.name}`, 'color: #D6A84F;');
        item.fn();
      }, idx * 550);
    });

    return 'Audio test sequence started. Listen to your speakers!';
  }
}

export const soundEngine = new SoundEngine();

// Expose verification function on window
if (typeof window !== 'undefined') {
  window.__testAudio = () => soundEngine.testAllSounds();
}
