import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  id?: string;
  title: string;
  content: string;
  image?: string;
  reverse?: boolean;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, content, image, reverse, className = "" }) => {
  // Split content by double newlines for paragraph spacing
  const paragraphs = content.split('\n\n');

  return (
    <motion.section 
      id={id} 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`py-16 md:py-24 lg:py-32 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24 ${className}`}
    >
      <div className={`grid lg:grid-cols-2 gap-12 md:gap-20 items-center ${reverse ? 'lg:direction-rtl' : ''}`}>
        
        {/* Content Side */}
        <div className={`space-y-8 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="relative inline-block self-start mb-4">
            <span className="absolute -left-4 md:-left-6 top-0 w-1.5 md:w-2 h-full bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)]"></span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-blue-950 pl-6 md:pl-8 leading-[0.9]">
              {title}
            </h2>
          </div>
          
          <div className="space-y-6">
            {paragraphs.map((para, idx) => (
              <p 
                key={idx}
                className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium text-justify"
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Image Side */}
        {image && (
          <div className={`relative ${reverse ? 'lg:order-1' : 'lg:order-2'}`}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] md:aspect-square rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white group"
            >
              <img 
                src={image} 
                alt={`Imagem ilustrativa de ${title}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent"></div>
            </motion.div>
            
            {/* Abstract background elements */}
            <div className={`absolute -z-10 w-full h-full border-2 border-red-600/20 rounded-[4rem] transition-transform duration-700 group-hover:rotate-3 ${reverse ? 'top-4 right-4' : 'bottom-4 left-4'}`}></div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default Section;
