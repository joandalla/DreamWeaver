import { useCallback } from 'react';

export function useDreamWeaver() {
  // Hilfsfunktion für sanfte Farbvariation (HSV)
  const varyColor = (hex, amount = 0.2) => {
    // Nur eine einfache Helligkeitsvariation – für Spritzer reicht das
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    const factor = 1 + (Math.random() - 0.5) * amount;
    const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // Nicht-newtonsche Viskosität
  const calculateViscosity = (shearRate, baseViscosity = 1.0, nonNewtonian = 0.7) => {
    const n = 0.6 - nonNewtonian * 0.3; // 0.3–0.6
    return baseViscosity * Math.pow(shearRate, n - 1);
  };

  // SPH‑ähnliche Sekundärpartikel (Spritzer mit Farbvariation)
  const simulateParticle = (x, y, vx, vy, color, colorVariation = 0.2) => {
    const particles = [];
    const numParticles = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3;
      const variedColor = varyColor(color, colorVariation);
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: vx + Math.cos(angle) * speed,
        vy: vy + Math.sin(angle) * speed + 2,
        color: variedColor,
        life: 1.0,
      });
    }
    return particles;
  };

  // Weicher, unregelmäßiger Klecks (für Schicht 2 – organische Formen)
  const drawSoftSplat = useCallback((ctx, x, y, color, baseSize, softness = 0.3) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = baseSize * 0.3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    const layers = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < layers; i++) {
      const offsetX = (Math.random() - 0.5) * baseSize * softness;
      const offsetY = (Math.random() - 0.5) * baseSize * softness;
      const size = baseSize * (0.6 + Math.random() * 0.6);
      const alpha = 0.3 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    // Zentraler Kern
    ctx.beginPath();
    ctx.arc(x, y, baseSize * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.restore();
  }, []);

  // Verbesserte Drip‑Funktion mit neuen Effekten
  const simulateGravityDrip = useCallback((ctx, startX, startY, color, params, existingBlobs = []) => {
    const { 
      gravity, chaos, thickness, nonNewtonianFactor, coilingFrequency,
      splatterIntensity, fractalDepth, layerBlending, dripLength
    } = params;
    
    let x = startX;
    let y = startY;
    let vx = (Math.random() - 0.5) * chaos * 0.3;
    let vy = 0.5 + Math.random() * 4;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const baseWidth = (thickness / 8) * (0.7 + Math.random() * 0.8);
    
    for (let step = 0; step < dripLength * 1.5; step++) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      
      // 1. Nicht-newtonsche Viskosität
      const n = 0.4 - nonNewtonianFactor * 0.3;
      const thinningFactor = Math.pow(Math.max(speed, 0.1), n - 1);
      
      // 2. Physikalisches Coiling (abhängig von Viskosität und Geschwindigkeit)
      const coilingBase = (coilingFrequency / 100) * (gravity / 0.5);
      const coilingOmega = Math.sqrt(gravity / (thinningFactor + 0.1)) * 5;
      const coilAmplitude = speed * 0.1 * coilingBase;
      vx += Math.sin(step * coilingOmega) * coilAmplitude;
      
      // Gravitation & Chaos
      vy += gravity * thinningFactor;
      vx += (Math.random() - 0.5) * chaos * 0.15 * thinningFactor;
      
      x += vx;
      y += vy * thinningFactor;
      
      // 3. Dynamische Linienstärke (geschwindigkeits‑ & positionsabhängig)
      let widthFactor = 1.0;
      if (speed < 0.8) widthFactor = 3.5 + Math.random() * 1.5;
      else if (speed < 1.5) widthFactor = 2.0 + Math.random() * 1.0;
      else if (speed > 4) widthFactor = 0.4 + Math.random() * 0.3;
      
      // 4. Interaktion mit Klecksen (Nass‑in‑Nass)
      existingBlobs.forEach(blob => {
        const dx = x - blob.x;
        const dy = y - blob.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < blob.size * 2) {
          // Linie wird dicker in der Nähe von Farbe
          widthFactor *= 1.5;
          // Farbmischung lokal
          if (layerBlending > 30) {
            // Einfache Mischung: 70% eigene Farbe, 30% Klecksfarbe
            ctx.strokeStyle = blendColors(ctx.strokeStyle, blob.color, 0.3);
          }
        }
      });
      
      // Plötzliche Verdickungen (Zögern)
      if (Math.random() < 0.03 * (chaos / 50)) {
        widthFactor *= 2.5;
        if (Math.random() < splatterIntensity / 100) {
          drawSoftSplat(ctx, x, y, color, baseWidth * 1.2, 0.5);
        }
      }
      
      ctx.lineWidth = Math.max(0.8, baseWidth * widthFactor * thinningFactor);
      
      // Fraktale Mikro‑Spritzer
      if (Math.random() < fractalDepth / 100 && step % 10 === 0) {
        for (let m = 0; m < 2; m++) {
          const microX = x + (Math.random() - 0.5) * 12;
          const microY = y + (Math.random() - 0.5) * 12;
          drawSoftSplat(ctx, microX, microY, color, baseWidth * 0.3, 0.4);
        }
      }
      
      // Begrenzung und Aufprall
      if (x < 0) { x = 5; vx *= -0.2; }
      if (x > 1024) { x = 1019; vx *= -0.2; }
      if (y > 768) {
        const splashCount = Math.floor(splatterIntensity / 20) + 2;
        for (let i = 0; i < splashCount; i++) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + (Math.random() - 0.5) * 30, 768 - Math.random() * 10);
        }
        drawSoftSplat(ctx, x, 768 - 8, color, baseWidth * (2 + splatterIntensity / 50), 0.6);
        break;
      }
      
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [drawSoftSplat]);

  // Hilfsfunktion für Farbmischung
  const blendColors = (c1, c2, ratio) => {
    // Vereinfachte Hex-Mischung
    const hex1 = c1.startsWith('#') ? c1 : `#${c1}`;
    const hex2 = c2.startsWith('#') ? c2 : `#${c2}`;
    const r1 = parseInt(hex1.slice(1,3), 16);
    const g1 = parseInt(hex1.slice(3,5), 16);
    const b1 = parseInt(hex1.slice(5,7), 16);
    const r2 = parseInt(hex2.slice(1,3), 16);
    const g2 = parseInt(hex2.slice(3,5), 16);
    const b2 = parseInt(hex2.slice(5,7), 16);
    const r = Math.floor(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.floor(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.floor(b1 * (1 - ratio) + b2 * ratio);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Hauptgenerierung (vier Schichten)
  const generateFromRules = useCallback((rules, width, height) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // === SCHICHT 1: HINTERGRUND (mit weicher Punktstruktur) ===
      const bgLight = rules.backgroundBrightness !== undefined ? rules.backgroundBrightness : 0.85;
      ctx.fillStyle = `hsl(40, 10%, ${bgLight * 100}%)`;
      ctx.fillRect(0, 0, width, height);

      // Weiche Hintergrundtextur (Punkte statt Rechtecke)
      if (rules.backgroundTexture > 0) {
        ctx.globalAlpha = 0.1 * (rules.backgroundTexture / 50);
        for (let i = 0; i < rules.backgroundTexture * 8; i++) {
          ctx.fillStyle = `rgba(80, 60, 40, ${Math.random() * 0.15})`;
          ctx.beginPath();
          ctx.arc(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // === SCHICHT 2: UNREGELMÄSSIGE FORMEN (weiche Kanten) ===
      ctx.globalAlpha = 0.4 * (rules.layerBlending / 50);
      const { colors, density, chaos, fractalDepth, shapeMix } = rules;

      for (let i = 0; i < density * 0.3; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;
        const points = 5 + Math.floor(Math.random() * 8);
        const softness = 0.2 + Math.random() * 0.5;
        const sizeBase = 30 + Math.random() * 70 * (chaos / 50) * (0.5 + shapeMix);
        
        // Weiche Form durch viele kleine Kreise (gibt weichen Rand)
        for (let k = 0; k < 10; k++) {
          const angleOffset = (k / 10) * Math.PI * 2;
          const radius = sizeBase * (0.8 + Math.random() * 0.4);
          const xOff = Math.cos(angleOffset) * radius * (Math.random() * 0.5);
          const yOff = Math.sin(angleOffset) * radius * (Math.random() * 0.5);
          drawSoftSplat(ctx, centerX + xOff, centerY + yOff, color, sizeBase * 0.4, softness);
        }
      }

      // === SCHICHT 3: DRIPS & LINIEN ===
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = (rules.dripLength / 10 + 2) * (rules.thickness / 50);
      
      colors.forEach((color) => {
        const drips = Math.floor(density / colors.length) + 5;
        for (let i = 0; i < drips; i++) {
          const startType = Math.random();
          let startX, startY;
          if (startType < 0.6) {
            startX = Math.random() * width;
            startY = 5 + Math.random() * 80;
          } else if (startType < 0.8) {
            startX = 5;
            startY = Math.random() * (height - 100);
          } else {
            startX = width - 5;
            startY = Math.random() * (height - 100);
          }
          // Erstelle ein Array von Blobs (hier nur für Interaktion)
          const dummyBlobs = [];
          simulateGravityDrip(ctx, startX, startY, color, rules, dummyBlobs);
        }
      });

      // === SCHICHT 4: SPRITZER (mit Farbvariation) ===
      ctx.globalAlpha = 0.5;
      const spatterCount = Math.floor(density * 3 * (rules.splatterIntensity / 50));
      for (let i = 0; i < spatterCount; i++) {
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        const variedColor = varyColor(baseColor, 0.3);
        ctx.fillStyle = variedColor;
        const clusterX = Math.random() * width;
        const clusterY = Math.random() * height;
        for (let j = 0; j < 5; j++) {
          ctx.beginPath();
          ctx.arc(
            clusterX + (Math.random() - 0.5) * 30,
            clusterY + (Math.random() - 0.5) * 30,
            1 + Math.random() * 4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // === ZUSÄTZLICH: Skeins mit leichter Gravitation ===
      if (rules.skeinDensity > 0) {
        ctx.globalAlpha = 0.6;
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
          let vx = (Math.random() - 0.5) * 1.5;
          let vy = (Math.random() - 0.5) * 0.5;
          // Leichte Gravitation nach unten
          vy += rules.gravity * 0.2;
          for (let step = 0; step < 60; step++) {
            vx += (Math.random() - 0.5) * 0.3;
            vy += (Math.random() - 0.5) * 0.2;
            x += vx;
            y += vy;
            if (x < 0 || x > width || y < 0 || y > height) break;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // Nachbearbeitung: weiche Überlagerung (globaler Nass-in-Nass)
      ctx.globalAlpha = 0.05 * (rules.layerBlending / 50);
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
  }, [drawSoftSplat, simulateGravityDrip]);

  // Zufällige Regeln (unverändert)
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
      splitFactor: Math.floor(Math.random() * 50),
      backgroundBrightness: 0.6 + Math.random() * 0.4,
      shapeMix: Math.random(),
    };
  }, []);

  return { generateFromRules, generateRandomRules };
}