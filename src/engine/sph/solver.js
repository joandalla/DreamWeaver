export class SPHSolver {
  constructor(params = {}) {
    this.particles = [];
    this.params = {
      gravity: params.gravity || 9.81,
      restDensity: params.restDensity || 1000,
      gasConstant: params.gasConstant || 2000,
      viscosity: params.viscosity || 0.1,
      particleMass: params.particleMass || 1,
      smoothingRadius: params.smoothingRadius || 20,
      ...params
    };
    this.time = 0;
  }

  // Vektor-Hilfsfunktionen
  vecAdd(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
  }

  vecSub(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
  }

  vecScale(v, s) {
    return [v[0] * s, v[1] * s];
  }

  vecDiv(v, s) {
    return [v[0] / s, v[1] / s];
  }

  vecLength(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  vecDistance(v1, v2) {
    const dx = v1[0] - v2[0];
    const dy = v1[1] - v2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Poly6 Kernel
  poly6(r, h) {
    if (r > h) return 0;
    const factor = 315 / (64 * Math.PI * Math.pow(h, 9));
    return factor * Math.pow(h * h - r * r, 3);
  }

  // Spiky Kernel Gradient
  spikyGrad(r, h) {
    if (r > h) return 0;
    const factor = -45 / (Math.PI * Math.pow(h, 6));
    return factor * Math.pow(h - r, 2);
  }

  // Dichte für alle Partikel berechnen
  computeDensity() {
    for (let i = 0; i < this.particles.length; i++) {
      let density = 0;
      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) continue;
        const dist = this.vecDistance(this.particles[i].pos, this.particles[j].pos);
        density += this.params.particleMass * this.poly6(dist, this.params.smoothingRadius);
      }
      this.particles[i].density = Math.max(density, 0.001);
    }
  }

  // Kräfte berechnen und Integration
  computeForces(dt) {
    for (let i = 0; i < this.particles.length; i++) {
      const pi = this.particles[i];
      const pressure_i = this.params.gasConstant * (pi.density - this.params.restDensity);
      let force = [0, 0];

      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) continue;
        const pj = this.particles[j];
        const distVec = this.vecSub(pj.pos, pi.pos);
        const dist = this.vecLength(distVec);
        if (dist === 0) continue;

        const pressure_j = this.params.gasConstant * (pj.density - this.params.restDensity);
        const avgPressure = (pressure_i + pressure_j) / 2;
        const gradW = this.spikyGrad(dist, this.params.smoothingRadius);

        // Druckkraft
        const dir = this.vecDiv(distVec, dist);
        const pressureForce = this.vecScale(dir, gradW * avgPressure / pj.density);
        force = this.vecAdd(force, pressureForce);

        // Viskositätskraft
        const velDiff = this.vecSub(pj.vel, pi.vel);
        const viscForce = this.vecScale(
          velDiff,
          this.params.viscosity / pj.density * this.poly6(dist, this.params.smoothingRadius)
        );
        force = this.vecAdd(force, viscForce);
      }

      // Gravitation
      force[1] -= this.params.gravity;

      // Integration (Euler)
      const acceleration = this.vecDiv(force, pi.density);
      pi.vel = this.vecAdd(pi.vel, this.vecScale(acceleration, dt));
      pi.pos = this.vecAdd(pi.pos, this.vecScale(pi.vel, dt));
    }
  }

  // Kollision mit Wänden
  handleBoundaries() {
    const width = 600;
    const height = 400;
    for (let p of this.particles) {
      if (p.pos[0] < 0) { p.pos[0] = 0; p.vel[0] *= -0.3; }
      if (p.pos[0] > width) { p.pos[0] = width; p.vel[0] *= -0.3; }
      if (p.pos[1] < 0) { p.pos[1] = 0; p.vel[1] *= -0.3; }
      if (p.pos[1] > height) { p.pos[1] = height; p.vel[1] *= -0.3; }
    }
  }

  // Haupt-Update-Funktion
  update(dt) {
    this.computeDensity();
    this.computeForces(dt);
    this.handleBoundaries();
    this.time += dt;
  }

  addParticle(pos, vel, color) {
    this.particles.push({
      pos: pos,
      vel: vel,
      color: color,
      density: 0
    });
  }
}