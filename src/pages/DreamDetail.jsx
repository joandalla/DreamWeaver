import { useParams, useNavigate } from 'react-router-dom';
import { useDreams } from '../context/DreamsContext';
import { useDreamWeaver } from '../hooks/useDreamWeaver'; // <-- nur einmal!
import Button from '../components/Button';
import { useEffect, useRef } from 'react';

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
    const newImageData = generateFromRules(dream.rules, 600, 400);
    const updatedDream = { ...dream, imageData: newImageData };
    updateDream(dream._id, updatedDream);
  };

  const handleDelete = () => {
    if (window.confirm('Wirklich löschen?')) {
      deleteDream(dream._id);
      navigate('/');
    }
  };

  if (!dream) {
    return <div className="text-center py-20">Traum nicht gefunden</div>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-indigo-600 mb-4 inline-block hover:underline">
        ← Zurück
      </button>
      <div className="bg-white rounded-lg shadow-md p-6">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={400} 
          className="w-full h-auto border mb-4"
        />
        <h2 className="text-2xl font-semibold mb-2">{dream.title}</h2>
        <div className="mb-4">
          <h3 className="font-medium mb-1">Regeln:</h3>
          <ul className="list-disc list-inside text-gray-700">
            <li>Formen: {dream.rules.shapeCount}</li>
            <li>Farben: {dream.rules.colors.join(', ')}</li>
            <li>Größen: {dream.rules.minSize}–{dream.rules.maxSize}px</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleRegenerate}>Neu weben</Button>
          <Button variant="secondary" onClick={() => navigate(`/weave/${dream._id}`)}>Bearbeiten</Button>
          <Button variant="danger" onClick={handleDelete}>Löschen</Button>
        </div>
      </div>
    </div>
  );
}