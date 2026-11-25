import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { api, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedPrivacy) {
      setError('Leia e aceite a Política de Privacidade para criar sua conta.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({
        nome: formData.nome,
        email: formData.email,
        password: formData.password,
      });
      setAuthSession(data.user, data.streak);
      navigate('/perfil');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao criar sua conta.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-6 bg-slate-50">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-blue-950 mb-2">
            Cadastro<span className="text-red-600">.</span>
          </h1>
          <p className="text-slate-500 font-medium">Torne-se um original, não uma fotocópia</p>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="register-nome" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 block">
              Nome Completo
            </label>
            <input
              id="register-nome"
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
              placeholder="Ex: João Missionário"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 block">
              E-mail
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="register-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 block">
                Senha (mín. 6)
              </label>
              <input
                id="register-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-confirm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4 block">
                Confirmar
              </label>
              <input
                id="register-confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer text-xs text-slate-600 leading-relaxed">
            <input
              id="register-privacy"
              type="checkbox"
              required
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-1 w-4 h-4 accent-red-600 rounded shrink-0"
            />
            <span>
              Li e concordo com a{' '}
              <Link to="/privacidade" className="text-blue-900 font-bold underline hover:text-red-600">
                Política de Privacidade (LGPD)
              </Link>
              . Se for menor de idade, confirmo estar ciente da recomendação de orientação dos pais
              ou responsáveis.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-950 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Iniciar Apostolado'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Já possui uma conta?{' '}
            <Link to="/login" className="text-blue-900 font-black uppercase tracking-widest hover:underline ml-1">
              Entrar
            </Link>
          </p>
        </div>
      </m.div>
    </div>
  );
};

export default Register;
