import { useCallback } from 'react';

export function useDreamWeaver() {
  const calculateViscosity = (shearRate, baseViscosity = 1.0) => {
    const n = 0.6;
    return baseViscosity * Math.pow(shearRate, n - 1);
  };

  const simulateParticle = (x, y, vx, vy, color) => {
    const particles = [];
    const numParticles = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3;
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: vx + Math.cos(angle) * speed,
        vy: vy + Math.sin(angle) * speed + 2,
        color: color,
        life: 1.0
      });
    }
    return particles;
  };

  const generateFromRules = useCallback((rules, width, height) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // SCHICHT 1: Hintergrund
      ctx.fillStyle = rules.backgroundColor || '#f5f0e6';
      ctx.fillRect(0, 0, width, height);
      
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(100, 80, 60, ${Math.random() * 0.2})`;
        ctx.fillRect(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2,
          Math.random() * 10
        );
      }

      // SCHICHT 2: Unregelmäßige Formen
      ctx.globalAlpha = 0.4;
      const { colors, density, chaos } = rules;
      
      for (let i = 0; i < density * 0.3; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        
        ctx.beginPath();
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;
        const points = 5 + Math.floor(Math.random() * 8);
        
        for (let p = 0; p < points; p++) {
          const angle = (p / points) * Math.PI * 2;
          const radius = 30 + Math.random() * 70 * (chaos / 50);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // SCHICHT 3: Drips mit Coiling-Effekt
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = rules.dripLength / 10 + 2;
      
      for (let i = 0; i < density * 2; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.strokeStyle = color;
        
        let x = Math.random() * width;
        let y = 0;
        let vx = (Math.random() - 0.5) * 3;
        let vy = 1;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        for (let step = 0; step < 100; step++) {
          vx += Math.sin(step * 0.2) * (chaos / 50);
          vy += 0.2;
          
          const speed = Math.sqrt(vx*vx + vy*vy);
          const viscosity = calculateViscosity(speed);
          vx /= viscosity;
          
          x += vx;
          y += vy * 2;
          
          if (x < 0 || x > width || y > height) break;
          
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        if (y < height) {
          simulateParticle(x, y, vx, vy, color).forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life * 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      // SCHICHT 4: Spritzer
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < density * 10; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 1 + Math.random() * 5 * (chaos / 30);
        
        if (radius > 3) {
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(
              x + (Math.random() - 0.5) * 10,
              y + (Math.random() - 0.5) * 10,
              radius * 0.3,
              0, Math.PI * 2
            );
            ctx.fill();
          }
        }
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      return canvas.toDataURL();
    } catch (error) {
      console.error('Fehler:', error);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffdddd';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#990000';
      ctx.font = '20px Arial';
      ctx.fillText('Fehler', 10, 50);
      return canvas.toDataURL();
    }
  }, []);

  const generateRandomRules = useCallback(() => {
    const pollockColors = [
      '#2C2C2C', '#4A4A4A', '#8B7E6B', '#A67B5B',
      '#6A8E7C', '#C0A080', '#3A5F6E', '#8B5A2B',
    ];
    
    const count = Math.floor(Math.random() * 4) + 3;
    const selectedColors = [];
    for (let i = 0; i < count; i++) {
      selectedColors.push(pollockColors[Math.floor(Math.random() * pollockColors.length)]);
    }
    
    return {
      colors: selectedColors,
      backgroundColor: '#F5F0E6',
      density: Math.floor(Math.random() * 60) + 40,
      dripLength: Math.floor(Math.random() * 60) + 40,
      chaos: Math.floor(Math.random() * 60) + 40
    };
  }, []);

  return { generateFromRules, generateRandomRules };
}