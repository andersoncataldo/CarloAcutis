import React from 'react';
import { motion } from 'framer-motion';
import { biographyContent } from '../data/biographyContent';
import Section from '../components/Section';
import Timeline from '../components/Timeline';

// Assets
import carloHero from '../assets/carlo_acutis.jpg';
import carloTech from '../assets/carlo_computador.jpg';
import eucaristiaImg from '../assets/eucaristia.jpg';
import tumuloImg from '../assets/túmulo_carlo.png';

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
  const { vida, devocoes } = biographyContent;
  return (
    <div className="pt-24 space-y-12">
      <PageHeader title="Vida & História" subtitle="O início da jornada" color="bg-red-600" />
      <Section title={vida.title} className="max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <p className="text-2xl leading-relaxed text-slate-700 font-medium">{vida.content}</p>
            <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-100">
               <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-4">Interesses</h4>
               <p className="text-slate-600 font-bold">{vida.interests}</p>
            </div>
          </div>
          <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl">
            <h4 className="text-3xl font-black text-red-500 uppercase italic mb-8">Devoções</h4>
            <ul className="space-y-6">
              {devocoes.saints.map(s => (
                <li key={s} className="text-xl font-bold uppercase tracking-tight flex items-center gap-4">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span> {s}
                </li>
              ))}
            </ul>
          </div>
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
        <div className="grid lg:grid-cols-2 gap-12">
           <div className="space-y-8">
              <blockquote className="text-4xl font-serif italic text-blue-600 leading-tight">"{eucaristia.quote}"</blockquote>
              <p className="text-xl text-slate-600 leading-relaxed">{eucaristia.content}</p>
           </div>
           <div className="relative rounded-[3rem] overflow-hidden">
              <img src={eucaristiaImg} className="w-full h-full object-cover" alt="Eucaristia" />
           </div>
        </div>
      </Section>
      <section className="bg-red-600 text-white py-24 px-6 m-4 rounded-[3rem]">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Nossa Senhora</h2>
          <p className="text-3xl font-serif italic">"{nossaSenhora.quote}"</p>
          <p className="text-xl opacity-90 leading-relaxed">{nossaSenhora.content}</p>
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
        <div className="bg-white p-12 rounded-[4rem] border-4 border-slate-100 shadow-xl grid md:grid-cols-2 gap-12 items-center">
           <div className="space-y-6">
              <span className="text-red-500 font-black uppercase tracking-widest text-xs italic">Beatificação // Brasil</span>
              <h3 className="text-5xl font-black italic uppercase tracking-tighter text-blue-950">{milagres.beatificacao.title}</h3>
              <p className="text-xl text-slate-600 font-medium leading-relaxed">{milagres.beatificacao.description}</p>
           </div>
           <div className="bg-slate-100 aspect-video rounded-[3rem] flex items-center justify-center text-8xl">🇧🇷</div>
        </div>
        <div className="bg-blue-900 text-white p-12 rounded-[4rem] shadow-2xl grid md:grid-cols-2 gap-12 items-center">
           <div className="order-2 md:order-1 bg-white/10 aspect-video rounded-[3rem] flex items-center justify-center text-8xl">🇮🇹</div>
           <div className="order-1 md:order-2 space-y-6">
              <span className="text-red-500 font-black uppercase tracking-widest text-xs italic">Canonização // Itália</span>
              <h3 className="text-5xl font-black italic uppercase tracking-tighter">{milagres.canonizacao.title}</h3>
              <p className="text-xl text-blue-100 font-medium leading-relaxed">{milagres.canonizacao.description}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export const MillennialPage = () => {
  const { millennial } = biographyContent;
  return (
    <div className="pt-24 space-y-12">
      <PageHeader title="Ciberapóstolo" subtitle="O Santo da Internet" color="bg-slate-900" />
      <Section title="Fé na Era Digital" className="max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12">
           <div className="lg:col-span-7 space-y-8">
              <p className="text-2xl text-slate-700 font-medium leading-relaxed">{millennial.content}</p>
              <div className="flex flex-wrap gap-4">
                 {millennial.tech.map(t => (
                   <span key={t} className="px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">{t}</span>
                 ))}
              </div>
           </div>
           <div className="lg:col-span-5">
              <img src={carloTech} className="rounded-[3rem] shadow-2xl grayscale" alt="Tech" />
           </div>
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
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-12">
         <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-red-600 leading-none">
           "{espiritualidade.quote}"
         </h2>
         <p className="text-2xl text-slate-600 font-bold leading-relaxed">
           {espiritualidade.content}
         </p>
      </div>
    </div>
  );
};

export const SantidadePage = () => {
  const { santidade } = biographyContent;
  return (
    <div className="pt-24 space-y-12 pb-24">
      <PageHeader title="Santidade" subtitle="Cronologia da Luz" color="bg-red-600" />
      <div className="max-w-3xl mx-auto px-6 mt-20">
        <Timeline events={santidade.events} />
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-32">
         <img src={tumuloImg} className="w-full rounded-[4rem] shadow-2xl border-8 border-white" alt="Túmulo" />
      </div>
    </div>
  );
};
