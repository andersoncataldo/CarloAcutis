import React, { useState, useEffect } from 'react';
import Quiz from '../components/Quiz';
import { supabase } from '../services/supabase';

interface Temporada {
  id: number;
  titulo: string;
  descricao: string;
}

const QuizPage: React.FC = () => {
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemporadas = async () => {
      try {
        const { data, error } = await supabase
          .from('temporadas')
          .select('id, titulo, descricao')
          .order('id', { ascending: true });

        if (error) {
          console.error("Erro ao buscar temporadas", error);
        } else if (data && data.length > 0) {
          setTemporadas(data);
          setSelectedTemporadaId(data[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar temporadas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemporadas();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Desafio de Fé</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-blue-950">Quiz Carlo Acutis</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">Teste seus conhecimentos sobre o Ciberapóstolo e suba de nível na sua jornada de santidade.</p>
        </div>

        {/* Seleção de Temporadas */}
        {!loading && temporadas.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {temporadas.map((temp) => (
              <button
                key={temp.id}
                onClick={() => setSelectedTemporadaId(temp.id)}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  selectedTemporadaId === temp.id
                    ? 'bg-blue-900 text-white shadow-xl shadow-blue-900/20 scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {temp.titulo}
              </button>
            ))}
          </div>
        )}
        
        {selectedTemporadaId && <Quiz temporadaId={selectedTemporadaId} />}
      </div>
    </div>
  );
};

export default QuizPage;
