import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { biographyContent } from '../data/biographyContent';

import carloHero from '../assets/carlo_acutis.jpg';
import carloTech from '../assets/carlo_computador.jpg';
import eucaristiaImg from '../assets/eucaristia.jpg';
import tumuloImg from '../assets/túmulo_carlo.png';

const Home: React.FC = () => {
  const { hero } = biographyContent;

  const cards = [
    { title: "Vida & História", path: "/vida", img: carloHero, color: "bg-red-600" },
    { title: "Eucaristia & Fé", path: "/eucaristia", img: eucaristiaImg, color: "bg-blue-900" },
    { title: "Milagres", path: "/milagres", img: tumuloImg, color: "bg-red-600" },
    { title: "Ciberapóstolo", path: "/millennial", img: carloTech, color: "bg-slate-900" },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <header className="relative h-[85vh] flex items-center justify-center bg-blue-900 text-white overflow-hidden m-4 rounded-[3rem] md:rounded-[4rem]">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img src={carloHero} alt="Carlo" className="w-full h-full object-cover mix-blend-overlay" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-blue-900/50"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            Millennial Saint
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-7xl md:text-[11rem] font-black mb-4 tracking-tighter leading-none uppercase italic"
          >
            Carlo<span className="text-red-500">.</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-3xl font-bold mb-10 text-blue-100/80 tracking-tight uppercase italic"
          >
            {hero.subtitle}
          </motion.p>
        </div>
      </header>

      {/* Interactive Navigation Cards */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.path}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={card.path} className="group relative block aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-200 shadow-2xl transition-all hover:-translate-y-4">
                <img 
                  src={card.img} 
                  alt={card.title} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" 
                />
                <div className={`absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40 ${card.color}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute bottom-8 left-8 right-8 space-y-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Explorar</span>
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                     {card.title}
                   </h3>
                </div>
                
                <div className="absolute top-8 right-8 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100">
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
      <section className="bg-slate-950 text-white py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <span className="text-red-500 font-black uppercase tracking-[0.4em] text-xs">Authenticity</span>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              Original <br/> <span className="text-blue-600">vs</span> <br/> Fotocópia
            </h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed italic border-l-2 border-red-600 pl-6">
              "Todos os homens nascem como originais, mas muitos morrem como fotocópias."
            </p>
            <Link to="/espiritualidade" className="inline-block bg-white text-slate-950 px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Ver Espiritualidade
            </Link>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-red-600 rounded-[3rem] rotate-3 opacity-20"></div>
             <img src={carloHero} className="relative rounded-[3rem] shadow-2xl grayscale brightness-75" alt="Carlo" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
