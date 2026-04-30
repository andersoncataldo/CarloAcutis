import React from 'react';
import Quiz from '../components/Quiz';

const QuizPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Desafio de Fé</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-blue-950">Quiz Carlo Acutis</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">Teste seus conhecimentos sobre o Ciberapóstolo e suba de nível na sua jornada de santidade.</p>
        </div>
        
        <Quiz temporadaId={1} />
      </div>
    </div>
  );
};

export default QuizPage;
