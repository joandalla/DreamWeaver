import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    try {
      await signup(email, password);
      toast.success('Registrierung erfolgreich');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Fehler bei der Registrierung');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Registrieren</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium dark:text-gray-200">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium dark:text-gray-200">Passwort</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium dark:text-gray-200">Passwort bestätigen</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2"
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">
          Registrieren
        </Button>
      </form>
      <p className="mt-4 text-center dark:text-gray-300">
        Bereits registriert?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Zum Login
        </Link>
      </p>
    </div>
  );
}