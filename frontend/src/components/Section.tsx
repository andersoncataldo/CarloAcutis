import React from 'react';

interface SectionProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, children, className = "" }) => {
  return (
    <section id={id} className={`py-16 px-6 max-w-4xl mx-auto ${className}`}>
      <h2 className="text-3xl font-bold mb-8 text-blue-900 border-l-4 border-blue-600 pl-4">
        {title}
      </h2>
      <div className="text-lg text-gray-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default Section;
