import { useParams, useNavigate } from 'react-router-dom';
import { useDreams } from '../context/DreamsContext';
import { useDreamWeaver } from '../hooks/useDreamWeaver';
import Button from '../components/Button';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dreams, updateDream, deleteDream } = useDreams();
  const dream = dreams.find(d => d._id === id);
  const canvasRef = useRef(null);
  const { generateFromRules } = useDreamWeaver();

  useEffect(() => {
    if (dream && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = 600;
      canvasRef.current.height = 400;
      const img = new Image();
      img.src = dream.imageData;
      img.onload = () => ctx.drawImage(img, 0, 0, 600, 400);
    }
  }, [dream]);

  const handleRegenerate = () => {
    if (!dream?.rules) return;
    const newImageData = generateFromRules(dream.rules, 600, 400);
    const updatedDream = { ...dream, imageData: newImageData };
    updateDream(dream._id, updatedDream);
    toast.success('Bild neu generiert');
  };

  const handleDelete = () => {
    if (window.confirm('Wirklich löschen?')) {
      deleteDream(dream._id);
      toast.success('Traum gelöscht');
      navigate('/my-dreams');
    }
  };

  if (!dream) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Traum nicht gefunden</p>
        <Button variant="primary" onClick={() => navigate('/my-dreams')} className="mt-4">
          Zurück zu meinen Träumen
        </Button>
      </div>
    );
  }

  // Dynamische Anzeige der Regeln (kompatibel mit alten und neuen Strukturen)
  const renderRules = () => {
    const rules = dream.rules || {};
    const entries = [];

    // Neue Struktur (mit density, chaos, etc.)
    if (rules.density !== undefined) {
      entries.push({ label: 'Dichte', value: rules.density });
      entries.push({ label: 'Chaos', value: rules.chaos });
      entries.push({ label: 'Linienstärke', value: rules.thickness });
      entries.push({ label: 'Gravitation', value: rules.gravity?.toFixed(2) });
      entries.push({ label: 'Klecksigkeit', value: rules.blobiness });
    } 
    // Alte Struktur (mit shapeCount, minSize, maxSize)
    else if (rules.shapeCount !== undefined) {
      entries.push({ label: 'Formen', value: rules.shapeCount });
      entries.push({ label: 'Farben', value: rules.colors?.join(', ') });
      entries.push({ label: 'Größen', value: `${rules.minSize}–${rules.maxSize}px` });
    } 
    // Falls nichts passt, zeige Rohdaten
    else {
      return <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(rules, null, 2)}</pre>;
    }

    return (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
        {entries.map((entry, idx) => (
          <li key={idx}>
            <span className="font-medium">{entry.label}:</span> {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 dark:text-indigo-400 mb-4 inline-block hover:underline"
      >
        ← Zurück
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto border dark:border-gray-600 mb-4"
        />
        <h2 className="text-2xl font-semibold mb-2 dark:text-white">{dream.title}</h2>
        <div className="mb-4">
          <h3 className="font-medium mb-1 dark:text-gray-200">Regeln:</h3>
          {renderRules()}
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleRegenerate}>
            Neu weben
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/weave/${dream._id}`)}>
            Bearbeiten
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Löschen
          </Button>
        </div>
      </div>
    </div>
  );
}