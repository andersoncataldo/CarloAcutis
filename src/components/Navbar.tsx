import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import iconLogo from '../assets/icon.png';
import { navLinks } from '../data/navigation';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setIsOpen(false), [location.pathname]);

  return (
    <nav className={`fixed top-3 md:top-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[95%] max-w-7xl z-50 transition-all duration-500 rounded-[2rem] md:rounded-full border border-white/20 py-2.5 md:py-3 px-6 md:px-10 ${
      scrolled ? 'bg-white/90 backdrop-blur-2xl shadow-2xl py-2 md:py-2.5' : 'bg-white/70 backdrop-blur-lg shadow-xl'
    }`}>
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={iconLogo} alt="Icon" className="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12" />
          <span className="font-black text-blue-900 text-xl md:text-2xl tracking-tighter uppercase italic leading-none">
            Carlo<span className="text-red-600">.</span>
          </span>
        </Link>

        {/* Desktop Links - Optimized for many items */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`transition-all font-black text-[9px] xl:text-[10px] uppercase tracking-widest whitespace-nowrap ${
                location.pathname === link.href ? 'text-red-600' : 'text-blue-950/60 hover:text-red-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/millennial" 
            className="hidden sm:block bg-red-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-950 transition-all shadow-lg shadow-red-600/20"
          >
            Digital
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-blue-950 transition-transform active:scale-90"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Enhanced Grid */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center min-h-[60px] ${
                location.pathname === link.href 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'bg-slate-50 text-blue-950/60 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/millennial"
            className="col-span-2 p-4 bg-blue-950 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-center shadow-lg"
          >
            Influenciador de Deus
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
