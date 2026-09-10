import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import iconLogo from '../../assets/icon.png';
import { navigation } from '../../data/navigation';

const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "andersonvcataldo@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 overflow-hidden relative border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
        
        {/* Left Column: Logo & Quote */}
        <div className="md:col-span-4 space-y-8">
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

        {/* Dynamic Categorized Navigation */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {navigation.map((category) => (
            <div key={category.title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 border-b border-red-600/20 pb-2">
                {category.title}
              </h4>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-slate-400 hover:text-white transition-colors font-bold text-[11px] uppercase tracking-widest block py-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Column: Developer Info - Redesigned for Premium Look */}
        <div className="md:col-span-3 space-y-8">
          <div className="relative">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 mb-6">Formas de contato</h4>
            <div className="absolute -left-4 top-0 w-1 h-full bg-red-600/20 rounded-full"></div>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Email Card */}
            <div 
              onClick={handleCopy}
              className="group relative bg-gradient-to-br from-white/[0.03] to-transparent p-5 rounded-[2rem] border border-white/10 hover:border-red-600/30 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#EA4335]/10 flex items-center justify-center text-[#EA4335] group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-1.356 1.518-2.158 2.627-1.376L12 11.13l9.373-6.991c1.11-.83 2.627-.028 2.627 1.376z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">E-mail</p>
                  <p className="text-sm font-bold text-slate-200 truncate">{email}</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-red-600">
                  {copied ? "COPIADO" : "COPIAR"}
                </div>
              </div>
              {/* Decorative background flare */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-colors"></div>
            </div>

            {/* LinkedIn Card */}
            <a 
              href="https://linkedin.com/in/andersonnviana" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-br from-white/[0.03] to-transparent p-5 rounded-[2rem] border border-white/10 hover:border-blue-600/30 transition-all duration-500 overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">LinkedIn</p>
                  <p className="text-sm font-bold text-slate-200 truncate">/in/andersonnviana</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              {/* Decorative background flare */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
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
