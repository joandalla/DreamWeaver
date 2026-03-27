import { useCallback } from 'react';

export function useDreamWeaver() {
  // Nicht-newtonsche Viskosität
  const calculateViscosity = (shearRate, baseViscosity = 1.0, nonNewtonian = 0.7) => {
    const n = 0.6 - nonNewtonian * 0.3; // 0.3–0.6
    return baseViscosity * Math.pow(shearRate, n - 1);
  };

  // SPH‑ähnliche Sekundärpartikel (Spritzer)
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
        life: 1.0,
      });
    }
    return particles;
  };

  // Hauptgenerierung (vier Schichten)
  const generateFromRules = useCallback((rules, width, height) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // === SCHICHT 1: HINTERGRUND ===
      // Hintergrundfarbe (abhängig von backgroundBrightness)
      const bgLight = rules.backgroundBrightness !== undefined ? rules.backgroundBrightness : 0.85;
      ctx.fillStyle = `hsl(40, 10%, ${bgLight * 100}%)`; // cremiger Farbton
      ctx.fillRect(0, 0, width, height);

      // Leinwandstruktur (Fasern)
      ctx.globalAlpha = 0.1 * (rules.backgroundTexture / 50);
      for (let i = 0; i < (rules.backgroundTexture || 30) * 5; i++) {
        ctx.fillStyle = `rgba(100, 80, 60, ${Math.random() * 0.2})`;
        ctx.fillRect(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2,
          Math.random() * 10
        );
      }

      // === SCHICHT 2: UNREGELMÄSSIGE FORMEN ===
      ctx.globalAlpha = 0.4 * (rules.layerBlending / 50);
      const { colors, density, chaos, fractalDepth, shapeMix } = rules;

      for (let i = 0; i < density * 0.3; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;

        ctx.beginPath();
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;
        const points = 5 + Math.floor(Math.random() * 8);

        for (let p = 0; p < points; p++) {
          const angle = (p / points) * Math.PI * 2;
          // Formenmix: je höher shapeMix, desto unregelmäßiger
          const radius = 30 + Math.random() * 70 * (chaos / 50) * (0.5 + shapeMix);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // === SCHICHT 3: DRIPS MIT COILING-EFFEKT & SPLIT ===
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = (rules.dripLength / 10 + 2) * (rules.thickness / 50);

      for (let i = 0; i < density * 2; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.strokeStyle = color;

        let x = Math.random() * width;
        let y = 0;
        let vx = (Math.random() - 0.5) * 3 * (rules.chaos / 50);
        let vy = 1;

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let step = 0; step < 100; step++) {
          // Coiling
          const coiling = rules.coilingFrequency / 50;
          vx += Math.sin(step * 0.2 * coiling) * (rules.chaos / 50);
          vy += rules.gravity * 0.2;

          const speed = Math.sqrt(vx * vx + vy * vy);
          const viscosity = calculateViscosity(speed, 1.0, rules.nonNewtonianFactor);
          vx /= viscosity;
          vy /= viscosity;

          x += vx;
          y += vy * 2;

          // Split (neuer Parameter)
          if (rules.splitFactor && Math.random() < rules.splitFactor / 100 && step > 20) {
            // Zweig startet an dieser Stelle
            let x2 = x;
            let y2 = y;
            let vx2 = vx + (Math.random() - 0.5) * 2;
            let vy2 = vy;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            for (let s = 0; s < 30; s++) {
              vy2 += rules.gravity * 0.2;
              x2 += vx2;
              y2 += vy2;
              if (y2 > height) break;
              ctx.lineTo(x2, y2);
            }
            ctx.stroke();
          }

          if (x < 0 || x > width || y > height) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Tropfen am Ende
        if (y < height && Math.random() < rules.splatterIntensity / 100) {
          simulateParticle(x, y, vx, vy, color).forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life * 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      // === SCHICHT 4: SPRITZER (fraktal) ===
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < density * 10; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;

        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 1 + Math.random() * 5 * (rules.chaos / 30);

        // Fraktale Selbstähnlichkeit
        if (radius > 3 && Math.random() < (rules.fractalDepth / 100)) {
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(
              x + (Math.random() - 0.5) * 10,
              y + (Math.random() - 0.5) * 10,
              radius * 0.3,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Zusätzliche Skeins (feine Fäden)
      if (rules.skeinDensity > 0) {
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1.5;
        const skeinCount = Math.floor(rules.skeinDensity * 2);
        for (let i = 0; i < skeinCount; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          ctx.strokeStyle = color;
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          let x = startX, y = startY;
          let vx = (Math.random() - 0.5) * 2;
          let vy = (Math.random() - 0.5) * 2;
          for (let step = 0; step < 50; step++) {
            vx += (Math.random() - 0.5) * 0.3;
            vy += (Math.random() - 0.5) * 0.3;
            x += vx;
            y += vy;
            if (x < 0 || x > width || y < 0 || y > height) break;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // Nachbearbeitung: Weiche Überlagerung (Nass‑in‑Nass)
      ctx.globalAlpha = 0.1 * (rules.layerBlending / 50);
      ctx.fillStyle = 'rgba(255, 240, 255, 0.2)';
      ctx.fillRect(0, 0, width, height);

      return canvas.toDataURL();
    } catch (error) {
      console.error('Fehler in generateFromRules:', error);
      // Fallback
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

  // Zufällige Regeln (wissenschaftlich fundierte Pollock-Palette)
  const generateRandomRules = useCallback(() => {
    const pollockColors = [
      '#2C2C2C', '#4A4A4A', '#8B7E6B', '#A67B5B', '#6A8E7C', '#C0A080', '#3A5F6E', '#8B5A2B',
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
      chaos: Math.floor(Math.random() * 60) + 40,
      thickness: Math.floor(Math.random() * 60) + 40,
      gravity: 0.2 + Math.random() * 0.6,
      nonNewtonianFactor: 0.3 + Math.random() * 0.7,
      coilingFrequency: Math.floor(Math.random() * 100),
      splatterIntensity: Math.floor(Math.random() * 100),
      fractalDepth: Math.floor(Math.random() * 100),
      skeinDensity: Math.floor(Math.random() * 100),
      layerBlending: Math.floor(Math.random() * 100),
      backgroundTexture: Math.floor(Math.random() * 100),
      // Neue Parameter
      splitFactor: Math.floor(Math.random() * 50),
      backgroundBrightness: 0.6 + Math.random() * 0.4,
      shapeMix: Math.random(),
    };
  }, []);

  return { generateFromRules, generateRandomRules };
}