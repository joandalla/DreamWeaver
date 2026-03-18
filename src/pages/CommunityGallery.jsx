import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GalleryItem from '../components/GalleryItem';
import Spinner from '../components/Spinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CommunityGallery() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityDreams = async () => {
      try {
        const res = await axios.get(`${API_URL}/community/dreams`);
        setDreams(res.data);
      } catch (err) {
        toast.error('Fehler beim Laden der Community-Bilder');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityDreams();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-light mb-6 dark:text-white">Community-Galerie</h1>
      {dreams.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          Noch keine Bilder in der Community. Sei der Erste! 🎨
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dreams.map(dream => (
            <GalleryItem key={dream._id} dream={dream} />
          ))}
        </div>
      )}
    </div>
  );
}