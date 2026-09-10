<<<<<<< HEAD
import { lazy, Suspense } from 'react';
=======
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
<<<<<<< HEAD
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

// Lazy loading: a Home carrega tudo de forma eager (é a primeira tela que
// a maioria dos visitantes vê), o resto só é baixado quando a rota é
// visitada — reduz o chunk inicial (Fase 4 do plano de auditoria).
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

// DetailPages.tsx exporta 3 componentes nomeados (sem export default),
// então cada um precisa do próprio wrapper lazy apontando para o mesmo chunk.
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
=======
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import QuizPage from './pages/QuizPage';
import Admin from './pages/Admin';
import { 
  VidaLegadoPage,
  FeDevocaoPage,
  SantidadePage
} from './pages/DetailPages';
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
<<<<<<< HEAD
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
=======
        <div className="flex flex-col items-center gap-4">
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
          <div className="w-12 h-12 border-4 border-blue-900 border-t-red-600 rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Carregando Sessão...</span>
        </div>
      </div>
    );
  }
<<<<<<< HEAD
  return user ? <>{children}</> : <Navigate to="/login" replace />;
=======
  return user ? <>{children}</> : <Navigate to="/login" />;
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
<<<<<<< HEAD
  if (loading) return <RouteFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? <>{children}</> : <Navigate to="/perfil" replace />;
=======
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return isAdmin ? <>{children}</> : <Navigate to="/perfil" />;
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
};

export default function App() {
  return (
<<<<<<< HEAD
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-500 selection:text-white">
            <Navbar />

            <main>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />

                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  <Route path="/quiz" element={
                    <ProtectedRoute>
                      <QuizPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin" element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } />

                  {/* Rotas por Categoria */}
                  <Route path="/vida-legado" element={<VidaLegadoPage />} />
                  <Route path="/fe-devocao" element={<FeDevocaoPage />} />
                  <Route path="/santidade" element={<SantidadePage />} />

                  {/* 404 real, em vez de redirecionar tudo silenciosamente para a home */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
=======
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-500 selection:text-white">
          <Navbar />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/quiz" element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />

              {/* Novas Rotas por Categoria */}
              <Route path="/vida-legado" element={<VidaLegadoPage />} />
              <Route path="/fe-devocao" element={<FeDevocaoPage />} />
              <Route path="/santidade" element={<SantidadePage />} />
              
              {/* Fallback para home ou 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
  );
}
