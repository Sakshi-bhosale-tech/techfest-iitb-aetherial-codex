/**
 * COMMAND PALETTE CONTROLLER (CMD / CTRL + K)
 * Keyboard-first navigation and rapid execution layer for sections & actions.
 */

import { soundEngine } from '../engine/soundEngine.js';

export class CommandPalette {
  constructor(options = {}) {
    this.backdrop = document.querySelector('#cmd-palette-backdrop');
    this.box = document.querySelector('#cmd-palette-box');
    this.input = document.querySelector('#cmd-search-input');
    this.resultsList = document.querySelector('#cmd-results-list');
    this.triggerBtns = document.querySelectorAll('.cmd-palette-btn');

    this.isOpen = false;
    this.selectedIndex = 0;
    this.options = options;

    this.commands = [
      { id: 'sec-hero', label: 'Awakening // Hero Codex', type: 'SECTION', action: () => this._scrollTo('#hero-section') },
      { id: 'sec-manifesto', label: 'Proclamation // The Manifesto', type: 'SECTION', action: () => this._scrollTo('#manifesto-section') },
      { id: 'sec-pillars', label: 'The Pillars // 8 Horizontal Folios', type: 'SECTION', action: () => this._scrollTo('#folios-section') },
      { id: 'sec-arena', label: 'Robowars Arena // 2D Combat Clash', type: 'INTERACTIVE', action: () => this._scrollTo('#arena-section') },
      { id: 'sec-impact', label: 'Live Impact // Mumbai Beacon Map', type: 'METRICS', action: () => this._scrollTo('#impact-section') },
      { id: 'sec-timeline', label: 'Three Days, One Aether // Schedule', type: 'SCHEDULE', action: () => this._scrollTo('#timeline-section') },
      { id: 'sec-initiatives', label: 'Catalyst & Ambassadors // Grant Programs', type: 'INITIATIVES', action: () => this._scrollTo('#initiatives-section') },
      { id: 'act-sound', label: 'Toggle Aether Audio Synthesizer', type: 'AUDIO', action: () => this._toggleSound() },
      { id: 'act-calendar', label: 'Export Schedule (.ics Calendar)', type: 'EXPORT', action: () => this._exportCalendar() },
      { id: 'act-parade', label: 'Trigger Cybernetic Robot Parade', type: 'EASTER EGG', action: () => window.dispatchEvent(new CustomEvent('aether:robot-parade')) }
    ];

    this.filtered = [...this.commands];
    this.init();
  }

  init() {
    if (!this.backdrop || !this.input) return;

    this._bindEvents();
    this._render();
  }

  _bindEvents() {
    // Cmd / Ctrl + K shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      } else if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % this.filtered.length;
          this._render();
          soundEngine.playTick();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + this.filtered.length) % this.filtered.length;
          this._render();
          soundEngine.playHoverTick();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this._executeSelected();
        }
      }
    });

    // Trigger buttons
    this.triggerBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => soundEngine.playHoverTick());
      btn.addEventListener('click', () => this.open());
    });

    // Close on backdrop click
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    // Search filter input
    this.input.addEventListener('input', () => {
      const q = this.input.value.toLowerCase().trim();
      this.filtered = this.commands.filter(c => 
        c.label.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
      );
      this.selectedIndex = 0;
      this._render();
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.backdrop.classList.add('open');
    this.input.value = '';
    this.filtered = [...this.commands];
    this.selectedIndex = 0;
    this._render();
    setTimeout(() => this.input.focus(), 50);
    soundEngine.playWhoosh(true);
  }

  close() {
    this.isOpen = false;
    this.backdrop.classList.remove('open');
    soundEngine.playWhoosh(false);
  }

  _render() {
    this.resultsList.innerHTML = '';
    if (this.filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'cmd-item';
      empty.textContent = 'No matching codex entries found.';
      empty.style.color = 'var(--parchment-muted)';
      this.resultsList.appendChild(empty);
      return;
    }

    this.filtered.forEach((cmd, idx) => {
      const li = document.createElement('li');
      li.className = `cmd-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      li.innerHTML = `
        <span class="cmd-item-label">
          <span>${cmd.label}</span>
        </span>
        <span class="cmd-item-type">${cmd.type}</span>
      `;
      li.addEventListener('click', () => {
        this.selectedIndex = idx;
        this._executeSelected();
      });
      this.resultsList.appendChild(li);
    });
  }

  _executeSelected() {
    const selected = this.filtered[this.selectedIndex];
    if (selected && selected.action) {
      this.close();
      selected.action();
    }
  }

  _scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  _toggleSound() {
    const btn = document.querySelector('#btn-sound-toggle');
    if (btn) btn.click();
  }

  _exportCalendar() {
    const btn = document.querySelector('#btn-add-calendar');
    if (btn) btn.click();
  }
}
