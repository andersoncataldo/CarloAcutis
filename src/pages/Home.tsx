import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { biographyContent } from '../data/biographyContent';

import carloHero from '../assets/carlo_retrato.jfif'; 
import carloTech from '../assets/carlo_computador.jpg';
import eucaristiaImg from '../assets/eucaristia.jpg';
import tumuloImg from '../assets/túmulo_carlo.png';
import carloInfancia from '../assets/infancia_carlo.jpg';

const Home: React.FC = () => {
  const { hero } = biographyContent;

  const cards = [
    { title: "Vida & História", path: "/vida", img: carloInfancia, color: "bg-red-600" },
    { title: "Eucaristia & Fé", path: "/eucaristia", img: eucaristiaImg, color: "bg-blue-900" },
    { title: "Ciberapóstolo", path: "/millennial", img: carloTech, color: "bg-slate-900" },
    { title: "Cruz & Partida", path: "/doenca", img: "", color: "bg-slate-700" }, // Placeholder img
    { title: "Santo de Jeans", path: "/tumulo", img: "", color: "bg-blue-600" }, // Placeholder img
    { title: "Milagres", path: "/milagres", img: tumuloImg, color: "bg-red-600" },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <header className="relative h-[90vh] flex items-center justify-center bg-blue-900 text-white overflow-hidden m-4 rounded-[3rem] md:rounded-[4rem] shadow-2xl">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src={carloHero} 
            alt="Carlo Acutis Portrait" 
            className="w-full h-full object-cover object-center mix-blend-overlay scale-105"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/20 to-blue-900/60"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl shadow-red-600/20"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Millennial Saint
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-7xl md:text-[12rem] font-black mb-4 tracking-tighter leading-none uppercase italic drop-shadow-2xl"
          >
            Carlo<span className="text-red-500">.</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-3xl font-bold mb-10 text-blue-100 tracking-tight uppercase italic"
          >
            {hero.subtitle}
          </motion.p>
        </div>
      </header>

      {/* Interactive Navigation Cards */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.path}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={card.path} className="group relative block aspect-[4/5] overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl transition-all hover:-translate-y-4 hover:shadow-red-600/10">
                {card.img ? (
                  <img 
                    src={card.img} 
                    alt={card.title} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100" 
                  />
                ) : (
                  <div className={`absolute inset-0 ${card.color} opacity-40 flex items-center justify-center`}>
                    <span className="text-white font-black uppercase tracking-widest opacity-20">Em breve</span>
                  </div>
                )}
                <div className={`absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40 ${card.color}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90"></div>
                
                <div className="absolute bottom-10 left-10 right-10 space-y-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Discover</span>
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                     {card.title}
                   </h3>
                </div>
                
                <div className="absolute top-10 right-10 h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 -translate-y-4 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Section: Espiritualidade */}
      <section className="bg-slate-950 text-white py-32 px-6 overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div className="space-y-10">
            <span className="text-red-500 font-black uppercase tracking-[0.4em] text-xs flex items-center gap-4">
              <span className="w-12 h-[2px] bg-red-600"></span>
              The Vision
            </span>
            <h2 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
              Be <br/> <span className="text-blue-600">Original</span>
            </h2>
            <p className="text-2xl text-slate-400 font-medium leading-relaxed italic border-l-4 border-red-600 pl-8">
              "Todos os homens nascem como originais, mas muitos morrem como fotocópias."
            </p>
            <Link to="/espiritualidade" className="inline-flex bg-white text-slate-950 px-12 py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl hover:shadow-red-600/40">
              Ver Espiritualidade
            </Link>
          </div>
          <motion.div 
            initial={{ rotate: 5, scale: 0.9 }}
            whileInView={{ rotate: 0, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
             <div className="absolute -inset-6 bg-red-600 rounded-[4rem] rotate-3 opacity-10 blur-2xl"></div>
             <img src={carloHero} className="relative rounded-[4rem] shadow-2xl grayscale contrast-125 brightness-75 border-4 border-white/10" alt="Carlo Portrait" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
