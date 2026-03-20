import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import Button from './Button';
import logo from '../assets/DreamWeaver.svg'; // <-- Logo importieren

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/about', label: 'Über' },
    { to: '/', label: 'Community' },
    ...(user ? [{ to: `/profile/${user._id}`, label: 'Profil' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="bg-indigo-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Home-Link */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={logo} alt="DreamWeaver Logo" className="h-8 w-auto" />
          {/* Optional: Text nur anzeigen, falls Logo kein Wortmarke ist */}
          <span className="text-2xl font-bold tracking-tight hover:text-indigo-200 transition whitespace-nowrap">
            DreamWeaver
          </span>
        </Link>

        {/* Desktop Navigation (zentriert) */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-indigo-200 transition ${
                isActive(link.to) ? 'border-b-2 border-white' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Rechte Gruppe */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <Link
              to="/weave"
              className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition font-medium"
            >
              + Neuer Traum
            </Link>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-indigo-700 transition"
            aria-label="Dark Mode umschalten"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <button
              onClick={logout}
              className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-indigo-800 transition font-medium"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="hover:text-indigo-200 transition">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition font-medium"
              >
                Registrieren
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menü"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-indigo-700 p-4 flex flex-col gap-3 md:hidden shadow-lg">
            <Link
              to="/about"
              className="block py-2 px-4 hover:bg-indigo-600 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Über
            </Link>
            <Link
              to="/"
              className="block py-2 px-4 hover:bg-indigo-600 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            {user && (
              <>
                <Link
                  to={`/profile/${user._id}`}
                  className="block py-2 px-4 hover:bg-indigo-600 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  to="/weave"
                  className="block py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  + Neuer Traum
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block py-2 px-4 hover:bg-indigo-600 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                toggleDarkMode();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 hover:bg-indigo-600 rounded"
            >
              {darkMode ? '☀️ Heller Modus' : '🌙 Dunkler Modus'}
            </button>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 border border-white rounded hover:bg-white hover:text-indigo-800 transition font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 px-4 hover:bg-indigo-600 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}