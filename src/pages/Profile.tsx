import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Membro {
  id: number;
  nome: string;
  xp: number;
  nivel: string;
}

const Profile: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const [ranking, setRanking] = useState<Membro[]>([]);
  const [ligaNome, setLigaNome] = useState('');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRanking = useCallback(async () => {
    try {
      const response = await api.get(`/ligas/${user?.liga?.id}/ranking`);
      setRanking(response.data);
    } catch (err) {
      console.error("Erro ao buscar ranking", err);
    }
  }, [user?.liga?.id]);

  useEffect(() => {
    if (user?.liga) {
      fetchRanking();
    }
  }, [user?.liga, fetchRanking]);

  const handleCriarLiga = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ligas/criar', { nome: ligaNome });
      await api.post('/ligas/entrar', { usuarioId: user?.id, codigoAcesso: res.data.codigoAcesso });
      await refreshUser();
      setLigaNome('');
    } catch {
      alert("Erro ao criar liga");
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarLiga = async () => {
    setLoading(true);
    try {
      await api.post('/ligas/entrar', { usuarioId: user?.id, codigoAcesso });
      await refreshUser();
      setCodigoAcesso('');
    } catch {
      alert("Código inválido ou erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const currentXp = user.xp % 1000;
  const progressPercentage = (currentXp / 1000) * 100;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center text-4xl md:text-5xl font-black italic">
                {user.nome.charAt(0)}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-500/10 px-3 py-1 rounded-full">{user.nivel}</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">{user.nome}</h2>
                <p className="text-blue-200 font-medium opacity-80">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="px-8 py-3 bg-white/10 hover:bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Sair</button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* XP & Progress */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu Progresso</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black italic text-blue-950">{user.xp} XP</span>
                  <span className="text-[10px] font-bold text-blue-600">NÍVEL {Math.floor(user.xp/1000) + 1}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-gradient-to-r from-blue-600 to-red-600"></motion.div>
                </div>
              </div>
            </div>

            {/* Liga Management */}
            {!user.liga ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ligas Paroquiais</h4>
                <div className="space-y-4">
                  <input type="text" placeholder="Nome da nova Liga" value={ligaNome} onChange={e => setLigaNome(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-blue-600 outline-none" />
                  <button onClick={handleCriarLiga} disabled={loading} className="w-full py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Criar Liga</button>
                  <div className="relative py-2 text-center"><span className="bg-white px-2 text-[10px] text-slate-300 font-bold uppercase">ou</span><hr className="absolute top-1/2 w-full -z-10 border-slate-100" /></div>
                  <input type="text" placeholder="Código de Acesso" value={codigoAcesso} onChange={e => setCodigoAcesso(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-red-600 outline-none" />
                  <button onClick={handleEntrarLiga} disabled={loading} className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Entrar na Liga</button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4 text-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sua Liga</h4>
                <div className="text-2xl font-black italic text-blue-950 uppercase">{user.liga.nome}</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <span className="text-[10px] block text-slate-400 uppercase font-bold mb-1">Código de Acesso</span>
                  <span className="font-mono font-black text-red-600 tracking-wider">{user.liga.codigoAcesso}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ranking */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase text-blue-950">Ranking da Liga</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ranking.length} Membros</span>
              </div>
              <div className="p-4">
                {ranking.length > 0 ? (
                  <div className="space-y-2">
                    {ranking.map((membro, index) => (
                      <div key={membro.id} className={`flex items-center justify-between p-4 rounded-2xl ${membro.id === user.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${index === 0 ? 'bg-yellow-400 text-white' : 'text-slate-400'}`}>{index + 1}</span>
                          <div>
                            <div className="font-bold text-slate-800">{membro.nome}</div>
                            <div className="text-[9px] font-black uppercase text-blue-600">{membro.nivel}</div>
                          </div>
                        </div>
                        <div className="font-black italic text-blue-950">{membro.xp} XP</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 italic font-medium">Você ainda não está em uma liga.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
