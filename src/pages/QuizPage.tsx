import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Quiz from '../components/Quiz';
import DailyChallenge from '../components/DailyChallenge';
import LightningQuiz from '../components/LightningQuiz';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { QuizMode, TemporadaPublica } from '../types/api.types';
import { getGuestAnswersForQuestions } from '../utils/guestProgress';

const QuizPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeMode, setActiveMode] = useState<QuizMode>('season');
  const [temporadas, setTemporadas] = useState<TemporadaPublica[]>([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressTick, setProgressTick] = useState(0);

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
  }, [fetchTemporadas, user?.id]);

  const handleProgressChange = useCallback(() => {
    setProgressTick((prev) => prev + 1);
    if (user) {
      void fetchTemporadas();
    }
  }, [user, fetchTemporadas]);

  // Calcula progresso de cada temporada (do banco se logado, ou do localStorage se visitante)
  const getSeasonStats = (temp: TemporadaPublica) => {
    void progressTick;
    const total = temp.total_perguntas;
    if (temp.respondidas !== null && user) {
      return {
        total,
        respondidas: temp.respondidas,
        acertos: temp.acertos ?? 0,
        concluida: total > 0 && temp.respondidas >= total,
      };
    }
    const guestAnswers = getGuestAnswersForQuestions(temp.pergunta_ids ?? []);
    const respondidas = guestAnswers.length;
    const acertos = guestAnswers.filter((a) => a.acertou).length;
    return {
      total,
      respondidas,
      acertos,
      concluida: total > 0 && respondidas >= total,
    };
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10 space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Desafio de Fé</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-blue-950">
            Quiz Carlo Acutis
          </h1>
          <p className="text-slate-600 font-medium max-w-2xl mx-auto italic">
            Teste seus conhecimentos sobre o Ciberapóstolo, aprenda curiosidades e suba de nível na sua jornada de santidade.
          </p>
        </div>

        {/* Seletor de Modos de Jogo */}
        <div className="flex flex-wrap justify-center gap-3 mb-10" role="tablist" aria-label="Modos do Quiz">
          {(
            [
              { id: 'season', label: '📚 Temporadas' },
              { id: 'daily', label: '🔥 Desafio Diário' },
              { id: 'lightning', label: '⚡ Modo Relâmpago' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeMode === tab.id}
              onClick={() => setActiveMode(tab.id)}
              className={`px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                activeMode === tab.id
                  ? 'bg-red-600 text-white shadow-xl shadow-red-600/25 scale-105'
                  : 'bg-white text-blue-950 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
              className="shrink-0 px-5 py-2.5 bg-blue-900 hover:bg-red-600 text-white rounded-full font-black text-xs uppercase tracking-widest transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        )}

        {/* Modo Desafio Diário */}
        {activeMode === 'daily' && <DailyChallenge />}

        {/* Modo Relâmpago */}
        {activeMode === 'lightning' && <LightningQuiz />}

        {/* Modo Temporadas */}
        {activeMode === 'season' && (
          <>
            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12" role="status" aria-live="polite">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-36 rounded-3xl bg-slate-200 animate-pulse" />
                ))}
                <span className="sr-only">Carregando temporadas do quiz...</span>
              </div>
            )}

            {!loading && error && (
              <div
                className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-100 text-center space-y-5"
                role="alert"
              >
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

            {!loading && !error && temporadas.length === 0 && (
              <div className="max-w-xl mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-3">
                <p className="font-black uppercase tracking-widest text-sm text-slate-500">
                  Nenhuma temporada ativa disponível no momento.
                </p>
                <p className="text-slate-600 text-sm font-medium">
                  Volte em breve para novos desafios sobre São Carlo Acutis!
                </p>
              </div>
            )}

            {/* Cards de Temporada com descrição e progresso */}
            {!loading && !error && temporadas.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {temporadas.map((temp) => {
                  const stats = getSeasonStats(temp);
                  const pct = stats.total > 0 ? Math.min(100, Math.round((stats.respondidas / stats.total) * 100)) : 0;
                  const isSelected = selectedTemporadaId === temp.id;

                  return (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => setSelectedTemporadaId(temp.id)}
                      className={`text-left p-6 rounded-3xl transition-all border-2 flex flex-col justify-between gap-4 ${
                        isSelected
                          ? 'bg-blue-950 text-white border-blue-950 shadow-2xl shadow-blue-950/20 -translate-y-1'
                          : 'bg-white text-slate-800 border-slate-100 hover:border-blue-300 shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-black uppercase tracking-widest ${
                              isSelected ? 'text-red-400' : 'text-red-600'
                            }`}
                          >
                            {stats.respondidas}/{stats.total} questões
                          </span>
                          {stats.concluida && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                              ✓ Concluída
                            </span>
                          )}
                        </div>
                        <h2 className="font-black text-base leading-snug">{temp.titulo}</h2>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? 'text-blue-200' : 'text-slate-600'}`}>
                          {temp.descricao}
                        </p>
                      </div>

                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200/30">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full transition-all duration-500 ${
                            stats.concluida ? 'bg-emerald-400' : isSelected ? 'bg-red-500' : 'bg-blue-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && !error && selectedTemporadaId && (
              <Quiz temporadaId={selectedTemporadaId} onProgressChange={handleProgressChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
