/**
 * FOLIO II // THE MANIFESTO MODULE
 * Word-by-word scroll reveal as user navigates down the pinned parchment.
 */

export class ManifestoModule {
  constructor() {
    this.section = document.querySelector('#manifesto-section');
    this.textEl = document.querySelector('#manifesto-text');
    this.words = [];
    this.init();
  }

  init() {
    if (!this.section || !this.textEl) return;

    // Split text into word spans
    const rawText = this.textEl.textContent.trim();
    const wordsArray = rawText.split(/\s+/);
    this.textEl.innerHTML = '';

    wordsArray.forEach((word) => {
      const span = document.createElement('span');
      span.className = 'word';
      // Mark key poetic words with highlight
      const cleanWord = word.replace(/[.,:;]/g, '').toUpperCase();
      if (['POWAI', 'CRUCIBLE', '30TH', 'STUDENT', 'INGENUITY', 'AETHERIAL', 'RENAISSANCE'].includes(cleanWord)) {
        span.classList.add('highlight-target');
      }
      span.textContent = word;
      this.textEl.appendChild(span);
      this.words.push(span);
    });

    this._bindScroll();
  }

  _bindScroll() {
    const updateWords = () => {
      const rect = this.section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      // Calculate 0 to 1 progress inside section
      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
      const activeWordCount = Math.floor(progress * this.words.length);

      this.words.forEach((w, idx) => {
        if (idx <= activeWordCount) {
          w.classList.add('active');
          if (w.classList.contains('highlight-target')) {
            w.classList.add('highlight');
          }
        } else {
          w.classList.remove('active');
          w.classList.remove('highlight');
        }
      });
    };

    window.addEventListener('scroll', updateWords, { passive: true });
    updateWords();
  }
}
