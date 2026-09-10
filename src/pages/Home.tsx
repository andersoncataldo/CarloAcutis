import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { biographyContent } from '../data/biographyContent';

// Assets
import carloHero from '../assets/Carlo.jpg'; 
import familiaCarlo from '../assets/familiaCarlo.jpg';
import eucaristiaImg from '../assets/eucaristia.png';
import tumuloImg from '../assets/túmulo_carlo.png';

const Home: React.FC = () => {
  const { hero, espiritualidade } = biographyContent;

  const mainCategories = [
    { 
      title: "Vida e Legado", 
      subtitle: "A história do garoto que amava animais, amigos e defendia os fracos.",
      path: "/vida-legado", 
      img: familiaCarlo, 
      color: "from-red-600 to-red-800" 
    },
    { 
      title: "Fé e Devoção", 
      subtitle: "A rodovia para o céu e o amor profundo pela Virgem Maria.",
      path: "/fe-devocao", 
      img: eucaristiaImg, 
      color: "from-blue-800 to-blue-950" 
    },
    { 
      title: "Caminho da Santidade", 
      subtitle: "Ciberapóstolo, milagres e a glória dos altares.",
      path: "/santidade", 
      img: tumuloImg, 
      color: "from-slate-800 to-slate-950" 
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <header className="relative h-[85vh] md:h-[90vh] flex items-center justify-center bg-blue-950 text-white overflow-hidden m-3 md:m-6 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={carloHero} 
            alt="Retrato de Carlo Acutis sorrindo" 
            className="w-full h-full object-cover" 
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl shadow-red-600/30"
          >
            Original Saint
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black mb-8 tracking-tighter leading-none uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            Carlo<span className="text-red-600">.</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl font-bold text-blue-100 tracking-tight uppercase italic max-w-3xl mx-auto leading-relaxed"
          >
            {hero.subtitle}
          </motion.p>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mainCategories.map((cat, index) => (
            <motion.div
              key={cat.path}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={cat.path} className="group relative block aspect-[3/4] overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl transition-all hover:-translate-y-3">
                <img 
                  src={cat.img} 
                  alt={cat.title} 
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute bottom-10 left-10 right-10 space-y-4">
                  <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">Explore Category</span>
                  <h3 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {cat.title}
                  </h3>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                    {cat.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-slate-950 text-white py-32 px-6 overflow-hidden relative m-3 md:m-6 rounded-[2.5rem] md:rounded-[4rem]">
        <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
          <span className="text-red-600 font-black text-[11px] uppercase tracking-[0.5em]">The Philosophy</span>
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-blue-100">
            Be an <span className="text-red-600">Original</span>, not a photocopy.
          </h2>
          <p className="text-xl md:text-3xl text-slate-400 font-serif italic max-w-4xl mx-auto leading-relaxed">
            "{espiritualidade.content.split('\n\n')[0]}"
          </p>
          <div className="pt-8 flex flex-wrap justify-center gap-6">
            <Link to="/fe-devocao" className="px-10 py-5 bg-red-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-red-600/30">
              Conhecer Espiritualidade
            </Link>
            <Link to="/quiz" className="px-10 py-5 bg-white text-blue-950 rounded-full font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl">
              Altar Digital (Quiz)
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full -mr-64 -mt-64 blur-[150px]"></div>
      </section>
    </div>
  );
};

export default Home;
