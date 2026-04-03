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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`py-20 px-6 max-w-4xl mx-auto ${className}`}
    >
      <div className="flex flex-col gap-8">
        <div className="relative inline-block">
          <span className="absolute -left-4 top-0 w-1.5 h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></span>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-blue-950 pl-6">
            {title}
          </h2>
        </div>
        <div className="text-xl text-slate-600 leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </motion.section>
  );
};

export default Section;
