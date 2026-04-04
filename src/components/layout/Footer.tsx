import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import iconLogo from '../../assets/icon.png';

const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "andersonvcataldo@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { name: "Vida", href: "/vida" },
    { name: "Eucaristia", href: "/eucaristia" },
    { name: "Cruz & Partida", href: "/doenca" },
    { name: "Santo de Jeans", href: "/tumulo" },
    { name: "Milagres", href: "/milagres" },
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
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full"></div>
            
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Criado por</p>
              <p className="text-2xl font-black italic uppercase tracking-tight text-white">Anderson Viana</p>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Email with Copy functionality */}
              <div className="group/email relative">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">E-mail</p>
                <div 
                  onClick={handleCopy}
                  className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-red-600/50 transition-all cursor-pointer group-hover/email:bg-white/10"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-bold truncate text-slate-200">{email}</span>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-white transition-colors">
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/in/andersonnviana" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-600/50 transition-all hover:bg-white/10"
              >
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span className="text-sm font-bold text-slate-200 uppercase tracking-widest">LinkedIn</span>
              </a>
            </div>

            <div className="pt-2">
              <span className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-600/30">
                Fullstack Developer
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
