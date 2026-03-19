import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-center p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm dark:text-gray-300">&copy; 2026 DreamWeaver – Träume in Farbe</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link to="/imprint" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Impressum
          </Link>
          <Link to="/privacy" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}