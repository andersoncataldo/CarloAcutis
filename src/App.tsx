import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import { 
  VidaPage, 
  EucaristiaPage, 
  MilagresPage, 
  MillennialPage, 
  EspiritualidadePage,
  SantidadePage,
  DoencaPage,
  TumbaPage
} from './pages/DetailPages';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-500 selection:text-white">
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vida" element={<VidaPage />} />
            <Route path="/eucaristia" element={<EucaristiaPage />} />
            <Route path="/milagres" element={<MilagresPage />} />
            <Route path="/millennial" element={<MillennialPage />} />
            <Route path="/espiritualidade" element={<EspiritualidadePage />} />
            <Route path="/santidade" element={<SantidadePage />} />
            <Route path="/doenca" element={<DoencaPage />} />
            <Route path="/tumulo" element={<TumbaPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
