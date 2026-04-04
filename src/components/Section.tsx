import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, children, className = "" }) => {
  return (
    <motion.section 
      id={id} 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`py-12 md:py-20 lg:py-28 px-6 md:px-12 max-w-7xl mx-auto ${className}`}
    >
      <div className="flex flex-col gap-10 md:gap-14 lg:gap-20">
        <div className="relative inline-block self-start">
          <span className="absolute -left-4 md:-left-6 top-0 w-1.5 md:w-2 h-full bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)]"></span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-blue-950 pl-6 md:pl-8 leading-none">
            {title}
          </h2>
        </div>
        <div className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium text-justify hyphens-auto">
          {children}
        </div>
      </div>
    </motion.section>
  );
};

export default Section;
