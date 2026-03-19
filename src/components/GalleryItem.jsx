import { Link } from 'react-router-dom';
import { memo, useEffect, useRef } from 'react';
import LikeButton from './LikeButton';

const GalleryItem = memo(function GalleryItem({ dream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!dream.imageDataThumb && dream.imageData && canvasRef.current) {
      const img = new Image();
      img.src = dream.imageData;
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = 200;
        canvasRef.current.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
      };
    }
  }, [dream]);

  return (
    <div className="block border rounded overflow-hidden hover:shadow-lg transition bg-white dark:bg-gray-800">
      <Link to={`/dream/${dream._id}`}>
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {dream.imageDataThumb ? (
            <img
              src={dream.imageDataThumb}
              alt={dream.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : dream.imageData ? (
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 dark:text-gray-400">✨ Traum</span>
          )}
        </div>
        <div className="p-2">
          <h3 className="font-semibold truncate dark:text-white">{dream.title || 'Unbenannt'}</h3>
        </div>
      </Link>
      <div className="px-2 pb-2 flex justify-end">
        <LikeButton dreamId={dream._id} initialCount={dream.likeCount || 0} />
      </div>
    </div>
  );
});

export default GalleryItem;