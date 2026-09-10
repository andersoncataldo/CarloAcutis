import React from 'react';
import { motion } from 'framer-motion';
import { biographyContent } from '../data/biographyContent';
import Section from '../components/Section';
import Timeline from '../components/Timeline';

// Assets
import carloPortrait from '../assets/carlo_retrato.png';
import carloTech from '../assets/carlo_computador.png';
import eucaristiaImg from '../assets/eucaristia.png';
import tumuloImg from '../assets/túmulo_carlo.png';
import familiaCarlo from '../assets/familiaCarlo.jpg';
import maeCarlo from '../assets/MaeCarlo.png';
import petCarlo from '../assets/PetCarlo.png';
import amigosCarlo from '../assets/AmigosCarlo.jpg';
import amigosCarlo2 from '../assets/AmigosCarlo2.jpg';
import saintCarlo from '../assets/saintCarlo.jpeg';
import milagreBR from '../assets/milagre_BR.png';
import milagreCR from '../assets/milagre_CR.png';

const PageHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <header className={`relative py-24 md:py-32 lg:py-48 px-6 md:px-10 ${color} text-white overflow-hidden m-3 md:m-6 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl`}>
    <div className="relative z-10 max-w-6xl mx-auto text-center md:text-left">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
      >
        Exclusive Session
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] md:leading-none"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-2xl lg:text-3xl font-bold opacity-80 mt-8 md:mt-10 uppercase tracking-widest max-w-3xl mx-auto md:mx-0 leading-tight"
      >
        {subtitle}
      </motion.p>
    </div>
    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
  </header>
);

export const VidaLegadoPage = () => {
  const { infanciaEPais, iniciativaNaFe, animais, amigosEEscola } = biographyContent;
  return (
    <div className="pt-24 space-y-4">
      <PageHeader title="Vida e Legado" subtitle="O Início da Jornada e os Valores de Carlo" color="bg-red-600" />
      <Section id="vida-familiar" title={infanciaEPais.title} content={infanciaEPais.content} image={familiaCarlo} />
      <Section id="iniciativa-fe" title={iniciativaNaFe.title} content={iniciativaNaFe.content} image={maeCarlo} reverse />
      <Section id="animais" title={animais.title} content={animais.content} image={petCarlo} />
      <Section id="amigos-escola" title={amigosEEscola.title} content={amigosEEscola.content} image={amigosCarlo} reverse />
    </div>
  );
};

export const FeDevocaoPage = () => {
  const { eucaristia, nossaSenhora, espiritualidade, comunicacao } = biographyContent;
  return (
    <div className="pt-24 space-y-4">
      <PageHeader title="Fé e Devoção" subtitle="A Conexão Profunda com o Divino" color="bg-blue-900" />
      <Section id="eucaristia" title={eucaristia.title} content={eucaristia.content} image={eucaristiaImg} />
      <Section id="nossa-senhora" title={nossaSenhora.title} content={nossaSenhora.content} image={saintCarlo} reverse />
      <Section id="espiritualidade" title={espiritualidade.title} content={espiritualidade.content} image={carloPortrait} />
      <Section id="comunicacao" title={comunicacao.title} content={comunicacao.content} image={carloTech} reverse />
    </div>
  );
};

export const SantidadePage = () => {
  const { millennial, doencaEMorte, santoDeJeans, conexaoBrasil, santidade } = biographyContent;
  return (
    <div className="pt-24 space-y-4">
      <PageHeader title="Santidade" subtitle="O Caminho para a Glória dos Altares" color="bg-slate-900" />
      <Section id="millennial" title={millennial.title} content={millennial.content} image={amigosCarlo2} />
      <Section id="cruz-partida" title={doencaEMorte.title} content={doencaEMorte.content} image={saintCarlo} reverse />
      <Section id="santo-jeans" title={santoDeJeans.title} content={santoDeJeans.content} image={tumuloImg} />
      
      <div id="milagres" className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-blue-950 mb-16 text-center">Sinais do Céu</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl">
            <div className="aspect-video rounded-3xl overflow-hidden mb-8 border-4 border-white shadow-lg">
               <img 
                 src={milagreBR} 
                 className="w-full h-full object-cover" 
                 alt="Criança sendo curada por intercessão de Carlo Acutis no Brasil" 
                 loading="lazy"
                 decoding="async"
               />
            </div>
            <h4 className="text-3xl font-black uppercase italic text-blue-950 mb-4">Brasil: Mattheus</h4>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">A cura do menino Mattheus em Campo Grande (MS), o primeiro milagre que levou Carlo à beatificação.</p>
          </div>
          <div className="bg-blue-950 p-10 rounded-[3rem] text-white shadow-2xl">
            <div className="aspect-video rounded-3xl overflow-hidden mb-8 border-4 border-blue-900/50 shadow-lg grayscale">
               <img 
                 src={milagreCR} 
                 className="w-full h-full object-cover" 
                 alt="Mãe rezando no túmulo de Carlo Acutis em Assis" 
                 loading="lazy"
                 decoding="async"
               />
            </div>
            <h4 className="text-3xl font-black uppercase italic text-red-600 mb-4">Costa Rica: Valeria</h4>
            <p className="text-lg text-blue-100/70 leading-relaxed font-medium">O milagre da cura de Valeria, após sua mãe rezar no túmulo de Carlo em Assis, confirmando sua canonização.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <Timeline events={santidade.events} />
      </div>

      <Section id="conexao-brasil" title={conexaoBrasil.title} content={conexaoBrasil.content} image={milagreBR} reverse />
    </div>
  );
};
