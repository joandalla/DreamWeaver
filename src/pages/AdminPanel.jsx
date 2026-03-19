import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GalleryItem from '../components/GalleryItem';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDreams();
  }, []);

  const fetchAllDreams = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dreams`);
      setDreams(res.data);
    } catch (err) {
      toast.error('Fehler beim Laden der Bilder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bild wirklich löschen?')) return;
    try {
      await axios.delete(`${API_URL}/admin/dreams/${id}`);
      setDreams(prev => prev.filter(d => d._id !== id));
      toast.success('Bild gelöscht');
    } catch (err) {
      toast.error('Fehler beim Löschen');
    }
  };

  if (loading) return <Spinner />;
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Kein Zugriff auf diesen Bereich.</p>
        <Button variant="primary" onClick={() => window.location.href = '/'} className="mt-4">
          Zurück zur Community
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin-Panel</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Alle hochgeladenen Bilder ({dreams.length})
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dreams.map(dream => (
          <div key={dream._id} className="relative group">
            <GalleryItem dream={dream} />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <Link
                to={`/dream/${dream._id}`}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                title="Ansehen"
              >
                👁️
              </Link>
              <button
                onClick={() => handleDelete(dream._id)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                title="Löschen"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}