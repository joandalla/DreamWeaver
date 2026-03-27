import * as math from 'mathjs';

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

  computeDensity() {
    for (let i = 0; i < this.particles.length; i++) {
      let density = 0;
      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) continue;
        const dist = math.distance(this.particles[i].pos, this.particles[j].pos);
        density += this.params.particleMass * this.poly6(dist, this.params.smoothingRadius);
      }
      this.particles[i].density = Math.max(density, 0.001);
    }
  }

  computeForces(dt) {
    for (let i = 0; i < this.particles.length; i++) {
      const pi = this.particles[i];
      const pressure_i = this.params.gasConstant * (pi.density - this.params.restDensity);
      let force = [0, 0];

      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) continue;
        const pj = this.particles[j];
        const distVec = math.subtract(pj.pos, pi.pos);
        const dist = math.norm(distVec);
        if (dist === 0) continue;

        const pressure_j = this.params.gasConstant * (pj.density - this.params.restDensity);
        const avgPressure = (pressure_i + pressure_j) / 2;
        const gradW = this.spikyGrad(dist, this.params.smoothingRadius);

        // Druckkraft
        const dir = math.divide(distVec, dist);
        const pressureForce = math.multiply(gradW * avgPressure / pj.density, dir);
        force = math.add(force, pressureForce);

        // Viskositätskraft
        const viscForce = math.multiply(
          this.params.viscosity * math.subtract(pj.vel, pi.vel) / pj.density,
          this.poly6(dist, this.params.smoothingRadius)
        );
        force = math.add(force, viscForce);
      }

      // Gravitation
      force[1] -= this.params.gravity;

      // Integration (Euler)
      const acceleration = math.divide(force, pi.density);
      pi.vel = math.add(pi.vel, math.multiply(acceleration, dt));
      pi.pos = math.add(pi.pos, math.multiply(pi.vel, dt));
    }
  }

  handleBoundaries(width, height) {
    for (let p of this.particles) {
      if (p.pos[0] < 0) { p.pos[0] = 0; p.vel[0] *= -0.3; }
      if (p.pos[0] > width) { p.pos[0] = width; p.vel[0] *= -0.3; }
      if (p.pos[1] < 0) { p.pos[1] = 0; p.vel[1] *= -0.3; }
      if (p.pos[1] > height) { p.pos[1] = height; p.vel[1] *= -0.3; }
    }
  }

  update(dt, width, height) {
    this.computeDensity();
    this.computeForces(dt);
    this.handleBoundaries(width, height);
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