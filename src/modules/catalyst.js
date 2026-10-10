/**
 * FOLIO VII // INITIATIVES (CATALYST, AMBASSADORS, ACCOMMODATION)
 * Implements pure 2D magnetic tilt (skew & translate, strictly NO 3D perspective).
 */

import { soundEngine } from '../engine/soundEngine.js';

export class CatalystModule {
  constructor() {
    this.section = document.querySelector('#initiatives-section');
    this.cards = document.querySelectorAll('.initiative-card');
    this.init();
  }

  init() {
    if (!this.section || this.cards.length === 0) return;

    this.cards.forEach(card => {
      let isHovered = false;

      card.addEventListener('pointerenter', () => {
        isHovered = true;
        soundEngine.playTick();
      });

      card.addEventListener('pointermove', (e) => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        // Subtle 2D translate and skew only (Strictly NO 3D)
        const transX = normX * 8;
        const transY = normY * 8;
        const skewX = normY * -1.5;
        const skewY = normX * 1.5;

        card.style.transform = `translate(${transX}px, ${transY}px) skew(${skewX}deg, ${skewY}deg)`;
      });

      card.addEventListener('pointerleave', () => {
        isHovered = false;
        card.style.transform = 'translate(0px, 0px) skew(0deg, 0deg)';
      });
    });
  }
}
