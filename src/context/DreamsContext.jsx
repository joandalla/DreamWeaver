import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DreamsContext = createContext();

export function DreamsProvider({ children }) {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setDreams([]);
      setLoading(false);
      return;
    }

    const fetchDreams = async () => {
      try {
        const res = await axios.get(`${API_URL}/dreams`);
        setDreams(res.data);
      } catch (err) {
        if (err.code !== 'ERR_NETWORK') {
          toast.error('Fehler beim Laden deiner Träume');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDreams();
  }, [user]);

  const addDream = async (dream) => {
    try {
      const res = await axios.post(`${API_URL}/dreams`, dream);
      setDreams(prev => [res.data, ...prev]);
      return res.data._id;
    } catch (err) {
      toast.error('Fehler beim Speichern');
      throw err;
    }
  };

  const updateDream = async (id, updatedDream) => {
    try {
      const res = await axios.put(`${API_URL}/dreams/${id}`, updatedDream);
      setDreams(prev => prev.map(d => d._id === id ? res.data : d));
    } catch (err) {
      toast.error('Fehler beim Aktualisieren');
      throw err;
    }
  };

  const deleteDream = async (id) => {
    try {
      await axios.delete(`${API_URL}/dreams/${id}`);
      setDreams(prev => prev.filter(d => d._id !== id));
      toast.success('Traum gelöscht');
    } catch (err) {
      toast.error('Fehler beim Löschen');
      throw err;
    }
  };

  return (
    <DreamsContext.Provider value={{ dreams, loading, addDream, updateDream, deleteDream }}>
      {children}
    </DreamsContext.Provider>
  );
}

export const useDreams = () => {
  const context = useContext(DreamsContext);
  if (!context) throw new Error('useDreams must be used within DreamsProvider');
  return context;
};