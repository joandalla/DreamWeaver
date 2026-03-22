import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { DreamsProvider } from "./context/DreamsContext";
import ToastProvider from "./components/Toaster";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Spinner from "./components/Spinner";
import Imprint from "./pages/Imprint";
import Privacy from "./pages/Privacy";

const CommunityGallery = lazy(() => import("./pages/CommunityGallery"));
const DreamGallery = lazy(() => import("./pages/DreamGallery"));
const DreamDetail = lazy(() => import("./pages/DreamDetail"));
const DreamWeaver = lazy(() => import("./pages/DreamWeaver"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const About = lazy(() => import("./pages/About"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));

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
                <Suspense
                  fallback={
                    <div className="text-center py-20">
                      <Spinner />
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<CommunityGallery />} />
                    <Route path="/about" element={<About />} />
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
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/imprint" element={<Imprint />} />
                    <Route path="/privacy" element={<Privacy />} />
                  </Routes>
                </Suspense>
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
