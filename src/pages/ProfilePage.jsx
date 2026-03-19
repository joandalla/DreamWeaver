import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GalleryItem from '../components/GalleryItem';
import Spinner from '../components/Spinner';
import { getGravatarUrl } from '../utils/gravatar';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dreams');
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    if (!userId || userId === 'undefined') {
      toast.error('Ungültige Benutzer-ID');
      return;
    }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/profile/${userId}`);
      setProfile(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Fehler beim Laden des Profils');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    if (!currentUser || currentUser._id !== userId) return;
    setLoadingExtra(true);
    try {
      const res = await axios.get(`${API_URL}/profile/${userId}/likes`);
      setLikes(res.data);
    } catch (err) {
      toast.error('Fehler beim Laden der Likes');
    } finally {
      setLoadingExtra(false);
    }
  };

  const fetchComments = async () => {
    if (!currentUser || currentUser._id !== userId) return;
    setLoadingExtra(true);
    try {
      const res = await axios.get(`${API_URL}/profile/${userId}/comments`);
      setComments(res.data);
    } catch (err) {
      toast.error('Fehler beim Laden der Kommentare');
    } finally {
      setLoadingExtra(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'likes' && likes.length === 0 && !loadingExtra && currentUser?._id === userId) {
      fetchLikes();
    }
    if (activeTab === 'comments' && comments.length === 0 && !loadingExtra && currentUser?._id === userId) {
      fetchComments();
    }
  }, [activeTab, userId, currentUser]);

  if (loading) return <Spinner />;
  if (!profile) return <div className="text-center py-20">Profil nicht gefunden</div>;

  const { user, dreams, stats } = profile;
  const isOwnProfile = currentUser && currentUser._id === userId;

  // Daten für das Diagramm formatieren (deutsche Tage)
  const chartData = stats.daily.map(item => ({
    name: new Date(item.date).toLocaleDateString('de-DE', { weekday: 'short' }),
    Anzahl: item.count,
    fullDate: item.date,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profilkopf */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={getGravatarUrl(user.email, 120)}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-2 border-indigo-500"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold dark:text-white">{user.email}</h1>
            <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
              <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                🖼️ {stats.dreamsCount} Bilder
              </span>
              <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                ❤️ {stats.likesReceived} Likes erhalten
              </span>
              <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                💬 {stats.commentsCount} Kommentare
              </span>
            </div>
          </div>
        </div>

        {/* NEU: Aktivitätsdiagramm */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Aktivität (letzte 7 Tage)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [value, 'Bilder']}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullDate : label;
                  }}
                />
                <Bar dataKey="Anzahl" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs (nur für eigenes Profil) */}
      {isOwnProfile && (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('dreams')}
              className={`pb-2 px-1 ${
                activeTab === 'dreams'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Meine Bilder
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`pb-2 px-1 ${
                activeTab === 'likes'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Meine Likes
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 px-1 ${
                activeTab === 'comments'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Meine Kommentare
            </button>
          </nav>
        </div>
      )}

      {/* Inhalte */}
      {activeTab === 'dreams' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {isOwnProfile ? 'Meine Bilder' : `Bilder von ${user.email}`}
          </h2>
          {dreams.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {isOwnProfile ? 'Du hast noch keine Bilder erstellt.' : 'Dieser Nutzer hat noch keine Bilder.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dreams.map(dream => (
                <GalleryItem key={dream._id} dream={dream} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'likes' && isOwnProfile && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Bilder, die ich geliked habe</h2>
          {loadingExtra ? (
            <Spinner />
          ) : likes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Du hast noch keine Bilder geliked.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {likes.map(like => (
                <GalleryItem key={like._id} dream={like.dreamId} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && isOwnProfile && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Meine Kommentare</h2>
          {loadingExtra ? (
            <Spinner />
          ) : comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Du hast noch keine Kommentare geschrieben.
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <Link to={`/dream/${comment.dreamId._id}`} className="font-medium hover:underline dark:text-white">
                    {comment.dreamId.title || 'Unbenannt'}
                  </Link>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(comment.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}