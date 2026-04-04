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
    { title: "Cruz & Partida", path: "/doenca", img: "", color: "bg-slate-700" },
    { title: "Santo de Jeans", path: "/tumulo", img: "", color: "bg-blue-600" },
    { title: "Milagres", path: "/milagres", img: tumuloImg, color: "bg-red-600" },
  ];

  return (
    <div className="pt-20 md:pt-24 lg:pt-28">
      {/* Hero Section - Optimized Mobile View */}
      <header className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] flex items-center justify-center bg-blue-900 text-white overflow-hidden m-3 md:m-6 rounded-[2rem] md:rounded-[4rem] shadow-2xl">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img src={carloHero} alt="Portrait" className="w-full h-full object-cover mix-blend-overlay" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/30 to-blue-900/60"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            Millennial Saint
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] font-black mb-6 tracking-tighter leading-none uppercase italic drop-shadow-2xl"
          >
            Carlo<span className="text-red-500">.</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-xl md:text-2xl font-bold text-blue-100 tracking-tight uppercase italic max-w-2xl mx-auto"
          >
            {hero.subtitle}
          </motion.p>
        </div>
      </header>

      {/* Cards - Balanced Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {cards.map((card, index) => (
            <motion.div key={card.path} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
              <Link to={card.path} className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 shadow-xl transition-all hover:-translate-y-2">
                {card.img ? (
                  <img src={card.img} alt={card.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-90" />
                ) : (
                  <div className={`absolute inset-0 ${card.color} opacity-40 flex items-center justify-center`}>
                    <span className="text-white font-black text-xs uppercase tracking-widest opacity-20">Em breve</span>
                  </div>
                )}
                <div className={`absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40 ${card.color}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 space-y-2">
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Discover</span>
                   <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">{card.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Section - Refined Proportions */}
      <section className="bg-slate-950 text-white py-16 md:py-24 lg:py-32 px-6 overflow-hidden relative m-3 md:m-6 rounded-[2rem] md:rounded-[4rem]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-20 lg:gap-24 items-center relative z-10">
          <div className="space-y-6 md:space-y-10">
            <span className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
              <span className="w-8 md:w-12 h-[2px] bg-red-600"></span>
              The Vision
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none">
              Be <br/> <span className="text-blue-600 text-4xl md:text-7xl lg:text-8xl">Original</span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-400 font-medium leading-relaxed italic border-l-4 border-red-600 pl-6 text-justify">
              "{biographyContent.espiritualidade.quote}"
            </p>
            <div className="pt-4">
              <Link to="/espiritualidade" className="bg-red-600 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-red-600/20 inline-block">
                Ver Espiritualidade
              </Link>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
             <div className="absolute -inset-4 md:-inset-8 bg-red-600 rounded-[2rem] md:rounded-[3rem] rotate-2 opacity-10 blur-2xl"></div>
             <img src={carloHero} className="relative rounded-[2rem] md:rounded-[3rem] shadow-2xl grayscale brightness-75 border-2 border-white/10 w-full" alt="Carlo Portrait" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
