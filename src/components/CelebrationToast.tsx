import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ConquistaDesbloqueada } from '../types/api.types';

export interface CelebrationPayload {
  leveledUp?: boolean;
  newNivel?: string | null;
  achievements: ConquistaDesbloqueada[];
}

interface CelebrationToastProps {
  celebration: CelebrationPayload | null;
  onDismiss: () => void;
}

const CelebrationToast: React.FC<CelebrationToastProps> = ({ celebration, onDismiss }) => {
  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(onDismiss, 5500);
    return () => window.clearTimeout(timer);
  }, [celebration, onDismiss]);

  const hasContent =
    Boolean(celebration) &&
    (Boolean(celebration?.leveledUp && celebration?.newNivel) ||
      (celebration?.achievements.length ?? 0) > 0);

  return (
    <AnimatePresence>
      {hasContent && celebration && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 bg-blue-950 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400/60 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {celebration.leveledUp && celebration.newNivel && (
                <div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                    Novo Título Alcançado!
                  </span>
                  <p className="text-lg font-black italic uppercase text-white">
                    ✨ Agora você é {celebration.newNivel}!
                  </p>
                </div>
              )}

              {celebration.achievements.map((ach) => (
                <div key={ach.codigo} className="flex items-center gap-3 pt-1">
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {ach.icone}
                  </span>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                      Conquista Desbloqueada
                    </span>
                    <p className="text-sm font-black text-white leading-snug">{ach.nome}</p>
                    <p className="text-xs text-blue-200 leading-snug">{ach.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Fechar notificação de conquista"
              className="text-blue-200 hover:text-white p-1 text-sm font-black"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationToast;
