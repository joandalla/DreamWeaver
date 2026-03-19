import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CommentSection({ dreamId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [dreamId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments/${dreamId}`);
      setComments(res.data);
    } catch (err) {
      toast.error('Fehler beim Laden der Kommentare');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Bitte einloggen zum Kommentieren');
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/comments`, {
        dreamId,
        text: newComment.trim(),
      });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
      toast.success('Kommentar gespeichert');
    } catch (err) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Kommentar löschen?')) return;
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Kommentar gelöscht');
    } catch (err) {
      toast.error('Fehler beim Löschen');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">Kommentare</h3>

      {/* Kommentar-Formular */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Dein Kommentar..."
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
            maxLength={500}
          />
          <Button type="submit" disabled={loading || !newComment.trim()}>
            Senden
          </Button>
        </form>
      )}

      {/* Kommentarliste */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Noch keine Kommentare.</p>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {comment.userId?.email || 'Unbekannter User'}
                  </p>
                  <p className="mt-1 dark:text-white">{comment.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(comment.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
                {user && comment.userId?._id === user._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}