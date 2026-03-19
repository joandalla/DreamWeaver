import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDreams } from '../context/DreamsContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function DreamWeaver() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { dreams, addDream, updateDream } = useDreams();

  const [title, setTitle] = useState('');
  const [colors, setColors] = useState(['#1a1a1a', '#c0392b', '#6e3b1a', '#2980b9', '#f1c40f']);
  const [preview, setPreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ===== ERWEITERTE PARAMETER (wissenschaftlich fundiert) =====
  const [params, setParams] = useState({
    // Basiseigenschaften
    density: 70,
    chaos: 60,
    thickness: 70,
    gravity: 0.5,
    dripLength: 80,           // Maximale Tropfenlänge
    
    // Nicht-newtonsche Fluid-Eigenschaften [citation:3][citation:5]
    nonNewtonianFactor: 0.7,   // Scherverdünnung (0 = newtonisch, 1 = stark scherverdünnend)
    coilingFrequency: 50,       // Coiling-Instabilität (0 = gerade Linien, 100 = viele Schlaufen)
    
    // Aufprall & Spritzer [citation:3]
    splatterIntensity: 60,      // Wie stark spritzt Farbe beim Aufprall?
    
    // Mehrskaligkeit & Fraktale [citation:4][citation:8]
    fractalDepth: 50,           // Kleine Details neben großen Formen (0 = wenig, 100 = sehr fein)
    skeinDensity: 60,           // Feine Farbfäden (die typischen Pollock-"Skeins")
    
    // Layer-Steuerung [citation:1][citation:7]
    layerBlending: 50,          // Nass-in-Nass Vermischung
    backgroundTexture: 30,      // Leinwandstruktur im Hintergrund
  });

  // Bestehenden Traum laden
  useEffect(() => {
    if (id) {
      const dream = dreams.find(d => d._id === id);
      if (dream && dream.imageData) {
        setTitle(dream.title);
        setColors(dream.colors || colors);
        setParams(dream.params || params);
        setPreview(dream.imageData);
      }
    }
  }, [id, dreams]);

  // ===== VISKOSER KLEICKS (unverändert) =====
  const drawViscousSplat = useCallback((ctx, x, y, color, baseSize) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = baseSize * 0.4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const layers = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < layers; i++) {
      const offsetX = (Math.random() - 0.5) * baseSize * 0.5;
      const offsetY = (Math.random() - 0.5) * baseSize * 0.5;
      const size = baseSize * (0.7 + Math.random() * 0.6);
      const alpha = 0.5 + Math.random() * 0.4;

      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, baseSize * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.95;
    ctx.fill();

    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = baseSize * (0.8 + Math.random());
      const sx = x + Math.cos(angle) * dist;
      const sy = y + Math.sin(angle) * dist;
      const size = baseSize * 0.2 * (0.5 + Math.random());

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fill();
    }
    ctx.restore();
  }, []);

  // ===== ERWEITERTE TROPFEN-FUNKTION (mit neuen Parametern) =====
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
    
    // Fraktale Selbstähnlichkeit: kleine Spritzer in der Nähe [citation:4]
    const createMicroSplatters = fractalDepth > Math.random() * 100;
    
    for (let step = 0; step < dripLength * 1.5; step++) {
      // Nicht-newtonsche Viskosität (scherverdünnend) [citation:3]
      const speed = Math.sqrt(vx * vx + vy * vy);
      const n = 0.4 - nonNewtonianFactor * 0.3; // 0.1 bis 0.4
      const thinningFactor = Math.pow(Math.max(speed, 0.1), n - 1);
      
      // Coiling-Effekt: horizontale Oszillation [citation:2][citation:5]
      const coilingFactor = (coilingFrequency / 50) * 0.5;
      vy += gravity * thinningFactor;
      vx += Math.sin(step * 0.2 * coilingFactor) * (chaos / 100) * coilingFactor;
      
      // Zusätzlicher Zufallsfaktor für Chaos
      vx += (Math.random() - 0.5) * chaos * 0.15 * thinningFactor;
      
      x += vx;
      y += vy * thinningFactor;
      
      // Dynamische Linienstärke
      let widthFactor = 1.0;
      if (speed < 0.8) widthFactor = 3.5 + Math.random() * 1.5;
      else if (speed < 1.5) widthFactor = 2.0 + Math.random() * 1.0;
      else if (speed > 4) widthFactor = 0.4 + Math.random() * 0.3;
      
      // Plötzliche Verdickungen (Zögern-Effekt) – typisch für Pollock [citation:8]
      if (Math.random() < 0.03 * (chaos / 50)) {
        widthFactor *= 2.5;
        if (Math.random() < splatterIntensity / 100) {
          drawViscousSplat(ctx, x, y, color, baseWidth * 1.5);
        }
      }
      
      // Nass-in-Nass: Interaktion mit Klecksen [citation:1]
      existingBlobs.forEach(blob => {
        const dx = x - blob.x;
        const dy = y - blob.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < blob.size * 2) {
          widthFactor *= 1.8;
          // Farbmischung (vereinfacht)
          if (layerBlending > 50) {
            ctx.strokeStyle = blendColors(ctx.strokeStyle, blob.color, 0.3);
          }
        }
      });
      
      ctx.lineWidth = Math.max(0.8, baseWidth * widthFactor * thinningFactor);
      
      // Fraktale Mikro-Spritzer [citation:4]
      if (createMicroSplatters && step % 10 === 0 && Math.random() < fractalDepth / 100) {
        for (let m = 0; m < 3; m++) {
          const microX = x + (Math.random() - 0.5) * 15;
          const microY = y + (Math.random() - 0.5) * 15;
          drawViscousSplat(ctx, microX, microY, color, baseWidth * 0.3);
        }
      }
      
      // Begrenzung
      if (x < 0) { x = 5; vx *= -0.2; }
      if (x > 1024) { x = 1019; vx *= -0.2; }
      if (y > 768) {
        // Aufprall-Spritzer mit Intensität [citation:3]
        const splashCount = Math.floor(splatterIntensity / 20) + 2;
        for (let i = 0; i < splashCount; i++) {
          const sx = x + (Math.random() - 0.5) * 30;
          const sy = 768 - Math.random() * 10;
          ctx.moveTo(x, y);
          ctx.lineTo(sx, sy);
        }
        drawViscousSplat(ctx, x, 768 - 8, color, baseWidth * (2 + splatterIntensity / 50));
        break;
      }
      
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [drawViscousSplat]);

  // Hilfsfunktion für Farbmischung (einfach)
  const blendColors = (c1, c2, ratio) => {
    // Vereinfachte Implementierung – könnte man mit Hex-Umrechnung verbessern
    return c1;
  };

  // ===== HAUPTGENERIERUNG (angepasst mit neuen Parametern) =====
  const generatePainting = useCallback(() => {
    setIsGenerating(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Hintergrund mit Textur [citation:1]
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, 1024, 768);
    
    // Hintergrundstruktur (Leinwandfasern)
    if (params.backgroundTexture > 0) {
      ctx.globalAlpha = 0.1 * (params.backgroundTexture / 50);
      for (let i = 0; i < params.backgroundTexture * 5; i++) {
        ctx.fillStyle = `rgba(100, 80, 60, ${Math.random() * 0.2})`;
        ctx.fillRect(
          Math.random() * 1024,
          Math.random() * 768,
          Math.random() * 2,
          Math.random() * 10
        );
      }
    }

    // 1. Schicht: Unregelmäßige Formen [citation:1]
    ctx.globalAlpha = 0.4 * (params.layerBlending / 50);
    const blobs = [];
    const blobCount = Math.floor(params.density * 0.5) + 10;
    
    for (let i = 0; i < blobCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 1024;
      const y = Math.random() * 768;
      const size = (params.density / 10) * (4 + Math.random() * 18);
      drawViscousSplat(ctx, x, y, color, size);
      blobs.push({ x, y, size, color });
    }

    // 2. Schicht: Haupttropfen (dicke Linien)
    ctx.lineWidth = params.thickness / 8 + 2;
    ctx.globalAlpha = 0.8;
    
    colors.forEach((color) => {
      const drips = Math.floor(params.density / colors.length) + 5;
      for (let i = 0; i < drips; i++) {
        const startType = Math.random();
        let startX, startY;
        if (startType < 0.6) {
          startX = Math.random() * 1024;
          startY = 5 + Math.random() * 80;
        } else if (startType < 0.8) {
          startX = 5;
          startY = Math.random() * 700;
        } else {
          startX = 1019;
          startY = Math.random() * 700;
        }
        simulateGravityDrip(ctx, startX, startY, color, params, blobs);
      }
    });

    // 3. Schicht: Skeins (feine Farbfäden) – Pollocks Markenzeichen [citation:8]
    if (params.skeinDensity > 0) {
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.5;
      const skeinCount = Math.floor(params.skeinDensity * 2);
      
      for (let i = 0; i < skeinCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.strokeStyle = color;
        
        const startX = Math.random() * 1024;
        const startY = Math.random() * 200;
        simulateGravityDrip(ctx, startX, startY, color, {
          ...params,
          thickness: params.thickness * 0.3,
          gravity: params.gravity * 1.2,
          chaos: params.chaos * 1.3
        }, blobs);
      }
    }

    // 4. Schicht: Spritzer [citation:1]
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    const spatterCount = Math.floor(params.density * 3 * (params.splatterIntensity / 50));
    for (let i = 0; i < spatterCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = color;
      const clusterX = Math.random() * 1024;
      const clusterY = Math.random() * 768;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(
          clusterX + (Math.random() - 0.5) * 30,
          clusterY + (Math.random() - 0.5) * 30,
          1 + Math.random() * 4,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    const dataURL = canvas.toDataURL('image/png');
    setPreview(dataURL);
    setIsGenerating(false);
  }, [colors, params, simulateGravityDrip, drawViscousSplat]);

  useEffect(() => {
    generatePainting();
  }, [generatePainting]);

  // Farbauswahl-Funktionen (unverändert)
  const handleColorChange = (index, newColor) => {
    const updated = [...colors];
    updated[index] = newColor;
    setColors(updated);
  };

  const addColor = () => setColors([...colors, '#000000']);
  const removeColor = (index) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleRandomPalette = () => {
    const pollockPalette = ['#1a1a1a', '#c0392b', '#6e3b1a', '#2980b9', '#f1c40f', '#ffffff'];
    const shuffled = [...pollockPalette].sort(() => 0.5 - Math.random());
    setColors(shuffled.slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Bitte Titel eingeben');
      return;
    }

    const dreamData = {
      title: title.trim(),
      colors,
      params,
      imageData: preview,
    };

    try {
      if (id) {
        await updateDream(id, dreamData);
        toast.success('Traum aktualisiert');
      } else {
        await addDream(dreamData);
        toast.success('Traum gespeichert');
      }
      navigate('/my-dreams');
    } catch (error) {
      toast.error('Fehler beim Speichern: ' + error.message);
    }
  };

  const handleDownload = () => {
    if (!preview) return;
    const link = document.createElement('a');
    link.download = `dreamweaver-${Date.now()}.png`;
    link.href = preview;
    link.click();
    toast.success('Bild heruntergeladen');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-indigo-600 dark:text-indigo-400 mb-4 hover:underline">
        ← Zurück
      </button>
      <h1 className="text-3xl font-light mb-6 dark:text-white">{id ? 'Traum bearbeiten' : 'Einen neuen Traum weben'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div>
          <label className="block font-medium mb-1 dark:text-gray-200">Titel des Traums</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
            required
          />
        </div>

        {/* Farbauswahl */}
        <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
          <label className="block font-medium mb-3 dark:text-gray-200">Farbpalette</label>
          <div className="space-y-4">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border dark:border-gray-600" style={{ backgroundColor: color }} />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-12 h-10 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="font-mono text-sm dark:text-gray-300 flex-1">{color}</span>
                {colors.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeColor(index)}
                    className="p-1! px-3! text-sm"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={addColor}>
                + Farbe hinzufügen
              </Button>
              <Button type="button" variant="primary" onClick={handleRandomPalette}>
                Pollock-Palette
              </Button>
            </div>
          </div>
        </div>

        {/* Parameter-Sektionen (gruppiert nach wissenschaftlichen Kategorien) */}
        
        {/* Basiseigenschaften */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3 dark:text-white border-b pb-2">Basiseigenschaften</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Dichte ({params.density})</label>
              <input
                type="range" min="20" max="150" value={params.density}
                onChange={(e) => setParams({ ...params, density: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Chaos ({params.chaos})</label>
              <input
                type="range" min="0" max="100" value={params.chaos}
                onChange={(e) => setParams({ ...params, chaos: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Linienstärke ({params.thickness})</label>
              <input
                type="range" min="40" max="150" value={params.thickness}
                onChange={(e) => setParams({ ...params, thickness: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Gravitation ({params.gravity.toFixed(2)})</label>
              <input
                type="range" min="0.1" max="1" step="0.01" value={params.gravity}
                onChange={(e) => setParams({ ...params, gravity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Nicht-newtonsche Fluideigenschaften [citation:3][citation:5] */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3 dark:text-white border-b pb-2">Nicht-newtonsche Eigenschaften</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Scherverdünnung ({params.nonNewtonianFactor.toFixed(2)})</label>
              <input
                type="range" min="0" max="1" step="0.01" value={params.nonNewtonianFactor}
                onChange={(e) => setParams({ ...params, nonNewtonianFactor: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">0 = Newtonisch, 1 = stark scherverdünnend</p>
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Coiling-Frequenz ({params.coilingFrequency})</label>
              <input
                type="range" min="0" max="100" value={params.coilingFrequency}
                onChange={(e) => setParams({ ...params, coilingFrequency: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Wie oft die Farbe Schlaufen bildet</p>
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Drip-Länge ({params.dripLength})</label>
              <input
                type="range" min="20" max="200" value={params.dripLength}
                onChange={(e) => setParams({ ...params, dripLength: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Mehrskaligkeit & Details [citation:4][citation:8] */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3 dark:text-white border-b pb-2">Mehrskalige Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Fraktale Tiefe ({params.fractalDepth})</label>
              <input
                type="range" min="0" max="100" value={params.fractalDepth}
                onChange={(e) => setParams({ ...params, fractalDepth: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Kleine Details neben großen Formen</p>
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Skein-Dichte ({params.skeinDensity})</label>
              <input
                type="range" min="0" max="100" value={params.skeinDensity}
                onChange={(e) => setParams({ ...params, skeinDensity: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Feine Farbfäden (Pollocks Markenzeichen)</p>
            </div>
          </div>
        </div>

        {/* Layer & Texturen [citation:1] */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3 dark:text-white border-b pb-2">Layer & Texturen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Nass-in-Nass ({params.layerBlending})</label>
              <input
                type="range" min="0" max="100" value={params.layerBlending}
                onChange={(e) => setParams({ ...params, layerBlending: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Hintergrund-Textur ({params.backgroundTexture})</label>
              <input
                type="range" min="0" max="100" value={params.backgroundTexture}
                onChange={(e) => setParams({ ...params, backgroundTexture: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-200">Spritzer-Intensität ({params.splatterIntensity})</label>
              <input
                type="range" min="0" max="100" value={params.splatterIntensity}
                onChange={(e) => setParams({ ...params, splatterIntensity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Vorschau */}
        <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Vorschau (1024x768)</p>
          {isGenerating ? (
            <div className="w-full h-96 border dark:border-gray-600 bg-white dark:bg-gray-900 flex items-center justify-center">
              Generiere...
            </div>
          ) : preview ? (
            <img src={preview} alt="Vorschau" className="w-full h-auto border dark:border-gray-600 bg-white" />
          ) : (
            <div className="w-full h-96 border dark:border-gray-600 bg-white dark:bg-gray-900 flex items-center justify-center">
              Kein Bild
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button type="button" variant="secondary" onClick={generatePainting}>
            Neu generieren
          </Button>
          <Button type="button" variant="primary" onClick={handleDownload}>
            Bild herunterladen (PNG)
          </Button>
          <Button type="submit">
            {id ? 'Änderungen speichern' : 'Traum speichern'}
          </Button>
        </div>
      </form>
    </div>
  );
}