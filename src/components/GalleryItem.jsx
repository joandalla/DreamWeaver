import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function GalleryItem({ dream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (dream.imageData && canvasRef.current) {
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
    <Link to={`/dream/${dream._id}`} className="block border rounded overflow-hidden hover:shadow-lg transition"> {/* <-- _id */}
      <div className="aspect-square bg-gray-200 flex items-center justify-center">
        {dream.imageData ? (
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500">✨ Traum</span>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-semibold truncate">{dream.title || 'Unbenannt'}</h3>
      </div>
    </Link>
  );
}