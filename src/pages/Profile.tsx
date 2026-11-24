import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { ConquistaItem, RankingMembro } from '../types/api.types';
import { calcularProgressoTitulo } from '../utils/quiz';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '../utils/sound';
import CelebrationToast, { type CelebrationPayload } from '../components/CelebrationToast';

const Profile: React.FC = () => {
  const { user, signOut, refreshUser, streak } = useAuth();
  const [ranking, setRanking] = useState<RankingMembro[]>([]);
  const [ligaNome, setLigaNome] = useState('');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);
  const [showSairModal, setShowSairModal] = useState(false);
  const [conquistas, setConquistas] = useState<ConquistaItem[]>([]);
  const [conquistasLoading, setConquistasLoading] = useState(false);

  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    playClickSound();
    showToast(next ? 'Efeitos sonoros ativados!' : 'Efeitos sonoros silenciados.', 'success');
  };

  const handleCompartilharPerfil = () => {
    playClickSound();
    if (!user) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const streakDias = streak ? `${streak.streak_atual} dias de streak` : '';
    const msg = `Sou ${user.nivel} no Memorial Digital de São Carlo Acutis (${user.xp} XP${streakDias ? `, com ${streakDias}` : ''})! Junte-se a nós: ${shareUrl}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Meu Perfil | Carlo Acutis',
          text: msg,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(msg);
      showToast('Perfil copiado para compartilhar!', 'success');
    }
  };

  useEffect(() => {
    if (!showSairModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSairModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSairModal]);

  const fetchRanking = useCallback(async (signal?: AbortSignal) => {
    if (!user?.liga_id) {
      setRanking([]);
      return;
    }
    setRankingLoading(true);
    try {
      const data = await api.getLeagueRanking(signal);
      setRanking(data.ranking);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao buscar ranking:', err);
    } finally {
      setRankingLoading(false);
    }
  }, [user?.liga_id]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchRanking(controller.signal);
    return () => controller.abort();
  }, [fetchRanking]);

  const fetchConquistas = useCallback(async (signal?: AbortSignal) => {
    if (!user) return;
    setConquistasLoading(true);
    try {
      const data = await api.getAchievements(signal);
      setConquistas(data.conquistas);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao buscar conquistas:', err);
    } finally {
      setConquistasLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchConquistas(controller.signal);
    return () => controller.abort();
  }, [fetchConquistas]);

  const handleCriarLiga = async () => {
    if (!ligaNome.trim() || !user) return;
    setLoading(true);
    try {
      const res = await api.createLeague(ligaNome.trim());
      await refreshUser();
      await fetchConquistas();
      setLigaNome('');
      showToast('Liga criada com sucesso!', 'success');
      if (res.unlocked_achievements && res.unlocked_achievements.length > 0) {
        setCelebration({ achievements: res.unlocked_achievements });
      }
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof ApiError ? err.message : 'Não foi possível criar a liga. Tente novamente.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarLiga = async () => {
    if (!codigoAcesso.trim() || !user) return;
    setLoading(true);
    try {
      const res = await api.joinLeague(codigoAcesso.trim().toUpperCase());
      await refreshUser();
      await fetchConquistas();
      setCodigoAcesso('');
      showToast('Entrou na liga com sucesso!', 'success');
      if (res.unlocked_achievements && res.unlocked_achievements.length > 0) {
        setCelebration({ achievements: res.unlocked_achievements });
      }
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Erro ao entrar na liga. Verifique o código e tente novamente.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSairLiga = async () => {
    setLoading(true);
    try {
      await api.leaveLeague();
      await refreshUser();
      showToast('Você saiu da liga com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      showToast(err instanceof ApiError ? err.message : 'Erro ao sair da liga.', 'error');
    } finally {
      setLoading(false);
      setShowSairModal(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código copiado!', 'success');
  };

  if (!user) return null;

  const progresso = calcularProgressoTitulo(user.xp);
  const meuCodigoLiga = user.liga?.codigo_acesso ?? null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center text-4xl md:text-5xl font-black italic">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 bg-red-500/15 px-3 py-1 rounded-full">
                  {user.nivel}
                </span>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">{user.nome}</h1>
                <p className="text-blue-200 font-medium opacity-80">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCompartilharPerfil}
                className="px-5 py-3 bg-white/10 hover:bg-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
                title="Compartilhar seu progresso nas redes sociais"
              >
                <span>📱</span> Compartilhar
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2 ${
                  soundOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-200 border-red-500/30'
                }`}
                title={soundOn ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
              >
                <span>{soundOn ? '🔔' : '🔕'}</span>
                <span>{soundOn ? 'Som Ativo' : 'Mudo'}</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                className="px-6 py-3 bg-white/10 hover:bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
              >
                Sair
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* XP & Progress */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu Progresso</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black italic text-blue-950">{user.xp} XP</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">{progresso.tituloAtual}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Progresso para o próximo título"
                  aria-valuenow={Math.round(progresso.percentual)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso.percentual}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-red-600"
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  {progresso.proximoTitulo ? (
                    <>
                      <span>Próximo: {progresso.proximoTitulo}</span>
                      <span className="text-blue-700 font-black">Faltam {progresso.xpFaltante} XP</span>
                    </>
                  ) : (
                    <span className="text-amber-600 font-black uppercase tracking-wider">
                      Título máximo alcançado!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Streak */}
            {streak && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Sequência de Fé</h2>
                  <div className="text-3xl font-black italic text-blue-950">
                    {streak.streak_atual} {streak.streak_atual === 1 ? 'dia' : 'dias'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1">Recorde: {streak.maior_streak} dias</div>
                </div>
                <div className="text-5xl" aria-hidden="true">🔥</div>
              </div>
            )}

            {/* Conquistas */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conquistas</h2>
              {conquistasLoading ? (
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {conquistas.map((c) => (
                    <div
                      key={c.id}
                      title={`${c.nome} — ${c.descricao}${c.conquistada ? ' (Conquistada)' : ' (Pendente)'}`}
                      aria-label={`${c.nome}: ${c.conquistada ? 'Conquistada' : 'Pendente'}`}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                        c.conquistada
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-slate-50 border-transparent grayscale opacity-30'
                      }`}
                    >
                      {c.icone}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liga Management */}
            {!user.liga ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ligas Paroquiais</h2>

                <div className="space-y-4">
                  <label htmlFor="nova-liga-nome" className="sr-only">Nome da nova Liga</label>
                  <input
                    id="nova-liga-nome"
                    type="text"
                    maxLength={100}
                    placeholder="Nome da nova Liga"
                    value={ligaNome}
                    onChange={(e) => setLigaNome(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCriarLiga}
                    disabled={loading}
                    className="w-full py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Liga'}
                  </button>
                  <div className="relative py-2 text-center">
                    <span className="bg-white px-2 text-[10px] text-slate-300 font-bold uppercase">ou</span>
                    <hr className="absolute top-1/2 w-full -z-10 border-slate-100" />
                  </div>
                  <label htmlFor="entrar-liga-codigo" className="sr-only">Código de Acesso da Liga</label>
                  <input
                    id="entrar-liga-codigo"
                    type="text"
                    maxLength={16}
                    placeholder="Código de Acesso"
                    value={codigoAcesso}
                    onChange={(e) => setCodigoAcesso(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-red-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleEntrarLiga}
                    disabled={loading}
                    className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? 'Verificando...' : 'Entrar na Liga'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4 text-center">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sua Liga</h2>
                <div className="text-2xl font-black italic text-blue-950 uppercase">{user.liga.nome}</div>
                {meuCodigoLiga ? (
                  <button
                    type="button"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => copyCode(meuCodigoLiga)}
                  >
                    <span className="text-[10px] block text-slate-400 uppercase font-bold mb-1">
                      Clique para copiar o Código
                    </span>
                    <span className="font-mono font-black text-red-600 tracking-wider">{meuCodigoLiga}</span>
                  </button>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    Só quem criou esta liga pode ver o código de acesso.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowSairModal(true)}
                  className="mt-4 w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Sair da Liga
                </button>
              </div>
            )}
          </div>

          {/* Ranking */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase text-blue-950">Ranking da Liga</h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ranking.length} Membros</span>
              </div>
              <div className="p-4">
                {rankingLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                          <div className="space-y-2">
                            <div className="w-24 h-4 bg-slate-200 rounded"></div>
                            <div className="w-16 h-3 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                        <div className="w-12 h-6 bg-slate-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : ranking.length > 0 ? (
                  <div className="space-y-2">
                    {ranking.map((membro, index) => (
                      <div
                        key={membro.id}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                          membro.id === user.id ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`w-9 h-9 flex items-center justify-center rounded-full font-black text-sm ${
                              index === 0
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md shadow-amber-400/30'
                                : index === 1
                                ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                                : index === 2
                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                                : 'bg-slate-100 text-slate-500 text-xs'
                            }`}
                          >
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <span>{membro.nome}</span>
                              {membro.id === user.id && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">Você</span>
                              )}
                            </div>
                            <div className="text-xs font-black uppercase text-blue-700">{membro.nivel}</div>
                          </div>
                        </div>
                        <div className="font-black italic text-blue-950 text-base">
                          {membro.xp} <span className="text-xs text-slate-500 font-bold">XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 italic font-medium">
                    Você ainda não está em uma liga ou a liga não possui membros.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-50 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-3 whitespace-nowrap ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Sair da Liga */}
      <AnimatePresence>
        {showSairModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSairModal(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-sair-title"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full space-y-6 text-center"
            >
              <h3 id="modal-sair-title" className="text-2xl font-black italic uppercase text-blue-950">Sair da Liga?</h3>
              <p className="text-slate-500 font-medium text-sm">
                Tem certeza que deseja sair desta liga? Seu XP continuará intacto, mas você não aparecerá mais neste ranking.
              </p>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSairModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSairLiga}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saindo...' : 'Sim, Sair'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <CelebrationToast celebration={celebration} onDismiss={() => setCelebration(null)} />
    </div>
  );
};

export default Profile;
