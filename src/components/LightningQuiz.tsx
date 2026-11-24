import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api, ApiError } from '../services/api';
import type { AnswerOption, PerguntaPublica } from '../types/api.types';
import { calcularPontosRelampago, shuffle } from '../utils/quiz';
import { playClickSound, playSacredChime } from '../utils/sound';

const LIGHTNING_BEST_KEY = 'carlo_lightning_best_v1';
const QUESTION_SECONDS = 20;
const DISPLAY_LABELS: readonly AnswerOption[] = ['A', 'B', 'C', 'D'];

function loadBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(LIGHTNING_BEST_KEY);
    const val = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(val) && val > 0 ? val : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LIGHTNING_BEST_KEY, String(score));
  } catch {
    // Ignora se localStorage estiver bloqueado
  }
}

const LightningQuiz: React.FC = () => {
  const [perguntas, setPerguntas] = useState<PerguntaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => loadBestScore());
  const [completed, setCompleted] = useState(false);

  const [selectedOption, setSelectedOption] = useState<AnswerOption | null>(null);
  const [correctOption, setCorrectOption] = useState<AnswerOption | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [explicacao, setExplicacao] = useState('');
  const [lastPoints, setLastPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadRound = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setTimeLeft(QUESTION_SECONDS);
    setPoints(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setCompleted(false);
    setSelectedOption(null);
    setCorrectOption(null);
    setFeedback(null);
    setExplicacao('');
    setLastPoints(0);

    try {
      const data = await api.getLightningQuestions(signal);
      setPerguntas(data.perguntas);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível iniciar o Modo Relâmpago. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadRound(controller.signal);
    return () => controller.abort();
  }, [loadRound]);

  // Cronômetro pausa enquanto a resposta está em voo (submitting) ou durante o feedback.
  useEffect(() => {
    if (loading || error || completed || submitting || feedback || perguntas.length === 0) return;

    if (timeLeft <= 0) {
      setFeedback('timeout');
      setCombo(0);
      setLastPoints(0);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [loading, error, completed, submitting, feedback, timeLeft, perguntas.length]);

  const perguntaAtual = perguntas[currentIndex];

  const opcoesEmbaralhadas = useMemo(() => {
    if (!perguntaAtual) return [];
    const shuffled = shuffle<Array<{ originalKey: AnswerOption; text: string }>[number]>([
      { originalKey: 'A', text: perguntaAtual.opcao_a },
      { originalKey: 'B', text: perguntaAtual.opcao_b },
      { originalKey: 'C', text: perguntaAtual.opcao_c },
      { originalKey: 'D', text: perguntaAtual.opcao_d },
    ]);
    return shuffled.map((item, idx) => ({
      ...item,
      displayLabel: DISPLAY_LABELS[idx] ?? item.originalKey,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaAtual?.id, currentIndex]);

  const handleAnswer = async (originalKey: AnswerOption) => {
    if (submitting || feedback || !perguntaAtual) return;
    playClickSound();
    setSubmitting(true);
    setSelectedOption(originalKey);

    try {
      const data = await api.answerQuestion(perguntaAtual.id, originalKey, 'lightning');
      setCorrectOption(data.correct_option);
      setExplicacao(data.explicacao ?? '');

      if (data.correct) {
        playSacredChime();
        const nextCombo = combo + 1;
        const gained = calcularPontosRelampago(nextCombo, timeLeft);
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));
        setHits((prev) => prev + 1);
        setPoints((prev) => prev + gained);
        setLastPoints(gained);
        setFeedback('correct');
      } else {
        setCombo(0);
        setLastPoints(0);
        setFeedback('wrong');
      }
    } catch {
      setSelectedOption(null);
      setCombo(0);
      setFeedback('wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = () => {
    playClickSound();
    setFeedback(null);
    setSelectedOption(null);
    setCorrectOption(null);
    setExplicacao('');
    setLastPoints(0);

    if (currentIndex < perguntas.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(QUESTION_SECONDS);
    } else {
      if (points > bestScore) {
        setBestScore(points);
        saveBestScore(points);
      }
      setCompleted(true);
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#dc2626', '#2563eb', '#eab308'],
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl animate-pulse space-y-6" role="status">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded w-3/4"></div>
        <span className="sr-only">Preparando Modo Relâmpago...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-4" role="alert">
        <p className="font-black uppercase tracking-widest text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadRound()}
          className="px-6 py-3 bg-blue-900 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl text-center text-slate-500 font-bold">
        Nenhuma pergunta disponível para o Modo Relâmpago.
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-6"
      >
        <div className="text-6xl" aria-hidden="true">⚡</div>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-blue-950">
          Rodada Relâmpago Finalizada!
        </h2>
        <div className="text-6xl font-black text-red-600">{points} pts</div>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-widest text-slate-600">
          <span>Acertos: {hits}/{perguntas.length}</span>
          <span>Maior Combo: {maxCombo}x 🔥</span>
          <span className="text-blue-700">Recorde Pessoal: {bestScore} pts</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Modo treino livre: o recorde fica salvo neste navegador sem alterar o XP das temporadas.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => void loadRound()}
            className="px-8 py-4 bg-blue-950 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg"
          >
            ⚡ Jogar Novamente
          </button>
        </div>
      </motion.div>
    );
  }

  const timePercent = (timeLeft / QUESTION_SECONDS) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-widest">
        <span className="text-slate-600">
          ⚡ Relâmpago · {currentIndex + 1}/{perguntas.length}
        </span>
        <div className="flex items-center gap-4">
          {combo >= 2 && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
              Combo {combo}x 🔥
            </span>
          )}
          <span className="text-blue-700">{points} pts</span>
          <span className={timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-slate-700'}>
            ⏱ {timeLeft}s
          </span>
        </div>
      </div>

      {/* Barra de tempo */}
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${timePercent}%` }}
          className={`h-full transition-all duration-500 ${
            timeLeft <= 5 ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-amber-500'
          }`}
        />
      </div>

      <motion.div
        key={`${perguntaAtual.id}-${currentIndex}`}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
      >
        <h2 className="text-2xl md:text-3xl font-black text-blue-950 leading-tight">
          {perguntaAtual.texto_pergunta}
        </h2>

        <div role="radiogroup" aria-label="Alternativas do Modo Relâmpago" className="grid gap-4">
          {opcoesEmbaralhadas.map((opt) => {
            const isSelected = selectedOption === opt.originalKey;
            const isCorrectReveal = Boolean(feedback && correctOption === opt.originalKey);
            const isWrongSelected = feedback === 'wrong' && isSelected;

            return (
              <button
                key={opt.originalKey}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleAnswer(opt.originalKey)}
                disabled={submitting || !!feedback}
                className={`group flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left disabled:cursor-not-allowed ${
                  isCorrectReveal
                    ? 'bg-green-50 border-green-500'
                    : isWrongSelected
                    ? 'bg-red-50 border-red-500'
                    : 'bg-slate-50 border-transparent hover:border-blue-600'
                }`}
              >
                <span
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black ${
                    isCorrectReveal
                      ? 'bg-green-600 text-white'
                      : isWrongSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-blue-900 group-hover:bg-blue-600 group-hover:text-white shadow-sm'
                  }`}
                >
                  {opt.displayLabel}
                </span>
                <span className="font-bold text-slate-800">{opt.text}</span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 border-2 space-y-4 ${
                  feedback === 'correct'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <p
                  className={`font-black uppercase tracking-widest text-xs ${
                    feedback === 'correct' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {feedback === 'correct'
                    ? `✅ Correto! +${lastPoints} pts`
                    : feedback === 'timeout'
                    ? '⏱ Tempo esgotado! Combo reiniciado.'
                    : '❌ Resposta Incorreta! Combo reiniciado.'}
                </p>
                {explicacao && <p className="text-sm text-slate-700 font-medium">{explicacao}</p>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="px-7 py-3 bg-blue-950 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    {currentIndex >= perguntas.length - 1 ? 'Ver Resultado' : 'Próxima →'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LightningQuiz;
