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
  <header className={`relative py-16 md:py-24 lg:py-32 px-6 md:px-10 ${color} text-white overflow-hidden m-3 md:m-6 rounded-[2rem] md:rounded-[4rem] shadow-2xl`}>
    <div className="relative z-10 max-w-6xl mx-auto">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] md:leading-none"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-base md:text-xl lg:text-2xl font-bold opacity-80 mt-6 md:mt-8 uppercase tracking-widest max-w-2xl"
      >
        {subtitle}
      </motion.p>
    </div>
  </header>
);

export const VidaPage = () => {
  const { vida } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32">
      <PageHeader title="Vida & História" subtitle="Um Garoto Como Você" color="bg-red-600" />
      <Section title={vida.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
          <div className="space-y-8 md:space-y-12">
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-slate-700 font-medium border-l-4 border-red-500 pl-6 md:pl-8 text-justify">
              {vida.content}
            </p>
            <div className="p-8 md:p-10 bg-blue-50 rounded-[2rem] md:rounded-[3rem] border-2 border-blue-100 shadow-sm">
               <h4 className="font-black text-blue-900 uppercase text-[10px] tracking-[0.3em] mb-6">Interesses</h4>
               <div className="flex flex-wrap gap-3">
                 {vida.interests.map((interest) => (
                   <span key={interest} className="px-4 py-2 md:px-5 md:py-2.5 bg-white rounded-xl text-xs md:text-sm font-bold text-blue-900 border border-blue-100 shadow-sm">
                     {interest}
                   </span>
                 ))}
               </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white">
            <img src={carloInfancia} alt="Infância" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export const EucaristiaPage = () => {
  const { eucaristia, nossaSenhora } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32">
      <PageHeader title="Fé & Eucaristia" subtitle="A Rodovia para o Céu" color="bg-blue-900" />
      <Section title="O Centro de Tudo" className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
           <div className="space-y-8 md:space-y-12">
              <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-blue-600 leading-tight">"{eucaristia.quote}"</blockquote>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed font-medium text-justify">{eucaristia.content}</p>
           </div>
           <div className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white">
              <img src={eucaristiaImg} className="w-full h-full object-cover" alt="Eucaristia" />
           </div>
        </div>
      </Section>
      <section className="bg-red-600 text-white py-20 md:py-32 lg:py-40 px-6 md:px-12 m-3 md:m-6 rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden relative">
        <div className="max-w-5xl mx-auto space-y-10 md:space-y-16 relative z-10 text-center md:text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-70">Mãe de Deus</span>
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none">{nossaSenhora.title}</h2>
          <p className="text-2xl md:text-4xl lg:text-5xl font-serif italic text-red-100">"{nossaSenhora.quote}"</p>
          <p className="text-lg md:text-xl lg:text-2xl opacity-95 leading-relaxed max-w-4xl text-justify">{nossaSenhora.content}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </section>
    </div>
  );
};

export const MilagresPage = () => {
  const { milagres } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32">
      <PageHeader title="Milagres" subtitle="Sinais de Santidade" color="bg-red-600" />
      <div className="max-w-7xl mx-auto px-6 grid gap-10 md:gap-16 lg:gap-24 pb-20 md:pb-32">
        <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="bg-white p-8 md:p-16 lg:p-20 rounded-[2rem] md:rounded-[4rem] border-2 border-slate-100 shadow-2xl grid lg:grid-cols-2 gap-10 md:gap-16 items-center overflow-hidden">
           <div className="space-y-8 md:space-y-10 text-justify">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">Beatificação // Brasil</div>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-blue-950 leading-none">{milagres.beatificacao.title}</h3>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-600 font-medium leading-relaxed">{milagres.beatificacao.description}</p>
           </div>
           <div className="relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-xl aspect-video h-full min-h-[250px] md:min-h-[400px]">
              <img src={milagreBR} alt="Brasil" className="absolute inset-0 w-full h-full object-cover" />
           </div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="bg-blue-900 text-white p-8 md:p-16 lg:p-20 rounded-[2rem] md:rounded-[4rem] shadow-2xl grid lg:grid-cols-2 gap-10 md:gap-16 items-center overflow-hidden text-justify">
           <div className="relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-xl aspect-video h-full min-h-[250px] md:min-h-[400px] order-2 lg:order-1">
              <img src={milagreCR} alt="Itália" className="absolute inset-0 w-full h-full object-cover" />
           </div>
           <div className="space-y-8 md:space-y-10 order-1 lg:order-2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">Canonização // Itália</div>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">{milagres.canonizacao.title}</h3>
              <p className="text-lg md:text-xl lg:text-2xl text-blue-100 font-medium leading-relaxed">{milagres.canonizacao.description}</p>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export const MillennialPage = () => {
  const { millennial } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32 pb-20 md:pb-32">
      <PageHeader title="Ciberapóstolo" subtitle="O Santo da Internet" color="bg-slate-900" />
      <Section title="Fé na Era Digital" className="max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 lg:gap-24 items-center">
           <div className="lg:col-span-7 space-y-10 md:space-y-14 text-justify">
              <p className="text-lg md:text-xl lg:text-2xl text-slate-700 font-medium leading-relaxed border-l-4 border-blue-600 pl-6 md:pl-10 italic">{millennial.content}</p>
              <div className="flex flex-wrap gap-3 md:gap-5">
                 {millennial.tech.map(t => (
                   <span key={t} className="px-5 py-2.5 md:px-7 md:py-3.5 bg-blue-600 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">{t}</span>
                 ))}
              </div>
           </div>
           <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ opacity: 1, scale: 1 }} className="lg:col-span-5 relative group">
              <img src={carloTech} className="relative rounded-[2rem] md:rounded-[3rem] shadow-2xl grayscale brightness-75 border-2 border-white/10 w-full" alt="Tech" />
           </motion.div>
        </div>
      </Section>
    </div>
  );
};

export const EspiritualidadePage = () => {
  const { espiritualidade } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32">
      <PageHeader title="Espiritualidade" subtitle="Ser Original" color="bg-blue-950" />
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-40 lg:py-56 text-center space-y-12 md:space-y-20">
         <motion.h2 initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase italic tracking-tighter text-red-600 leading-[0.9] md:leading-none">
           "{espiritualidade.quote}"
         </motion.h2>
         <p className="text-lg md:text-2xl lg:text-3xl text-slate-500 font-bold leading-relaxed max-w-4xl mx-auto text-justify md:text-center">
           {espiritualidade.content}
         </p>
      </div>
    </div>
  );
};

export const DoencaPage = () => {
  const { doencaEMorte } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32 pb-20 md:pb-32">
      <PageHeader title="Cruz & Partida" subtitle="O Sorriso Diante da Cruz" color="bg-slate-900" />
      <Section title={doencaEMorte.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
          <div className="space-y-8 md:space-y-12 text-justify">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-red-600 leading-tight">"{doencaEMorte.quote}"</blockquote>
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-slate-700 font-medium border-l-4 border-slate-900 pl-6 md:pl-10">{doencaEMorte.content}</p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-slate-100 aspect-square flex items-center justify-center border-4 border-white">
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Imagem em breve</span>
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export const TumbaPage = () => {
  const { santoDeJeans } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32 pb-20 md:pb-32">
      <PageHeader title="O Santo de Jeans" subtitle="Santidade no Nosso Tempo" color="bg-blue-900" />
      <Section title={santoDeJeans.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-slate-100 aspect-[4/3] flex items-center justify-center order-2 lg:order-1 border-4 border-white">
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Imagem em breve</span>
          </motion.div>
          <div className="space-y-8 md:space-y-10 order-1 lg:order-2 text-justify">
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-slate-700 font-medium border-r-4 border-blue-600 pr-6 md:pr-10 md:text-right">{santoDeJeans.content}</p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export const SantidadePage = () => {
  const { santidade } = biographyContent;
  return (
    <div className="pt-20 md:pt-28 lg:pt-32 space-y-12 md:space-y-20 lg:space-y-32 pb-24 md:pb-40">
      <PageHeader title="Santidade" subtitle="Cronologia da Luz" color="bg-red-600" />
      <div className="max-w-4xl mx-auto px-6 mt-16 md:mt-24 lg:mt-32">
        <Timeline events={santidade.events} />
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-20 md:mt-32 lg:mt-40 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
         <div className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white group">
            <img src={tumuloImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Túmulo" />
         </div>
         <div className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white group">
            <img src={carloRetrato} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 contrast-110" alt="Retrato" />
         </div>
      </div>
    </div>
  );
};
