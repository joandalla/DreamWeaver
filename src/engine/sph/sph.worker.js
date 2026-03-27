import { SPHSolver } from './solver.js';

let solver = null;
let animationId = null;
let width = 1024;
let height = 768;

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  if (type === 'init') {
    solver = new SPHSolver(data.params);
    width = data.width || 1024;
    height = data.height || 768;
  }
  
  if (type === 'addParticle') {
    solver.addParticle(data.pos, data.vel, data.color);
  }
  
  if (type === 'start') {
    const dt = data.dt || 0.016;
    function step() {
      if (!solver) return;
      solver.update(dt, width, height);
      self.postMessage({ type: 'update', particles: solver.particles });
      animationId = setTimeout(step, dt * 1000);
    }
    step();
  }
  
  if (type === 'stop') {
    if (animationId) {
      clearTimeout(animationId);
      animationId = null;
    }
  }
};