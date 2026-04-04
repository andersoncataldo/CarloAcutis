import React from 'react';
import { motion } from 'framer-motion';
import { biographyContent } from '../data/biographyContent';
import Section from '../components/Section';
import Timeline from '../components/Timeline';

// Assets
import carloTech from '../assets/carlo_computador.jpg';
import eucaristiaImg from '../assets/eucaristia.jpg';
import tumuloImg from '../assets/túmulo_carlo.png';
import carloInfancia from '../assets/infancia_carlo.jpg';
import milagreBR from '../assets/milagre_BR.jpg';
import milagreCR from '../assets/milagre_CR.jpg';
import carloRetrato from '../assets/carlo_retrato.jfif';

const PageHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <header className={`relative py-32 px-6 ${color} text-white overflow-hidden m-4 rounded-[3rem]`}>
    <div className="relative z-10 max-w-5xl mx-auto">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl md:text-2xl font-bold opacity-80 mt-4 uppercase tracking-widest"
      >
        {subtitle}
      </motion.p>
    </div>
  </header>
);

export const VidaPage = () => {
  const { vida } = biographyContent;
  return (
    <div className="pt-24 space-y-12">
      <PageHeader title="Vida & História" subtitle="Um Garoto Como Você" color="bg-red-600" />
      <Section title={vida.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-2xl leading-relaxed text-slate-700 font-medium border-l-4 border-red-500 pl-6">{vida.content}</p>
            <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-100">
               <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-4">Interesses</h4>
               <div className="flex flex-wrap gap-2">
                 {vida.interests.map((interest) => (
                   <span key={interest} className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-blue-900 border border-blue-100 shadow-sm">
                     {interest}
                   </span>
                 ))}
               </div>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
          >
            <img src={carloInfancia} alt="Carlo Infância" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export const EucaristiaPage = () => {
  const { eucaristia, nossaSenhora } = biographyContent;
  return (
    <div className="pt-24 space-y-12">
      <PageHeader title="Fé & Eucaristia" subtitle="A Rodovia para o Céu" color="bg-blue-900" />
      <Section title="O Centro de Tudo" className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <blockquote className="text-4xl font-serif italic text-blue-600 leading-tight">"{eucaristia.quote}"</blockquote>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">{eucaristia.content}</p>
           </div>
           <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              <img src={eucaristiaImg} className="w-full h-full object-cover" alt="Eucaristia" />
           </div>
        </div>
      </Section>
      <section className="bg-red-600 text-white py-24 px-6 m-4 rounded-[4rem] shadow-2xl overflow-hidden relative">
        <div className="max-w-5xl mx-auto space-y-10 relative z-10 text-center md:text-left">
          <span className="text-xs font-black uppercase tracking-[0.5em] opacity-60">Mãe de Deus</span>
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">{nossaSenhora.title}</h2>
          <p className="text-3xl md:text-5xl font-serif italic text-red-100">"{nossaSenhora.quote}"</p>
          <p className="text-xl md:text-2xl opacity-90 leading-relaxed max-w-3xl">{nossaSenhora.content}</p>
        </div>
      </section>
    </div>
  );
};

export const MilagresPage = () => {
  const { milagres } = biographyContent;
  return (
    <div className="pt-24 space-y-12">
      <PageHeader title="Milagres" subtitle="Sinais de Santidade" color="bg-red-600" />
      <div className="max-w-7xl mx-auto px-6 grid gap-12 pb-24">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-2xl grid lg:grid-cols-2 gap-12 items-center overflow-hidden"
        >
           <div className="space-y-8">
              <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">Beatificação // Brasil</div>
              <h3 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-blue-950 leading-none">{milagres.beatificacao.title}</h3>
              <p className="text-xl text-slate-600 font-medium leading-relaxed">{milagres.beatificacao.description}</p>
           </div>
           <div className="relative rounded-[3rem] overflow-hidden shadow-xl aspect-video md:aspect-auto h-full min-h-[400px]">
              <img src={milagreBR} alt="Milagre Brasil" className="absolute inset-0 w-full h-full object-cover" />
           </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="bg-blue-900 text-white p-12 rounded-[4rem] shadow-2xl grid lg:grid-cols-2 gap-12 items-center overflow-hidden"
        >
           <div className="relative rounded-[3rem] overflow-hidden shadow-xl aspect-video md:aspect-auto h-full min-h-[400px]">
              <img src={milagreCR} alt="Milagre Costa Rica" className="absolute inset-0 w-full h-full object-cover" />
           </div>
           <div className="space-y-8">
              <div className="inline-block px-4 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">Canonização // Itália</div>
              <h3 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{milagres.canonizacao.title}</h3>
              <p className="text-xl text-blue-100 font-medium leading-relaxed">{milagres.canonizacao.description}</p>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export const MillennialPage = () => {
  const { millennial } = biographyContent;
  return (
    <div className="pt-24 space-y-12 pb-24">
      <PageHeader title="Ciberapóstolo" subtitle="O Santo da Internet" color="bg-slate-900" />
      <Section title="Fé na Era Digital" className="max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
           <div className="lg:col-span-7 space-y-10">
              <p className="text-2xl text-slate-700 font-medium leading-relaxed border-l-4 border-blue-600 pl-8 italic">{millennial.content}</p>
              <div className="flex flex-wrap gap-4">
                 {millennial.tech.map(t => (
                   <span key={t} className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20">{t}</span>
                 ))}
              </div>
           </div>
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="lg:col-span-5 relative group"
           >
              <div className="absolute -inset-4 bg-blue-600 rounded-[4rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
              <img src={carloTech} className="relative rounded-[3rem] shadow-2xl grayscale brightness-75 group-hover:grayscale-0 transition-all duration-700 border-4 border-white/10" alt="Tech" />
           </motion.div>
        </div>
      </Section>
    </div>
  );
};

export const EspiritualidadePage = () => {
  const { espiritualidade } = biographyContent;
  return (
    <div className="pt-24 space-y-12">
      <PageHeader title="Espiritualidade" subtitle="Ser Original" color="bg-blue-950" />
      <div className="max-w-4xl mx-auto px-6 py-32 text-center space-y-16">
         <motion.h2 
           initial={{ scale: 0.8, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-red-600 leading-none"
         >
           "{espiritualidade.quote}"
         </motion.h2>
         <p className="text-2xl md:text-3xl text-slate-500 font-bold leading-relaxed max-w-3xl mx-auto">
           {espiritualidade.content}
         </p>
      </div>
    </div>
  );
};

export const DoencaPage = () => {
  const { doencaEMorte } = biographyContent;
  return (
    <div className="pt-24 space-y-12 pb-24">
      <PageHeader title="Cruz & Partida" subtitle="O Sorriso Diante da Cruz" color="bg-slate-900" />
      <Section title={doencaEMorte.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <blockquote className="text-3xl font-serif italic text-red-600 leading-tight">"{doencaEMorte.quote}"</blockquote>
            <p className="text-2xl leading-relaxed text-slate-700 font-medium border-l-4 border-slate-900 pl-6">{doencaEMorte.content}</p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-slate-200 aspect-square flex items-center justify-center"
          >
            <span className="text-slate-400 font-black uppercase tracking-widest">Imagem em breve</span>
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export const TumbaPage = () => {
  const { santoDeJeans } = biographyContent;
  return (
    <div className="pt-24 space-y-12 pb-24">
      <PageHeader title="O Santo de Jeans" subtitle="Santidade no Nosso Tempo" color="bg-blue-900" />
      <Section title={santoDeJeans.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-slate-200 aspect-[4/3] flex items-center justify-center order-2 lg:order-1"
          >
            <span className="text-slate-400 font-black uppercase tracking-widest">Imagem em breve</span>
          </motion.div>
          <div className="space-y-8 order-1 lg:order-2">
            <p className="text-2xl leading-relaxed text-slate-700 font-medium border-r-4 border-blue-600 pr-6 text-right">{santoDeJeans.content}</p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export const SantidadePage = () => {
  const { santidade } = biographyContent;
  return (
    <div className="pt-24 space-y-12 pb-32">
      <PageHeader title="Santidade" subtitle="Cronologia da Luz" color="bg-red-600" />
      <div className="max-w-3xl mx-auto px-6 mt-24">
        <Timeline events={santidade.events} />
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-32 grid lg:grid-cols-2 gap-12 items-center">
         <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white group">
            <img src={tumuloImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Túmulo" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent"></div>
         </div>
         <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white group">
            <img src={carloRetrato} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 contrast-110" alt="Retrato Carlo" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 to-transparent"></div>
         </div>
      </div>
    </div>
  );
};
