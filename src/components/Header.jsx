import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-indigo-800 text-white p-4 shadow-md relative">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight" onClick={closeMenu}>
          DreamWeaver
        </Link>

        {/* Dark Mode Toggle (Desktop & mobil) */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-indigo-700 transition"
          aria-label="Dark Mode umschalten"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-indigo-200 transition">
            Community
          </Link>
          {user ? (
            <>
              <Link to="/my-dreams" className="hover:text-indigo-200 transition">
                Meine Träume
              </Link>
              <Link to="/weave" className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition">
                + Neuer Traum
              </Link>
              <Button
                variant="secondary"
                onClick={logout}
                className="bg-transparent! text-white! border border-white hover:bg-white hover:text-indigo-800!"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
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

        {/* Hamburger Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
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

        {/* Mobiles Menü */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-indigo-700 p-4 flex flex-col gap-3 md:hidden shadow-lg z-50">
            <Link to="/" className="block py-2 px-4 hover:bg-indigo-600 rounded" onClick={closeMenu}>
              Community
            </Link>
            {user ? (
              <>
                <Link to="/my-dreams" className="block py-2 px-4 hover:bg-indigo-600 rounded" onClick={closeMenu}>
                  Meine Träume
                </Link>
                <Link to="/weave" className="block py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded" onClick={closeMenu}>
                  + Neuer Traum
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full text-left py-2 px-4 border border-white rounded hover:bg-indigo-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 hover:bg-indigo-600 rounded" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/signup" className="block py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded" onClick={closeMenu}>
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