import React from 'react';
import { Link } from 'react-router-dom';
import iconLogo from '../../assets/icon.png';

const Footer: React.FC = () => {
  const navLinks = [
    { name: "Vida", href: "/vida" },
    { name: "Eucaristia", href: "/eucaristia" },
    { name: "Nossa Senhora", href: "/nossa-senhora" },
    { name: "Milagres", href: "/milagres" },
    { name: "Espiritualidade", href: "/espiritualidade" },
    { name: "Digital", href: "/millennial" },
  ];

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 overflow-hidden relative border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
        
        {/* Left Column: Logo & Quote */}
        <div className="md:col-span-5 space-y-8">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={iconLogo} alt="Logo" className="w-12 h-12 object-contain" />
            <span className="font-black text-3xl tracking-tighter uppercase italic">
              Carlo<span className="text-red-600">.</span>
            </span>
          </Link>
          <div className="space-y-4">
            <p className="text-2xl font-serif italic text-blue-200 leading-tight border-l-2 border-red-600 pl-6">
              "A Eucaristia é a minha rodovia para o céu."
            </p>
            <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">
              Padroeiro da Internet & Influenciador de Deus
            </p>
          </div>
        </div>

        {/* Center Column: Navigation */}
        <div className="md:col-span-3 space-y-8">
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Explorar</h4>
          <ul className="grid grid-cols-1 gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.href} 
                  className="text-slate-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Contact/Developer */}
        <div className="md:col-span-4 space-y-8">
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Desenvolvedor</h4>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Criador</p>
              <p className="text-xl font-black italic uppercase tracking-tight">Anderson Viana</p>
            </div>
            <div className="space-y-4 text-sm font-medium text-slate-300">
              <p className="flex items-center gap-3">
                <span className="text-red-600">E:</span> andersonvcataldo@gmail.com
              </p>
              <p className="flex items-center gap-3">
                <span className="text-red-600">T:</span> (85) 99225-8794
              </p>
              <p className="flex items-center gap-3">
                <span className="text-red-600">L:</span> linkedin.com/in/andersonnviana
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <span className="inline-block px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Fullstack Dev
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:row justify-between items-center gap-8 opacity-40">
        <div className="text-[10px] font-black uppercase tracking-[0.4em]">
          © 2026 Memorial Digital • #BeOriginal
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em]">
          <span>Assis, IT</span>
          <span>•</span>
          <span>Vaticano</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
