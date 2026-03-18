import { SPHSolver } from './solver.js';

let solver = null;
let intervalId = null;

self.onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'init') {
    try {
      solver = new SPHSolver(data.params);
      self.postMessage({ type: 'initDone' });
    } catch (error) {
      self.postMessage({ type: 'error', error: `Init-Fehler: ${error.message}` });
    }
  }

  if (type === 'addParticle' && solver) {
    solver.addParticle(data.pos, data.vel, data.color);
  }

  if (type === 'start' && solver) {
    const dt = data.dt || 0.016;
    if (intervalId) clearInterval(intervalId);
    
    intervalId = setInterval(() => {
      try {
        solver.update(dt);
        const particlesCopy = solver.particles.map(p => ({
          pos: [p.pos[0], p.pos[1]],
          vel: [p.vel[0], p.vel[1]],
          color: p.color,
          density: p.density
        }));
        self.postMessage({ type: 'update', data: particlesCopy });
      } catch (error) {
        self.postMessage({ type: 'error', error: `Update-Fehler: ${error.message}` });
      }
    }, dt * 1000);
  }

  if (type === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};