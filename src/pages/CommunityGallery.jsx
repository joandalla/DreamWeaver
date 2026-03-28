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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const loaderRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounce für Suche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hauptfunktion zum Laden der Daten
  const fetchDreams = useCallback(async (pageNum, reset = false) => {
    // Vorherigen Request abbrechen
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (reset) {
        setLoading(true);
        setDreams([]);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum,
        limit: PAGE_SIZE,
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

      const res = await axios.get(`${API_URL}/community/dreams?${params}`, {
        signal: controller.signal,
      });
      const newDreams = res.data;

      if (reset) {
        setDreams(newDreams);
        setPage(1);
      } else {
        setDreams(prev => [...prev, ...newDreams]);
        setPage(pageNum);
      }

      setHasMore(newDreams.length === PAGE_SIZE);
    } catch (err) {
      if (axios.isCancel(err)) return;
      toast.error('Fehler beim Laden der Community-Bilder');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      abortControllerRef.current = null;
    }
  }, [debouncedSearch]);

  // Bei Suchbegriff-Änderung zurücksetzen und neu laden
  useEffect(() => {
    fetchDreams(1, true);
  }, [fetchDreams]);

  // Intersection Observer für unendliches Scrollen
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchDreams(page + 1, false);
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchDreams]);

  // Manueller "Mehr laden"-Button
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchDreams(page + 1, false);
    }
  };

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
          <Button variant="primary" onClick={() => window.location.href = '/weave'}>
            Jetzt eigenen Traum weben
          </Button>
        </div>
      </section>

      {/* Suchleiste */}
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Nach Titeln suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3"
        />
      </div>

      {/* Galerie */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">
          {debouncedSearch ? `Ergebnisse für "${debouncedSearch}"` : 'Community-Galerie'}
        </h2>

        {loading && dreams.length === 0 ? (
          <Spinner />
        ) : dreams.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            {debouncedSearch 
              ? 'Keine Bilder gefunden. Versuche einen anderen Suchbegriff.' 
              : 'Noch keine Bilder in der Community. Sei der Erste! 🎨'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dreams.map(dream => (
              <GalleryItem key={dream._id} dream={dream} />
            ))}
          </div>
        )}

        {/* Lade-Indikator für unendliches Scrollen */}
        {hasMore && dreams.length > 0 && (
          <>
            <div ref={loaderRef} className="py-8 text-center">
              {loadingMore ? <Spinner /> : <span className="text-gray-400">Scrolle für mehr</span>}
            </div>
            {/* Manueller Button als Fallback */}
            {!loadingMore && (
              <div className="text-center py-4">
                <Button variant="secondary" onClick={handleLoadMore} disabled={loadingMore}>
                  Mehr laden
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}