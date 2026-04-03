import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import iconLogo from '../assets/icon.png';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const links = [
    { name: "Vida", href: "/vida" },
    { name: "Eucaristia", href: "/eucaristia" },
    { name: "Milagres", href: "/milagres" },
    { name: "Digital", href: "/millennial" },
    { name: "Santidade", href: "/santidade" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-50 rounded-full border border-white/20 py-2.5 px-8">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img 
              src={iconLogo} 
              alt="Carlo Acutis Icon" 
              className="relative w-10 h-10 object-contain drop-shadow-sm"
            />
          </div>
          <span className="font-black text-blue-900 text-xl tracking-tighter uppercase italic">
            Carlo<span className="text-red-600">.</span>
          </span>
        </Link>
        <div className="hidden md:flex gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
                location.pathname === link.href ? 'text-red-600' : 'text-blue-950/60 hover:text-red-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <Link 
          to="/millennial" 
          className="bg-red-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-950 transition-all shadow-lg shadow-red-600/20 active:translate-y-0.5"
        >
          Ciberapóstolo
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
