import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-6 pt-24">
    <div className="text-center space-y-6 max-w-md">
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Erro 404</span>
      <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-blue-950">
        Página não encontrada
      </h1>
      <p className="text-slate-500 font-medium">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="inline-block px-8 py-4 bg-blue-900 hover:bg-blue-800 transition-colors text-white rounded-2xl font-black uppercase tracking-widest text-xs"
      >
        Voltar para o início
      </Link>
    </div>
  </div>
);

export default NotFound;
