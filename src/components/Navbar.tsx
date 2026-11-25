import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import iconLogo from '../assets/icon.webp';
import { navigation, type NavCategory } from '../data/navigation';
import { useAuth } from '../context/AuthContext';

const NavDropdown: React.FC<{ category: NavCategory; closeMenu: () => void }> = ({ category, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <div className="flex items-center">
        <Link
          to={category.path}
          onClick={closeMenu}
          className={`flex items-center gap-1.5 transition-all font-black text-[10px] uppercase tracking-widest py-4 h-full ${
            location.pathname === category.path ? 'text-red-600' : 'text-blue-950/60 hover:text-red-600'
          }`}
        >
          {category.title}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-label={`Submenu de ${category.title}`}
          className="p-1 text-blue-950/40 hover:text-red-600 focus:outline-none focus:text-red-600"
        >
          <m.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </m.svg>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-[80%] left-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-3 z-50"
          >
            <div className="flex flex-col gap-1">
              {category.links.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => {
                    setIsOpen(false);
                    closeMenu();
                  }}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    location.hash === `#${link.id}`
                      ? 'bg-red-50 text-red-600'
                      : 'text-blue-950/70 hover:bg-slate-50 hover:text-blue-950'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveMobileCategory(null);
  };

  return (
    <nav className={`fixed top-3 md:top-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[95%] max-w-7xl z-50 transition-all duration-500 rounded-[2rem] md:rounded-full border border-white/20 px-6 md:px-10 ${
      scrolled ? 'bg-white/90 backdrop-blur-2xl shadow-2xl py-2 md:py-2' : 'bg-white/70 backdrop-blur-lg shadow-xl py-3 md:py-3'
    }`}>
      <div className="flex justify-between items-center">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 group" aria-label="Ir para a página inicial">
          <img
            src={iconLogo}
            alt="Ícone Carlo Acutis"
            width={40}
            height={40}
            className="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12"
          />
          <span className="font-black text-blue-900 text-xl md:text-2xl tracking-tighter uppercase italic leading-none">
            Carlo<span className="text-red-600">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navigation.map((category) => (
            <NavDropdown key={category.title} category={category} closeMenu={closeMenu} />
          ))}
          <Link
            to="/quiz"
            onClick={closeMenu}
            className={`transition-all font-black text-[10px] uppercase tracking-widest ${
              location.pathname === '/quiz' ? 'text-red-600' : 'text-blue-950/60 hover:text-red-600'
            }`}
          >
            Quiz
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={closeMenu}
              className={`transition-all font-black text-[10px] uppercase tracking-widest ${
                location.pathname === '/admin' ? 'text-red-600' : 'text-blue-950/60 hover:text-red-600'
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <Link
              to="/perfil"
              onClick={closeMenu}
              className="bg-blue-900 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {user.nome}
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="bg-red-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-950 transition-all shadow-lg shadow-red-600/20"
            >
              Entrar
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-blue-950 transition-transform active:scale-90"
            aria-label={isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden mt-4"
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 p-4 flex flex-col gap-2 mb-2">
              {navigation.map((category) => (
                <div key={category.title} className="flex flex-col gap-1">
                  <div className="flex bg-slate-50 rounded-2xl overflow-hidden">
                    <Link
                      to={category.path}
                      onClick={closeMenu}
                      className="flex-1 p-4 text-[10px] font-black uppercase tracking-widest text-blue-950/80"
                    >
                      {category.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveMobileCategory(activeMobileCategory === category.title ? null : category.title)}
                      className="p-4 border-l border-white/50"
                      aria-expanded={activeMobileCategory === category.title}
                      aria-label={`Expandir links de ${category.title}`}
                    >
                      <m.svg
                        animate={{ rotate: activeMobileCategory === category.title ? 180 : 0 }}
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </m.svg>
                    </button>
                  </div>

                  <AnimatePresence>
                    {activeMobileCategory === category.title && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden flex flex-col gap-1"
                      >
                        {category.links.map((link) => (
                          <Link
                            key={link.name}
                            to={link.href}
                            onClick={closeMenu}
                            className="p-4 pl-8 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors border-b border-slate-50 last:border-0"
                          >
                            {link.name}
                          </Link>
                        ))}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <Link
                to="/quiz"
                onClick={closeMenu}
                className="p-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-red-600/20"
              >
                Quiz Carlo Acutis
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="p-4 bg-blue-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center"
                >
                  Painel Admin
                </Link>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
