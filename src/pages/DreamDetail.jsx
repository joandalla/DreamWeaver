import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDreams } from '../context/DreamsContext';
import { useDreamWeaver } from '../hooks/useDreamWeaver';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import CommentSection from '../components/CommentSection';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dreams, updateDream, deleteDream } = useDreams();
  const { generateFromRules } = useDreamWeaver();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadDream = async () => {
      setLoading(true);
      // Zuerst im eigenen Context suchen
      const ownDream = dreams.find(d => d._id === id);
      if (ownDream) {
        setDream(ownDream);
        setLoading(false);
        return;
      }
      // Öffentlich laden
      try {
        const res = await axios.get(`${API_URL}/dreams/public/${id}`);
        setDream(res.data);
      } catch (err) {
        toast.error('Traum nicht gefunden');
      } finally {
        setLoading(false);
      }
    };
    loadDream();
  }, [id, dreams]);

  useEffect(() => {
    if (dream && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = 600;
      canvasRef.current.height = 400;
      const img = new Image();
      img.src = dream.imageData || dream.imageDataThumb;
      img.onload = () => ctx.drawImage(img, 0, 0, 600, 400);
    }
  }, [dream]);

  const handleRegenerate = async () => {
    if (!dream?.rules) return;
    const newImageData = generateFromRules(dream.rules, 600, 400);
    const updatedDream = { ...dream, imageData: newImageData, imageDataThumb: newImageData };
    if (user && dream.userId === user._id) {
      await updateDream(dream._id, updatedDream);
      setDream(updatedDream);
      toast.success('Bild neu generiert');
    } else {
      toast.error('Nur der Besitzer kann das Bild bearbeiten');
    }
  };

  const handleDelete = async () => {
    if (!user || dream.userId !== user._id) {
      toast.error('Nicht berechtigt');
      return;
    }
    if (window.confirm('Wirklich löschen?')) {
      await deleteDream(dream._id);
      toast.success('Traum gelöscht');
      navigate('/my-dreams');
    }
  };

  const handleEdit = () => {
    if (user && dream.userId === user._id) {
      navigate(`/weave/${dream._id}`);
    } else {
      toast.error('Nicht berechtigt');
    }
  };

  // NEU: Link kopieren Funktion
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link in die Zwischenablage kopiert');
    }).catch(() => {
      toast.error('Fehler beim Kopieren');
    });
  };

  if (loading) return <Spinner />;
  if (!dream) return (
    <div className="text-center py-20">
      <p className="text-gray-500 dark:text-gray-400">Traum nicht gefunden</p>
      <Button variant="primary" onClick={() => navigate('/')} className="mt-4">
        Zurück zur Community
      </Button>
    </div>
  );

  const isOwner = user && dream.userId === user._id;

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
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
            {JSON.stringify(dream.params || dream.rules, null, 2)}
          </pre>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {isOwner && (
            <>
              <Button variant="primary" onClick={handleRegenerate}>
                Neu weben
              </Button>
              <Button variant="secondary" onClick={handleEdit}>
                Bearbeiten
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Löschen
              </Button>
            </>
          )}
          {/* NEU: Teilen-Button für alle sichtbar */}
          <Button variant="secondary" onClick={handleCopyLink}>
            🔗 Link kopieren
          </Button>
        </div>
        <CommentSection dreamId={dream._id} />
      </div>
    </div>
  );
}