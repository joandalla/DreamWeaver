import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GalleryItem from '../components/GalleryItem';
import Spinner from '../components/Spinner';
import Button from '../components/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PAGE_SIZE = 12;

export default function CommunityGallery() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  // Initialer Load
  useEffect(() => {
    fetchDreams(1, true);
  }, []);

  const fetchDreams = async (pageNum, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`${API_URL}/community/dreams?page=${pageNum}&limit=${PAGE_SIZE}`);
      const newDreams = res.data;

      if (reset) {
        setDreams(newDreams);
      } else {
        setDreams(prev => [...prev, ...newDreams]);
      }

      setHasMore(newDreams.length === PAGE_SIZE);
      if (!reset) setPage(pageNum);
    } catch (err) {
      toast.error('Fehler beim Laden der Community-Bilder');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer für unendliches Scrollen
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => prev + 1);
          fetchDreams(page + 1, false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Hero-Bereich */}
      <section className="text-center py-12 px-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Willkommen bei DreamWeaver</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Erschaffe einzigartige Kunstwerke im Stil von Jackson Pollock. 
          Wähle Farben, passe Parameter an und lass deiner Kreativität freien Lauf.
          Teile deine Träume mit der Community und entdecke die Werke anderer.
        </p>
        <div className="mt-8">
          <Button variant="primary" size="large" onClick={() => window.location.href = '/weave'}>
            Jetzt eigenen Traum weben
          </Button>
        </div>
      </section>

      {/* Galerie */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Community-Galerie</h2>
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

        {/* Lade-Indikator für mehr Bilder */}
        {hasMore && (
          <div ref={loaderRef} className="py-8 text-center">
            {loadingMore ? <Spinner /> : <span className="text-gray-400">Scrolle für mehr</span>}
          </div>
        )}
      </section>
    </div>
  );
}