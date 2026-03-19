import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LikeButton = memo(function LikeButton({ dreamId, initialCount = 0 }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !dreamId) return;
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/likes/status/${dreamId}`);
        setLiked(res.data.liked);
      } catch (err) {}
    };
    fetchStatus();
  }, [dreamId, user]);

  useEffect(() => {
    if (!dreamId) return;
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/likes/count/${dreamId}`);
        setCount(res.data.count);
      } catch (err) {}
    };
    fetchCount();
  }, [dreamId, liked]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Bitte einloggen zum Liken');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/likes/toggle`, { dreamId });
      setLiked(res.data.liked);
      setCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      toast.error('Fehler beim Liken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 px-2 py-1 rounded transition ${
        liked
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-500 hover:text-red-400'
      }`}
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
});

export default LikeButton;