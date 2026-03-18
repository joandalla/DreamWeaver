import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DreamsProvider } from './context/DreamsContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastProvider from './components/Toaster';
import CommunityGallery from './pages/CommunityGallery';
import DreamGallery from './pages/DreamGallery';
import DreamDetail from './pages/DreamDetail';
import DreamWeaver from './pages/DreamWeaver';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DreamsProvider>
            <ToastProvider />
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors">
              <Header />
              <main className="grow container mx-auto px-4 py-6">
                <Routes>
                  <Route path="/" element={<CommunityGallery />} />
                  <Route
                    path="/my-dreams"
                    element={
                      <PrivateRoute>
                        <DreamGallery />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/dream/:id"
                    element={
                      <PrivateRoute>
                        <DreamDetail />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/weave"
                    element={
                      <PrivateRoute>
                        <DreamWeaver />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/weave/:id"
                    element={
                      <PrivateRoute>
                        <DreamWeaver />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </DreamsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;