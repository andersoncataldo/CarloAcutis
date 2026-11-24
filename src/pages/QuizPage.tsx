import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Quiz from '../components/Quiz';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { TemporadaPublica } from '../types/api.types';

const QuizPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [temporadas, setTemporadas] = useState<TemporadaPublica[]>([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemporadas = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSeasons(signal);
      setTemporadas(data.temporadas);
      setSelectedTemporadaId((prev) => {
        if (prev && data.temporadas.some((t) => t.id === prev)) return prev;
        return data.temporadas.length > 0 ? data.temporadas[0].id : null;
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao buscar temporadas:', err);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar as temporadas do quiz. Verifique sua conexão e tente novamente.'
      );
      setTemporadas([]);
      setSelectedTemporadaId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchTemporadas(controller.signal);
    return () => controller.abort();
  }, [fetchTemporadas]);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Desafio de Fé</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-blue-950">Quiz Carlo Acutis</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">
            Teste seus conhecimentos sobre o Ciberapóstolo e suba de nível na sua jornada de santidade.
          </p>
        </div>

        {/* Banner discreto para visitantes sem login */}
        {!authLoading && !user && (
          <div className="max-w-3xl mx-auto mb-10 bg-blue-50 border border-blue-100 rounded-3xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="text-sm text-blue-950 font-medium">
              <strong className="font-black uppercase tracking-wider text-xs text-blue-700 block sm:inline sm:mr-2">
                Modo Visitante
              </strong>
              Seu progresso fica salvo neste navegador. Crie uma conta gratuita para salvar na nuvem, conquistar medalhas e participar de ligas paroquiais!
            </div>
            <Link
              to="/cadastro"
              className="shrink-0 px-5 py-2.5 bg-blue-900 hover:bg-red-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        )}

        {/* Loading de temporadas */}
        {loading && (
          <div className="flex flex-wrap justify-center gap-4 mb-12" role="status" aria-live="polite">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 w-48 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
            <span className="sr-only">Carregando temporadas do quiz...</span>
          </div>
        )}

        {/* Estado de erro */}
        {!loading && error && (
          <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-100 text-center space-y-5" role="alert">
            <p className="font-black uppercase tracking-widest text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void fetchTemporadas()}
              className="px-6 py-3 bg-blue-900 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !error && temporadas.length === 0 && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-3">
            <p className="font-black uppercase tracking-widest text-sm text-slate-400">
              Nenhuma temporada ativa disponível no momento.
            </p>
            <p className="text-slate-500 text-sm font-medium">
              Volte em breve para novos desafios sobre São Carlo Acutis!
            </p>
          </div>
        )}

        {/* Seleção de Temporadas */}
        {!loading && !error && temporadas.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {temporadas.map((temp) => (
              <button
                key={temp.id}
                type="button"
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

        {!loading && !error && selectedTemporadaId && <Quiz temporadaId={selectedTemporadaId} />}
      </div>
    </div>
  );
};

export default QuizPage;
