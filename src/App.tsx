import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const VidaLegadoPage = lazy(() => import('./pages/DetailPages').then(m => ({ default: m.VidaLegadoPage })));
const FeDevocaoPage = lazy(() => import('./pages/DetailPages').then(m => ({ default: m.FeDevocaoPage })));
const SantidadePage = lazy(() => import('./pages/DetailPages').then(m => ({ default: m.SantidadePage })));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-red-600 rounded-full animate-spin"></div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Carregando...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-red-600 rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Carregando Sessão...</span>
        </div>
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <RouteFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? <>{children}</> : <Navigate to="/perfil" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />

            {/* Quiz aberto para visitantes (modo convidado) e usuários autenticados */}
            <Route path="/quiz" element={<QuizPage />} />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />

            {/* Rotas por Categoria */}
            <Route path="/vida-legado" element={<VidaLegadoPage />} />
            <Route path="/fe-devocao" element={<FeDevocaoPage />} />
            <Route path="/santidade" element={<SantidadePage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-500 selection:text-white">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-3 focus:bg-red-600 focus:text-white focus:rounded-full focus:shadow-2xl focus:font-black focus:text-xs focus:uppercase focus:tracking-widest focus:outline-none focus:ring-4 focus:ring-red-400"
              >
                Pular para o conteúdo principal
              </a>
              <Navbar />

              <main id="main-content" tabIndex={-1} className="outline-none">
                <AnimatedRoutes />
              </main>

              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
