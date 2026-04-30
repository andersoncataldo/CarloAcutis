import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Pergunta {
  id: number;
  textoPergunta: string;
  opcaoA: string;
  opcaoB: string;
  opcaoC: string;
  opcaoD: string;
  respostaCorreta: string;
}

interface QuizProps {
  temporadaId: number;
}

const Quiz: React.FC<QuizProps> = ({ temporadaId }) => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchPerguntas = async () => {
      try {
        const response = await api.get(`/quiz/temporada/${temporadaId}/perguntas`);
        setPerguntas(response.data);
      } catch (err) {
        console.error("Erro ao buscar perguntas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerguntas();
  }, [temporadaId]);

  const handleAnswer = async (opcao: string) => {
    if (feedback || !user) return;

    setSelectedOption(opcao);
    try {
      const response = await api.post(`/quiz/responder`, { 
        usuarioId: user.id, 
        perguntaId: perguntas[currentIndex].id,
        respostaSelecionada: opcao 
      });

      const updatedUser = response.data;
      const isCorrect = updatedUser.xp > user.xp;
      
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) setScore(prev => prev + 1);

      await refreshUser();

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        if (currentIndex < perguntas.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setCompleted(true);
        }
      }, 1500);

    } catch (err) {
      console.error("Erro ao processar resposta", err);
      setSelectedOption(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Carregando Questões...</div>;
  if (perguntas.length === 0) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Nenhuma pergunta encontrada para esta temporada.</div>;

  if (completed) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 bg-white rounded-[3rem] shadow-2xl text-center space-y-6">
      <h3 className="text-4xl font-black italic uppercase text-blue-950">Temporada Concluída!</h3>
      <p className="text-slate-500 font-medium">Você acertou {score} de {perguntas.length} perguntas.</p>
      <div className="text-6xl font-black text-red-600">+{score * 100} XP</div>
      <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest">Jogar Novamente</button>
    </motion.div>
  );

  const perguntaAtual = perguntas[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span>Questão {currentIndex + 1} de {perguntas.length}</span>
        <span className="text-blue-600">XP Atual: {user?.xp}</span>
      </div>

      <motion.div 
        key={currentIndex}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-10"
      >
        <h2 className="text-2xl md:text-3xl font-black text-blue-950 leading-tight">
          {perguntaAtual.textoPergunta}
        </h2>

        <div className="grid gap-4">
          {[
            { label: 'A', text: perguntaAtual.opcaoA },
            { label: 'B', text: perguntaAtual.opcaoB },
            { label: 'C', text: perguntaAtual.opcaoC },
            { label: 'D', text: perguntaAtual.opcaoD }
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(opt.label)}
              disabled={!!feedback}
              className={`group flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
                feedback === 'correct' && opt.label === perguntaAtual.respostaCorreta 
                ? 'bg-green-50 border-green-500' 
                : feedback === 'wrong' && opt.label === selectedOption
                ? 'bg-red-50 border-red-500'
                : 'bg-slate-50 border-transparent hover:border-blue-600'
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                feedback === 'correct' && opt.label === perguntaAtual.respostaCorreta
                ? 'bg-green-500 text-white'
                : feedback === 'wrong' && opt.label === selectedOption
                ? 'bg-red-500 text-white'
                : 'bg-white text-blue-900 group-hover:bg-blue-600 group-hover:text-white shadow-sm'
              }`}>
                {opt.label}
              </span>
              <span className="font-bold text-slate-700">{opt.text}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center font-black uppercase tracking-[0.3em] ${feedback === 'correct' ? 'text-green-500' : 'text-red-600'}`}
          >
            {feedback === 'correct' ? 'Correto! +100 XP' : 'Resposta Incorreta'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
