import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
    const { user } = useAuth();

    if (user === undefined) {
        // Ladezustand (optional: Spinner anzeigen)
        return <div className="text-center py-20">Lade...</div>;
    }

    return user ? children : <Navigate to="/login" />;
}