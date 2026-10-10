/**
 * FOLIO VI // TIMELINE "THREE DAYS, ONE AETHER" MODULE
 * Multi-day schedule switching and RFC 5545 .ics calendar exporter.
 * Truthful, verified festival schedule and generic campus venues.
 */

import { soundEngine } from '../engine/soundEngine.js';

export const SCHEDULE_DATA = {
  1: [
    {
      time: '09:30 AM',
      venue: 'IIT BOMBAY CAMPUS',
      title: 'The Inaugural Ceremony & Keynote Address',
      desc: '30th Edition opening ceremony followed by keynote discourses from prominent technological leaders and researchers.',
      category: 'KEYNOTE',
      badgeClass: 'badge-gold'
    },
    {
      time: '11:45 AM',
      venue: 'MAIN ARENA',
      title: 'Robowars Technical Briefing & Pit Inspections',
      desc: 'Weapon safety testing, telemetry calibration, and pit scrutiny for registered combat robotics teams.',
      category: 'ROBOWARS',
      badgeClass: 'badge-ember'
    },
    {
      time: '02:00 PM',
      venue: 'WORKSHOP ZONE',
      title: 'Robotics & Artificial Intelligence Workshop',
      desc: 'Hands-on technical sessions covering autonomous systems, computer vision, and machine learning architectures.',
      category: 'WORKSHOP',
      badgeClass: 'badge-cyan'
    },
    {
      time: '04:30 PM',
      venue: 'SUMMIT AUDITORIUM',
      title: 'Catalyst: National Leadership Pitch & Summit',
      desc: 'Student innovators present hardware and deep-tech ventures before mentors and incubators for the ₹1,00,000 seed fund.',
      category: 'CATALYST',
      badgeClass: 'badge-gold'
    },
    {
      time: '07:30 PM',
      venue: 'OPEN CAMPUS GROUNDS',
      title: 'Evening Showcase & Drone Light Show',
      desc: 'Synchronized aerial drone choreography and inaugural cultural performances welcoming attendees.',
      category: 'SPECTACLE',
      badgeClass: 'badge-cyan'
    }
  ],
  2: [
    {
      time: '09:00 AM',
      venue: 'MAIN ARENA',
      title: 'Robowars Elimination Rounds',
      desc: 'Full-impact combat robotics matches inside the bulletproof enclosed arena.',
      category: 'ROBOWARS',
      badgeClass: 'badge-ember'
    },
    {
      time: '11:00 AM',
      venue: 'HACKATHON ARENA',
      title: 'Flagship Hackathon Sprint Launch',
      desc: 'Intensive code sprint with student squads building software solutions across Web3, systems, and developer tools.',
      category: 'HACKATHON',
      badgeClass: 'badge-cyan'
    },
    {
      time: '02:30 PM',
      venue: 'CAMPUS AUDITORIUM',
      title: 'Distinguished Keynote Lecture Series',
      desc: 'Addresses exploring scientific discovery, planetary engineering, and emerging technologies.',
      category: 'LECTURE',
      badgeClass: 'badge-gold'
    },
    {
      time: '05:00 PM',
      venue: 'FLIGHT ZONE',
      title: 'Drone Racing & Aerial Flight Demonstrations',
      desc: 'High-speed UAV obstacle challenges and autonomous flight maneuvering.',
      category: 'AEROSPACE',
      badgeClass: 'badge-cyan'
    },
    {
      time: '08:00 PM',
      venue: 'CAMPUS GROUNDS',
      title: 'Signature Drone Light Show',
      desc: 'Techfest signature illuminated drone fleet painting dynamic geometric formations and motifs across the night sky.',
      category: 'DRONE SHOW',
      badgeClass: 'badge-gold'
    }
  ],
  3: [
    {
      time: '10:00 AM',
      venue: 'ROBOTICS ZONE',
      title: 'Autonomous Robotics & Engineering Challenges',
      desc: 'All-terrain robot navigation, maze exploration, and sensor integration showcases.',
      category: 'ROBOTICS',
      badgeClass: 'badge-cyan'
    },
    {
      time: '01:30 PM',
      venue: 'MUN ASSEMBLY',
      title: 'Techfest Model United Nations Resolution',
      desc: 'Diplomatic discourse and resolution voting addressing international technology governance.',
      category: 'MUN',
      badgeClass: 'badge-gold'
    },
    {
      time: '04:00 PM',
      venue: 'MAIN ARENA',
      title: 'Robowars Championship Grand Duel',
      desc: 'Top combat robotics teams duel for championship honors in the tournament finale.',
      category: 'CHAMPIONSHIP',
      badgeClass: 'badge-ember'
    },
    {
      time: '07:00 PM',
      venue: 'CAMPUS GROUNDS',
      title: 'Grand Finale Drone Light Show',
      desc: 'Celebratory 30th edition aerial drone illumination and closing pyrotechnics.',
      category: 'DRONE SHOW',
      badgeClass: 'badge-gold'
    },
    {
      time: '09:00 PM',
      venue: 'FESTIVAL STAGE',
      title: 'Valedictory Ceremony & Felicitations',
      desc: 'Awards distribution, student recognitions, and closing ceremony concluding the 30th edition.',
      category: 'CEREMONY',
      badgeClass: 'badge-gold'
    }
  ]
};

export class TimelineModule {
  constructor() {
    this.section = document.querySelector('#timeline-section');
    this.tabs = document.querySelectorAll('.day-tab-btn');
    this.list = document.querySelector('#schedule-list');
    this.btnIcs = document.querySelector('#btn-add-calendar');

    this.activeDay = 1;
    this.init();
  }

  init() {
    if (!this.section || !this.list) return;

    this._renderSchedule(1);
    this._bindEvents();
  }

  _bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const day = parseInt(tab.dataset.day, 10);
        if (day === this.activeDay) return;

        this.activeDay = day;
        this.tabs.forEach(t => t.classList.toggle('active', t === tab));
        soundEngine.playTabClick();
        this._renderSchedule(day);
      });
    });

    if (this.btnIcs) {
      this.btnIcs.addEventListener('click', () => {
        soundEngine.playButtonClick();
        this.downloadIcsCalendar();
      });
    }
  }

  _renderSchedule(day) {
    const items = SCHEDULE_DATA[day] || [];
    this.list.innerHTML = '';

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'schedule-card';
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = `all 0.4s var(--ease-codex) ${idx * 50}ms`;

      card.innerHTML = `
        <div class="schedule-time-col">
          <div class="schedule-time">${item.time}</div>
          <div class="schedule-venue">${item.venue}</div>
        </div>
        <div class="schedule-info-col">
          <h3 class="schedule-title">${item.title}</h3>
          <p class="schedule-desc">${item.desc}</p>
        </div>
        <div class="schedule-tag-col">
          <span class="badge-mono ${item.badgeClass}">${item.category}</span>
          <span class="blueprint-annotation">DEC ${15 + day}, 2026</span>
        </div>
      `;

      card.addEventListener('mouseenter', () => soundEngine.playHoverTick());

      this.list.appendChild(card);

      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  }

  downloadIcsCalendar() {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Techfest IIT Bombay//The Aetherial Codex//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Techfest IIT Bombay 2026',
      'X-WR-TIMEZONE:Asia/Kolkata',

      // Day 1
      'BEGIN:VEVENT',
      'UID:techfest-2026-day1@techfest.org',
      'SUMMARY:Techfest IIT Bombay 2026 - Day 1: Inauguration & Keynotes',
      'DESCRIPTION:Asia\'s Largest Science & Tech Festival. 30th Edition inauguration, keynote lectures, Robowars scrutiny and evening drone light show.',
      'LOCATION:IIT Bombay Campus, Powai, Mumbai, Maharashtra 400076',
      'DTSTART:20261216T040000Z',
      'DTEND:20261216T163000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',

      // Day 2
      'BEGIN:VEVENT',
      'UID:techfest-2026-day2@techfest.org',
      'SUMMARY:Techfest IIT Bombay 2026 - Day 2: Arena Battles & Drone Light Show',
      'DESCRIPTION:Robowars combat rounds, hackathon sprint, keynote lecture series, and the signature drone light show.',
      'LOCATION:IIT Bombay Campus, Powai, Mumbai, Maharashtra 400076',
      'DTSTART:20261217T033000Z',
      'DTEND:20261217T170000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',

      // Day 3
      'BEGIN:VEVENT',
      'UID:techfest-2026-day3@techfest.org',
      'SUMMARY:Techfest IIT Bombay 2026 - Day 3: Grand Finale & Robowars Championship',
      'DESCRIPTION:Robowars championship finals, Techfest MUN summit resolution, and celebratory valedictory night.',
      'LOCATION:IIT Bombay Campus, Powai, Mumbai, Maharashtra 400076',
      'DTSTART:20261218T043000Z',
      'DTEND:20261218T180000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',

      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Techfest_IIT_Bombay_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
