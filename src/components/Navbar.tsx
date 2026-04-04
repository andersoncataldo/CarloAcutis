import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import iconLogo from '../assets/icon.png';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Vida", href: "/vida" },
    { name: "Eucaristia", href: "/eucaristia" },
    { name: "Digital", href: "/millennial" },
    { name: "Cruz", href: "/doenca" },
    { name: "Túmulo", href: "/tumulo" },
    { name: "Santidade", href: "/santidade" },
  ];

  return (
    <nav className="fixed top-3 md:top-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[95%] max-w-7xl bg-white/80 backdrop-blur-2xl shadow-2xl z-50 rounded-[2rem] md:rounded-full border border-white/20 py-2.5 md:py-3 px-6 md:px-10">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={iconLogo} alt="Icon" className="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12" />
          <span className="font-black text-blue-900 text-xl md:text-2xl tracking-tighter uppercase italic leading-none">
            Carlo<span className="text-red-600">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-6 lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`transition-all font-black text-[10px] uppercase tracking-widest ${
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
            className="bg-red-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-950 transition-all shadow-lg shadow-red-600/20"
          >
            Ciberapóstolo
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-blue-950"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="p-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-950/60 hover:text-red-600 hover:bg-red-50 transition-all text-center"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
