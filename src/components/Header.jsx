import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme'; // <-- neuer Import
import Button from './Button';

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Community' },
    ...(user ? [{ to: '/my-dreams', label: 'Meine Träume' }] : []),
    { to: '/about', label: 'Über' },
  ];

  return (
    <header className="bg-indigo-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-indigo-200 transition">
          DreamWeaver
        </Link>

        {/* Desktop Navigation */}
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

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-indigo-700 transition"
            aria-label="Dark Mode umschalten"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Auth Buttons */}
          {user ? (
            <Button
              variant="secondary"
              onClick={logout}
              className="bg-transparent! text-white! border border-white hover:bg-white hover:text-indigo-800!"
            >
              Logout
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="hover:text-indigo-200 transition">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition"
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
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 px-4 hover:bg-indigo-600 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
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
                className="block w-full text-left py-2 px-4 border border-white rounded hover:bg-indigo-600"
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