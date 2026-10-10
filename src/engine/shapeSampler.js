/**
 * SHAPE SAMPLER — PROCEDURAL 2D SILHOUETTE GENERATORS
 * Generates normalized 2D point clouds [-1..1] for the 1500+ particle drone swarm morphs.
 * Pure 2D math, zero 3D dependencies.
 */

export class ShapeSampler {
  /**
   * Sample points along a circle or arc
   */
  static sampleCircle(count, radius = 1, cx = 0, cy = 0) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
    return points;
  }

  /**
   * Sample points along a line segment
   */
  static sampleLine(count, x1, y1, x2, y2) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      points.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t
      });
    }
    return points;
  }

  /**
   * Shape 1: Renaissance Vitruvian Gear
   * Central hub, cogs, concentric rims, 4 mechanical spokes
   */
  static getGear(totalCount = 1600) {
    const points = [];
    const teeth = 12;
    const outerRimCount = Math.floor(totalCount * 0.45);
    const innerHubCount = Math.floor(totalCount * 0.25);
    const spokesCount = Math.floor(totalCount * 0.3);

    // Outer cogged rim
    for (let i = 0; i < outerRimCount; i++) {
      const angle = (i / outerRimCount) * Math.PI * 2;
      const cog = Math.sin(angle * teeth) > 0 ? 0.9 : 0.72;
      points.push({
        x: Math.cos(angle) * cog,
        y: Math.sin(angle) * cog
      });
    }

    // Inner hub & axle
    for (let i = 0; i < innerHubCount; i++) {
      const angle = (i / innerHubCount) * Math.PI * 2;
      const r = (i % 2 === 0) ? 0.32 : 0.16;
      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r
      });
    }

    // 4 mechanical spokes
    const spokePoints = Math.floor(spokesCount / 4);
    for (let s = 0; s < 4; s++) {
      const baseAngle = (s * Math.PI) / 2;
      for (let i = 0; i < spokePoints; i++) {
        const r = 0.25 + (i / spokePoints) * 0.47;
        points.push({
          x: Math.cos(baseAngle) * r,
          y: Math.sin(baseAngle) * r
        });
      }
    }

    while (points.length < totalCount) {
      points.push(points[Math.floor(Math.random() * points.length)]);
    }
    return points.slice(0, totalCount);
  }

  /**
   * Shape 2: Articulated Robotic Arm
   * Heavy foundation, hydraulic pivot, forearm, wrist & double gripper
   */
  static getRobotArm(totalCount = 1600) {
    const points = [];
    // Base platform
    const basePts = this.sampleLine(150, -0.65, 0.75, 0.65, 0.75);
    const pedPts = this.sampleLine(100, -0.4, 0.65, 0.4, 0.65);
    points.push(...basePts, ...pedPts);

    // Turret joint
    points.push(...this.sampleCircle(120, 0.16, -0.2, 0.5));

    // Lower boom arm
    points.push(...this.sampleLine(220, -0.2, 0.5, 0.1, 0.0));
    // Hydraulic cylinder
    points.push(...this.sampleLine(120, -0.1, 0.55, 0.15, 0.1));

    // Elbow joint
    points.push(...this.sampleCircle(120, 0.12, 0.1, 0.0));

    // Forearm extending upward-right
    points.push(...this.sampleLine(220, 0.1, 0.0, 0.45, -0.4));

    // Wrist joint
    points.push(...this.sampleCircle(80, 0.08, 0.45, -0.4));

    // Pincers / End-Effector Gripper
    points.push(...this.sampleLine(120, 0.45, -0.4, 0.65, -0.55));
    points.push(...this.sampleLine(120, 0.45, -0.4, 0.65, -0.3));
    points.push(...this.sampleLine(60, 0.65, -0.55, 0.68, -0.5));
    points.push(...this.sampleLine(60, 0.65, -0.3, 0.68, -0.35));

    while (points.length < totalCount) {
      points.push(points[Math.floor(Math.random() * points.length)]);
    }
    return points.slice(0, totalCount);
  }

  /**
   * Shape 3: Synaptic Neural Network
   * 4 Layered interconnected node clusters with axon synaptic pathways
   */
  static getNeuralNet(totalCount = 1600) {
    const points = [];
    const layers = [
      { x: -0.7, nodes: [-0.6, -0.2, 0.2, 0.6] },
      { x: -0.23, nodes: [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75] },
      { x: 0.23, nodes: [-0.65, -0.35, 0.0, 0.35, 0.65] },
      { x: 0.7, nodes: [-0.4, 0.0, 0.4] }
    ];

    // Sample node circles
    layers.forEach(l => {
      l.nodes.forEach(y => {
        points.push(...this.sampleCircle(32, 0.065, l.x, y));
      });
    });

    // Sample axons (connections between consecutive layers)
    for (let i = 0; i < layers.length - 1; i++) {
      const l1 = layers[i];
      const l2 = layers[i + 1];
      l1.nodes.forEach(y1 => {
        l2.nodes.forEach(y2 => {
          points.push(...this.sampleLine(14, l1.x, y1, l2.x, y2));
        });
      });
    }

    while (points.length < totalCount) {
      points.push(points[Math.floor(Math.random() * points.length)]);
    }
    return points.slice(0, totalCount);
  }

  /**
   * Shape 4: Aerospace Drone / Quadcopter Light Show
   * X-carbon frame, 4 high-speed spinning rotor rings, central camera/avionics
   */
  static getDrone(totalCount = 1600) {
    const points = [];
    // Central flight controller hub
    points.push(...this.sampleCircle(140, 0.22, 0, 0));
    points.push(...this.sampleLine(80, -0.15, 0, 0.15, 0));
    points.push(...this.sampleLine(80, 0, -0.15, 0, 0.15));

    // 4 cross arms
    points.push(...this.sampleLine(150, -0.15, -0.15, -0.55, -0.55));
    points.push(...this.sampleLine(150, 0.15, -0.15, 0.55, -0.55));
    points.push(...this.sampleLine(150, -0.15, 0.15, -0.55, 0.55));
    points.push(...this.sampleLine(150, 0.15, 0.15, 0.55, 0.55));

    // 4 rotor propeller circles
    const rotors = [
      { x: -0.55, y: -0.55 },
      { x: 0.55, y: -0.55 },
      { x: -0.55, y: 0.55 },
      { x: 0.55, y: 0.55 }
    ];

    rotors.forEach(r => {
      points.push(...this.sampleCircle(160, 0.22, r.x, r.y));
      // Rotor hub
      points.push(...this.sampleCircle(40, 0.06, r.x, r.y));
    });

    while (points.length < totalCount) {
      points.push(points[Math.floor(Math.random() * points.length)]);
    }
    return points.slice(0, totalCount);
  }

  /**
   * Shape 5: "TECHFEST" Illuminated Wordmark
   * Procedurally sampled typographic glyphs
   */
  static getTechfestWord(totalCount = 1600) {
    const points = [];
    // Letters T, E, C, H, F, E, S, T layout along horizontal axis
    const letters = [
      // T
      [[-0.85, -0.3, -0.67, -0.3], [-0.76, -0.3, -0.76, 0.3]],
      // E
      [[-0.63, -0.3, -0.63, 0.3], [-0.63, -0.3, -0.48, -0.3], [-0.63, 0, -0.52, 0], [-0.63, 0.3, -0.48, 0.3]],
      // C
      [[-0.32, -0.3, -0.44, -0.3], [-0.44, -0.3, -0.44, 0.3], [-0.44, 0.3, -0.32, 0.3]],
      // H
      [[-0.26, -0.3, -0.26, 0.3], [-0.26, 0, -0.12, 0], [-0.12, -0.3, -0.12, 0.3]],
      // F
      [[-0.05, -0.3, -0.05, 0.3], [-0.05, -0.3, 0.08, -0.3], [-0.05, 0, 0.05, 0]],
      // E
      [[0.14, -0.3, 0.14, 0.3], [0.14, -0.3, 0.27, -0.3], [0.14, 0, 0.24, 0], [0.14, 0.3, 0.27, 0.3]],
      // S
      [[0.46, -0.3, 0.33, -0.3], [0.33, -0.3, 0.33, 0], [0.33, 0, 0.46, 0], [0.46, 0, 0.46, 0.3], [0.46, 0.3, 0.33, 0.3]],
      // T
      [[0.52, -0.3, 0.72, -0.3], [0.62, -0.3, 0.62, 0.3]]
    ];

    letters.forEach(letter => {
      letter.forEach(segment => {
        const [x1, y1, x2, y2] = segment;
        points.push(...this.sampleLine(50, x1, y1, x2, y2));
      });
    });

    while (points.length < totalCount) {
      points.push(points[Math.floor(Math.random() * points.length)]);
    }
    return points.slice(0, totalCount);
  }

  /**
   * Shape 6: "30" Insignia for Konami Code Easter Egg
   */
  static getNumber30(totalCount = 1600) {
    const points = [];
    // Number 3
    const segs3 = [
      [-0.45, -0.5, -0.15, -0.5],
      [-0.15, -0.5, -0.15, 0],
      [-0.35, 0, -0.15, 0],
      [-0.15, 0, -0.15, 0.5],
      [-0.45, 0.5, -0.15, 0.5]
    ];
    segs3.forEach(s => points.push(...this.sampleLine(80, s[0], s[1], s[2], s[3])));

    // Number 0
    for (let i = 0; i < 400; i++) {
      const angle = (i / 400) * Math.PI * 2;
      points.push({
        x: 0.3 + Math.cos(angle) * 0.25,
        y: Math.sin(angle) * 0.5
      });
    }

    while (points.length < totalCount) {
      points.push(points[Math.floor(Math.random() * points.length)]);
    }
    return points.slice(0, totalCount);
  }
}
