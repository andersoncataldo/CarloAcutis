import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AnswerOption, PerguntaPublica } from '../types/api.types';
import { shuffle, calcularProgresso, progressoPercentual, calcularTitulo } from '../utils/quiz';
import {
  getGuestAnswersForQuestions,
  loadGuestProgress,
  recordGuestAnswer,
  resetGuestSeasonProgress,
} from '../utils/guestProgress';
import { playSacredChime, playClickSound } from '../utils/sound';
import CelebrationToast, { type CelebrationPayload } from './CelebrationToast';

interface QuizProps {
  temporadaId: number;
  onProgressChange?: () => void;
}

const DISPLAY_LABELS: readonly AnswerOption[] = ['A', 'B', 'C', 'D'];

const Quiz: React.FC<QuizProps> = ({ temporadaId, onProgressChange }) => {
  const [perguntas, setPerguntas] = useState<PerguntaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [correctOption, setCorrectOption] = useState<AnswerOption | null>(null);
  const [explicacao, setExplicacao] = useState<string>('');
  const [copiedMsg, setCopiedMsg] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<AnswerOption | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [guestXp, setGuestXp] = useState<number>(() => loadGuestProgress().xp);
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);

  const { user, refreshUser } = useAuth();

  const mountedRef = useRef(true);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const loadSeasonData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setLoadError(null);
      setFeedback(null);
      setFeedbackMsg('');
      setCorrectOption(null);
      setExplicacao('');
      setSelectedOption(null);
      setAnswerError(null);
      setCopiedMsg('');

      try {
        const data = await api.getQuizQuestions(temporadaId, signal);
        if (!mountedRef.current) return;

        setPerguntas(data.perguntas);

        const perguntaIds = data.perguntas.map((p) => p.id);
        const respostas = data.authenticated
          ? data.respostas
          : getGuestAnswersForQuestions(perguntaIds);

        if (!data.authenticated) {
          setGuestXp(loadGuestProgress().xp);
        }

        const progresso = calcularProgresso(perguntaIds, respostas);
        setScore(progresso.score);
        setCurrentIndex(progresso.currentIndex);
        setCompleted(progresso.completed);
      } catch (err) {
        if (!mountedRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Erro ao carregar perguntas:', err);
        setLoadError(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar as perguntas desta temporada. Tente novamente em instantes.'
        );
        setPerguntas([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [temporadaId]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadSeasonData(controller.signal);
    return () => controller.abort();
  }, [loadSeasonData, user?.id]);

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
  }, [perguntaAtual?.id]);

  const handleAdvance = useCallback(() => {
    playClickSound();
    setFeedback(null);
    setSelectedOption(null);
    setFeedbackMsg('');
    setCorrectOption(null);
    setExplicacao('');
    setCurrentIndex((prev) => {
      if (prev < perguntas.length - 1) return prev + 1;
      setCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#dc2626', '#3b82f6', '#eab308', '#10b981'],
      });
      return prev;
    });
  }, [perguntas.length]);

  const handleAnswer = async (originalKey: AnswerOption) => {
    if (submitting || feedback || selectedOption) return;
    if (!perguntaAtual) return;

    playClickSound();
    setSubmitting(true);
    setAnswerError(null);
    setSelectedOption(originalKey);

    try {
      const data = await api.answerQuestion(perguntaAtual.id, originalKey, 'season');
      if (!mountedRef.current) return;

      const isCorrect = data.correct;
      let isFirstAttempt = data.first_attempt;

      if (data.guest) {
        const previousTitle = calcularTitulo(loadGuestProgress().xp);
        const localResult = recordGuestAnswer(perguntaAtual.id, isCorrect);
        isFirstAttempt = localResult.firstAttempt;
        setGuestXp(localResult.state.xp);
        if (localResult.firstAttempt && localResult.nivel !== previousTitle) {
          setCelebration({ leveledUp: true, newNivel: localResult.nivel, achievements: [] });
        }
      } else {
        if (data.leveled_up || (data.unlocked_achievements && data.unlocked_achievements.length > 0)) {
          setCelebration({
            leveledUp: data.leveled_up,
            newNivel: data.nivel,
            achievements: data.unlocked_achievements ?? [],
          });
        }
        refreshUser().catch((err) => console.error('Erro ao atualizar perfil:', err));
      }

      setCorrectOption(data.correct_option);
      setExplicacao(data.explicacao ?? '');
      setFeedback(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        playSacredChime();
        if (isFirstAttempt) {
          setScore((prev) => prev + 1);
          setFeedbackMsg('Correto! +100 XP');
        } else {
          setFeedbackMsg('Correto! (Pergunta já respondida anteriormente)');
        }
      } else {
        setFeedbackMsg('Resposta Incorreta');
      }

      onProgressChange?.();
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Erro ao processar resposta:', err);
      setSelectedOption(null);
      setAnswerError(
        err instanceof ApiError
          ? err.message
          : 'Falha de conexão ao enviar sua resposta. Verifique sua internet.'
      );
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  const handleRestartGuestSeason = () => {
    playClickSound();
    resetGuestSeasonProgress(perguntas.map((p) => p.id));
    setScore(0);
    setCurrentIndex(0);
    setCompleted(false);
    setFeedback(null);
    setSelectedOption(null);
    setCorrectOption(null);
    setExplicacao('');
    setCopiedMsg('');
    onProgressChange?.();
  };

  const handleShare = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/quiz` : '';
    const texto = `Concluí uma temporada do Quiz de São Carlo Acutis com ${score}/${perguntas.length} acertos (+${score * 100} XP)! Venha ser um Ciberapóstolo também: ${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Carlo Acutis | Memorial & Quiz',
          text: texto,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(texto)
        .then(() => {
          if (!mountedRef.current) return;
          setCopiedMsg('Mensagem copiada para compartilhar no WhatsApp!');
          if (copiedTimeoutRef.current !== null) {
            window.clearTimeout(copiedTimeoutRef.current);
          }
          copiedTimeoutRef.current = window.setTimeout(() => {
            if (mountedRef.current) setCopiedMsg('');
          }, 3500);
        })
        .catch(() => {
          if (mountedRef.current) setCopiedMsg('Não foi possível copiar automaticamente.');
        });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-8 animate-pulse" role="status" aria-live="polite">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
          <div className="h-3 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-10">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border-2 border-transparent bg-slate-50">
                <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Carregando perguntas do quiz...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-12 text-center space-y-4" role="alert">
        <p className="font-black uppercase tracking-widest text-red-600">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadSeasonData()}
          className="px-6 py-3 bg-blue-900 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-slate-500">
        Nenhuma pergunta encontrada para esta temporada.
      </div>
    );
  }

  const displayedXp = user ? user.xp : guestXp;
  const displayedNivel = user ? user.nivel : calcularTitulo(guestXp);
  const isLastQuestion = currentIndex >= perguntas.length - 1;

  if (completed) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto p-10 md:p-12 bg-white rounded-[3rem] shadow-2xl text-center space-y-8 relative overflow-hidden"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 relative z-10"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎉</div>
            <h3 className="text-4xl md:text-5xl font-black italic uppercase text-blue-950">Temporada Concluída!</h3>
            <p className="text-slate-600 font-medium">
              Você acertou {score} de {perguntas.length} perguntas.
            </p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
              className="text-6xl md:text-7xl font-black text-red-600 py-4"
            >
              +{score * 100} XP
            </motion.div>

            {!user && (
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Total local: {displayedXp} XP · Título: {displayedNivel}
              </p>
            )}

            <div aria-live="polite" className="min-h-[1.5rem]">
              {copiedMsg && (
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                  {copiedMsg}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
              <button
                type="button"
                onClick={handleShare}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span aria-hidden="true">📱</span> Compartilhar no WhatsApp
              </button>
              {user ? (
                <Link
                  to="/perfil"
                  className="px-8 py-4 bg-blue-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors shadow-lg shadow-blue-950/20"
                >
                  Ver Ranking & Perfil
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRestartGuestSeason}
                    className="px-8 py-4 bg-blue-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors shadow-lg shadow-blue-950/20"
                  >
                    Jogar Novamente
                  </button>
                  <Link
                    to="/cadastro"
                    className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-950 transition-colors shadow-lg shadow-red-600/20"
                  >
                    Criar Conta p/ Ranking
                  </Link>
                </>
              )}
              <Link
                to="/"
                className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
              >
                Voltar ao Início
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"
          ></motion.div>
        </motion.div>
        <CelebrationToast celebration={celebration} onDismiss={() => setCelebration(null)} />
      </>
    );
  }

  const progressPercent = progressoPercentual(currentIndex, perguntas.length);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* ProgressBar */}
      <div
        role="progressbar"
        aria-label="Progresso da temporada no quiz"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={perguntas.length}
        className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          className="h-full bg-blue-600"
        />
      </div>
      <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.15em] text-slate-600">
        <span>
          Questão {currentIndex + 1} de {perguntas.length}
        </span>
        <span className="text-blue-700">
          {user ? `XP Atual: ${displayedXp}` : `XP Local: ${displayedXp}`}
        </span>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
      >
        <h2 className="text-2xl md:text-3xl font-black text-blue-950 leading-tight">
          {perguntaAtual.texto_pergunta}
        </h2>

        <div role="radiogroup" aria-label="Alternativas da pergunta" className="grid gap-4">
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
                className={`group flex items-center gap-6 p-5 md:p-6 rounded-2xl border-2 transition-all text-left disabled:cursor-not-allowed ${
                  isCorrectReveal
                    ? 'bg-green-50 border-green-500'
                    : isWrongSelected
                    ? 'bg-red-50 border-red-500'
                    : 'bg-slate-50 border-transparent hover:border-blue-600'
                }`}
              >
                <span
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black transition-colors ${
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

        {/* Feedback educativo pós-resposta + botão explícito de avançar */}
        <div aria-live="polite">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-3xl p-6 border-2 space-y-4 ${
                  feedback === 'correct'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p
                    className={`font-black uppercase tracking-[0.2em] text-xs ${
                      feedback === 'correct' ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {feedback === 'correct' ? '✅ ' : '❌ '}
                    {feedbackMsg}
                  </p>
                </div>

                {explicacao && (
                  <div className="text-sm text-slate-700 leading-relaxed font-medium">
                    <span className="font-black text-blue-950 uppercase tracking-wider text-xs block mb-1">
                      Você sabia?
                    </span>
                    {explicacao}
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="px-7 py-3.5 bg-blue-950 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-950/20"
                  >
                    {isLastQuestion ? 'Ver Resultado Final 🎉' : 'Próxima Pergunta →'}
                  </button>
                </div>
              </motion.div>
            )}

            {answerError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center font-black uppercase tracking-[0.15em] text-red-600 text-xs pt-2"
              >
                {answerError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <CelebrationToast celebration={celebration} onDismiss={() => setCelebration(null)} />
    </div>
  );
};

export default Quiz;
