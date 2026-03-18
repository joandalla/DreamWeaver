import { Link } from 'react-router-dom';
import { useDreams } from '../context/DreamsContext';
import GalleryItem from '../components/GalleryItem';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function DreamGallery() {
  const { dreams, loading } = useDreams();

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-light mb-6">Meine Träume</h1>
      {dreams.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          Noch keine Träume vorhanden. 🌙  
          <Link to="/weave" className="text-indigo-600 dark:text-indigo-400 block mt-2">Weave deinen ersten Traum</Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map(dream => (
            <GalleryItem key={dream._id} dream={dream} />
          ))}
        </div>
      )}
    </div>
  );
}