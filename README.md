# TECHFEST 2026 // IIT BOMBAY (30TH EDITION)
# THE AETHERIAL CODEX — AN AETHERIAL RENAISSANCE
> **Award-level creative web experience for Asia's Largest Science & Technology Festival**  
> *IIT Bombay Campus, Powai, Mumbai | December 16–18, 2026*

---

## ✦ Creative Concept: "The Aetherial Codex"
A living Renaissance engineering notebook in the spirit of Leonardo da Vinci's master manuscripts, where hand-drafted schematics of machines ignite into glowing, cybernetic reality. Old-world craft meets future technological mastery. Every section is a numbered "Folio" of the codex, framed with blueprint grid crosshairs, hairline rules, technical coordinate stamps, and fine paper grain.

### Art Direction & Palette
- **Void Black** (`#05060A`): Deep obsidian celestial foundation.
- **Parchment Ink-White** (`#EDE6D3`): Aged Italian cotton-rag ink.
- **Renaissance Gold** (`#D6A84F`): Illuminated manuscript gilding and radiant energy.
- **Aether Cyan** (`#4FE0F5`): Electric cybernetic plasma and aerospace vectors.
- **Ember Flare** (`#FF5A36`): Dedicated Robowars combat fire.
- **Typography:** *Instrument Serif* & *Cormorant Garamond* (display roman & italics) paired with *JetBrains Mono* (draftsman technical measurements) and *Inter* (crisp editorial readability).

---

## ✦ Strict Architectural Constraints & Compliance
- **ABSOLUTELY ZERO 3D:** No Three.js, no WebGL/GLSL shaders, no Spline, no GLB/OBJ models, and no CSS 3D transforms used to fake 3D scenes.
- **100% 2D Technologies:** Native Canvas 2D, SVG filters (`feTurbulence`, `feDisplacementMap`), CSS (`clip-path`, `mask-image`, `backdrop-filter`, `mix-blend-mode`), Lenis smooth scroll, GSAP, and Web Audio API.
- **Ultra-Lightweight Performance:**
  - **JS Bundle Size:** **~22 KB gzipped** (well under the 250KB limit!).
  - **CSS Bundle Size:** **~9 KB gzipped**.
  - **Canvas DPR Capped:** Automatically clamped at `Math.min(devicePixelRatio, 2)`.
  - **Single Shared rAF Scheduler:** All animations share one central tick loop with delta-time smoothing and frame drop detection.
  - **Adaptive Throttling:** `IntersectionObserver` halts offscreen canvas drawing; rAF automatically stops when the browser tab is inactive (`document.hidden`).

---

## ✦ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE AETHERIAL CODEX                             │
├────────────────────────────────────────────────────────────────────────┤
│  ENGINE LAYER                                                          │
│  ├── scheduler.js       (Central rAF loop, adaptive DPR, FPS monitor) │
│  ├── soundEngine.js     (Procedural Web Audio synth: drone, ticks,     │
│  │                       chime, hold hum, combat clash)                │
│  ├── shapeSampler.js    (2D Vector point cloud generators: Gear,      │
│  │                       Robot Arm, Neural Net, Drone, Techfest)       │
│  ├── particleSwarm.js   (1600+ particle drone light show simulation)   │
│  └── flowfield.js       (Generative 2D Perlin streamline vectors)      │
├────────────────────────────────────────────────────────────────────────┤
│  FOLIO SECTIONS                                                        │
│  ├── Folio 0: Ignition  (Hold-to-channel energy, morphs, ink dissolve) │
│  ├── Folio I: Hero      (Per-char reveal, Vitruvian machine, countdown)│
│  ├── Folio II: Manifesto(Pinned word-by-word reveal & annotations)     │
│  ├── Folio III: Pillars (Horizontal gallery of 8 mechanism folios)     │
│  ├── Folio IV: Arena    (Interactive Robowars duel, 2D physical sparks)│
│  ├── Folio V: Impact    (Subcontinental dot-matrix map & live counters)│
│  ├── Folio VI: Schedule (Day 1-3 filtering, RFC 5545 .ics generator)   │
│  ├── Folio VII: Grants  (Catalyst, Ambassador, Residency tilt cards)   │
│  ├── Folio VIII: Marquee(Dual-direction continuous sponsor marquee)    │
│  └── Folio IX: Footer   (Monumental outlined wordmark gold flood)      │
├────────────────────────────────────────────────────────────────────────┤
│  ADVANCED INTERACTION LAYER                                            │
│  ├── cursor.js          (Spring follower, label morphs, 16 drone trails│
│  ├── commandPalette.js  (Cmd/Ctrl+K fuzzy search for sections/actions) │
│  ├── navigation.js      (Minimal nav, circular clip-path drawer)       │
│  └── easterEggs.js      ("ROBO" parade, Konami code, 10s idle state)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✦ Experience Flow & Features

### 0. Folio 0: "Ignition" (Interactive Loader)
- Starts with pure black. Vitruvian geometry (circle, square, axis) animates in with hairline golden SVG `stroke-dashoffset`.
- **Hold-to-Channel Energy:** User presses and holds mouse/touch or Spacebar to channel Aether energy. Releasing causes gentle decay, while an auto-crawl guarantees progression.
- **Morphing 1600+ Particle Drone Swarm:** Morphs through 5 sampled silhouettes:
  1. *Vitruvian Gear* (Mechanical Transmission)
  2. *Articulated Robotic Arm* (Cybernetic Kinematics)
  3. *Synaptic Neural Network* (Deep Aether Cognition)
  4. *Autonomous Drone Swarm* (Light Flight Systems)
  5. *Techfest Wordmark* (IIT Bombay 30th Edition)
- **Live Counter Tickers:** Counts up to 30 Editions, 1,75,000+ Footfall, and 2,500+ Colleges.
- **Ignition Climax:** At 100%, triggers an explosive particle shockwave, harmonic celestial chime, and an SVG `feDisplacementMap` organic ink-dissolve transition into the Hero.
- A *"SKIP CODEX IGNITION [ESC]"* button is always available.

### 1. Folio I: "Awakening" (Hero)
- Fluid high-contrast serif headline *"An Aetherial Renaissance"* with per-character entry stagger.
- Generative 2D Canvas vector flow field with mouse vortex reactivity.
- Original **Vitruvian Machine** SVG line-art illustration with 2D mouse parallax and glowing limb reactions on hover.
- Live countdown to December 16, 2026, 09:00:00 IST (Days, Hours, Minutes, Seconds).
- Persistent minimal navbar with audio synthesizer toggle, `Cmd/Ctrl+K` button, and full-screen circular `clip-path` drawer.

### 2. Folio II: The Manifesto
- Pinned section where confident proclamation copy reveals word-by-word on scroll:
  > *"Since 1998, on the banks of Powai Lake, we forged Asia's greatest crucible of science and reason..."*
- Words shift from blur to gold and ivory ink.
- Drafted blueprint margin annotations with Powai coordinates (`LAT 19.1334° N, LONG 72.9133° E`).

### 3. Folio III: The Eight Pillars (Horizontal Folio Gallery)
- Pinned horizontal gallery spanning 8 full-screen folios:
  1. **Robowars:** Dual counter-spinning saw blades with sparks.
  2. **AI & Machine Learning:** Pulsing synaptic neural graph.
  3. **Aerospace & Drones:** Aerodynamic quadcopter airframe and vectors honoring Techfest's drone light shows.
  4. **Hackathons & Code:** Drafting terminal shell with typing code lines.
  5. **Lectures & Workshops:** Classical amphitheater rostrum with acoustic speech waves.
  6. **Exhibitions & Automation:** Leonardo biped automaton kinematics.
  7. **Fintech Summit:** Distributed ledger hash blocks and candlesticks.
  8. **Techfest MUN:** Armillary diplomatic globe armature.
- Navigable via horizontal mouse wheel, touch swipe, keyboard arrow keys, or bottom tick indicators.
- Inverting diagonal `clip-path` wipe on hover.

### 4. Folio IV: Robowars Arena (Interactive 2D Clash)
- Full-bleed ember combat ring (`#FF5A36`).
- Two 2D battle bots: *Cyber-Colossus* vs *Aether-Scythe*.
- User clicks "INITIATE CLASH" or presses Space:
  - Bots surge inward and collide.
  - Generates 75+ physical 2D spark particles with gravity and velocity bounce.
  - Container-level 2D screen shake (`translateX/translateY`).
  - Procedural metallic impact audio.
  - Floating damage numbers (`-24`) and real-time health bar HUD.
  - Knockout banner and instant match reload.

### 5. Folio V: Live Impact Numbers
- Metric counter cards (1,75,000+ Footfall, 2,500+ Indian Colleges, 500+ Universities, 30 Editions, ₹50,00,000+ Grants) easing smoothly on scroll.
- Canvas 2D dot-matrix subcontinental map where concentric golden/cyan wave rings propagate outward from Mumbai (Powai) coordinates every 2.4s. Click anywhere to emit custom waves!

### 6. Folio VI: Timeline — "Three Days, One Aether"
- Day 1 (Dec 16), Day 2 (Dec 17), and Day 3 (Dec 18) schedule feed with venue metadata and tags.
- Dynamic tab switching with smooth staggered card animations.
- **RFC 5545 `.ics` Calendar Generator:** Click *"ADD TO CALENDAR (.ICS)"* to download `Techfest_IIT_Bombay_2026.ics` directly to Google Calendar, Apple Calendar, or Outlook.

### 7. Folio VII: Initiatives (Catalyst, Ambassadors, Accommodation)
- 2D magnetic tilt cards with animated gradient borders and zero 3D transforms (pure `translate` + `skew`).
- Highlights Catalyst (National Leadership Summit & Pitch, ₹1,00,000 seed grant), College Ambassador program (2500+ campuses), and Powai campus residency.

### 8. Folio VIII: Sponsors & Patrons Dual Marquee
- Continuous infinite dual-direction marquee tracks (ISRO, TATA, NVIDIA, AIRBUS, DRDO, BOEING, etc.).
- Grayscale-to-gold/cyan transitions on hover with smooth pause-on-hover physics.

### 9. Folio IX: Footer — "Finis Coronat Opus"
- Monumental outlined `TECHFEST` wordmark that floods from 0% to 100% with shimmering gold as user scrolls into the footer.
- Official provenance, student gymkhana contact (`info@techfest.org`), social links, and an *"ASCEND CODEX [TOP]"* button that launches back up with an audio chime.

---

## ✦ Controls & Shortcuts

| Key / Action | Interaction |
| :--- | :--- |
| **Mouse Press & Hold / Space** | Channel Aether energy during the Folio 0 Ignition Loader |
| **Esc Key** | Skip intro loader immediately |
| **Cmd + K / Ctrl + K** | Open Command Palette with fuzzy search across sections and actions |
| **Arrow Right / Left** | Navigate between folios in the horizontal Pillars gallery |
| **Spacebar (in Arena)** | Trigger kinetic Robowars robot clash |
| **Type "ROBO"** | *Easter Egg:* Spawns a marching 5-robot parade across the bottom viewport |
| **Konami Code** (`↑ ↑ ↓ ↓ ← → ← → B A`) | *Easter Egg:* Triggers the celebratory 30th celestial drone formation and chime |
| **10s Inactivity** | Enters meditative codex ambient mode |

---

## ✦ Quickstart & Setup

### Requirements
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Installation & Local Development
```bash
# Clone or navigate to the project directory
cd web_task4

# Install dependencies (gsap, lenis, vite)
npm install

# Start local development server
npm run dev
# Server ready at http://localhost:5173/
```

### Production Build
```bash
# Build production bundle with optimized assets
npm run build

# Preview production build locally
npm run preview
```

---

## ✦ Deployment Configuration

### 1. Vercel
Configuration file [`vercel.json`](vercel.json) is included:
```bash
npx vercel deploy
```

### 2. GitHub Pages
A turnkey GitHub Actions workflow is provided at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Push to your `main` branch to automatically build and deploy.

---

## ✦ Credits
- **Client & Institution:** Techfest, Indian Institute of Technology Bombay (IIT Bombay), Powai, Mumbai.
- **Theme:** *An Aetherial Renaissance* (30th Edition Continuum).
- **Audio & Visual Craft:** Built with 100% pure 2D Canvas, Web Audio API, SVG filters, and Vanilla JavaScript.
