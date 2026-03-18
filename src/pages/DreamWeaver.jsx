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

  const [params, setParams] = useState({
    density: 70,
    chaos: 60,
    thickness: 80,
    gravity: 0.5,
    nonNewtonian: 0.8,
    blobiness: 60,
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

  // ===== VISKOSER KLEICKS (mit weichen Übergängen) =====
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

  // ===== NICHT-NEWTONSCHE TROPFEN-FUNKTION =====
  const simulateGravityDrip = useCallback((ctx, startX, startY, color, params, existingBlobs = []) => {
    const { gravity, chaos, thickness, nonNewtonian, blobiness } = params;

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

    for (let step = 0; step < 120; step++) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      const n = 0.4 - nonNewtonian * 0.3;
      const thinningFactor = Math.pow(Math.max(speed, 0.1), n - 1);

      vy += gravity * thinningFactor;
      vx += (Math.random() - 0.5) * chaos * 0.15 * thinningFactor;

      x += vx;
      y += vy;

      let widthFactor = 1.0;
      if (speed < 0.8) widthFactor = 3.5 + Math.random() * 1.5;
      else if (speed < 1.5) widthFactor = 2.0 + Math.random() * 1.0;
      else if (speed > 4) widthFactor = 0.4 + Math.random() * 0.3;

      if (Math.random() < 0.03) {
        widthFactor *= 2.5;
        if (Math.random() < 0.5) {
          drawViscousSplat(ctx, x, y, color, baseWidth * 1.5);
        }
      }

      existingBlobs.forEach(blob => {
        const dx = x - blob.x;
        const dy = y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < blob.size * 2) {
          widthFactor *= 1.8;
        }
      });

      ctx.lineWidth = Math.max(0.8, baseWidth * widthFactor * thinningFactor);

      if (x < 0) { x = 5; vx *= -0.2; }
      if (x > 1024) { x = 1019; vx *= -0.2; }
      if (y > 768) {
        drawViscousSplat(ctx, x, 768 - 8, color, baseWidth * (2.5 + Math.random() * 3));
        break;
      }

      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [drawViscousSplat]);

  // ===== HAUPTGENERIERUNG =====
  const generatePainting = useCallback(() => {
    setIsGenerating(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, 1024, 768);

    const blobs = [];
    const blobCount = Math.floor(params.blobiness * 2) + 15;
    for (let i = 0; i < blobCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * 1024;
      const y = Math.random() * 768;
      const size = (params.blobiness / 12) * (4 + Math.random() * 18);
      drawViscousSplat(ctx, x, y, color, size);
      blobs.push({ x, y, size, color });
    }

    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.9;

    colors.forEach((color) => {
      const drips = Math.floor(params.density / colors.length) + 6;
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

    ctx.lineWidth = 12;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 5; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * 1024;
      const startY = 10;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.strokeStyle = color;
      let x = startX, y = startY;
      for (let step = 0; step < 30; step++) {
        x += (Math.random() - 0.5) * 40;
        y += 15 + Math.random() * 20;
        if (y > 768) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    const spatterCount = Math.floor(params.density * 4);
    for (let i = 0; i < spatterCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = color;
      const clusterX = Math.random() * 1024;
      const clusterY = Math.random() * 768;
      for (let j = 0; j < 8; j++) {
        ctx.beginPath();
        ctx.arc(
          clusterX + (Math.random() - 0.5) * 40,
          clusterY + (Math.random() - 0.5) * 40,
          1 + Math.random() * 5,
          0,
          Math.PI * 2
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
          <div>
            <label className="block font-medium mb-1 dark:text-gray-200">Nicht-newtonsch ({params.nonNewtonian.toFixed(2)})</label>
            <input
              type="range" min="0.3" max="1" step="0.01" value={params.nonNewtonian}
              onChange={(e) => setParams({ ...params, nonNewtonian: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1 dark:text-gray-200">Klecksigkeit ({params.blobiness})</label>
            <input
              type="range" min="0" max="100" value={params.blobiness}
              onChange={(e) => setParams({ ...params, blobiness: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

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