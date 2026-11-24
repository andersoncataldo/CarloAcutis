// Utilitário de Efeitos Sonoros Devocionais & Hápticos via Web Audio API nativa
// Zero dependência de arquivos mp3 pesados de rede; renderização instantânea sintetizada.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const isSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('carlo_sound_enabled') !== 'false';
};

export const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('carlo_sound_enabled', enabled ? 'true' : 'false');
};

/**
 * Toca um acorde sacro em tom harmônico suave (sino de catedral)
 * Usado em acertos de quiz, level up e conquistas.
 */
export const playSacredChime = (): void => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Frequências inspiradas no carrilhão harmônico (Fá#5 e Dó#6)
    const freqs = [739.99, 1108.73, 1479.98];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const peakGain = 0.08 / (idx + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + 1.5 + idx * 0.3);
    });

    // Feedback háptico em smartphones compatíveis
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 40, 20]);
    }
  } catch (err) {
    console.debug('Áudio devocional não pôde ser reproduzido:', err);
  }
};

/**
 * Toca um feedback de clique tátil sutil
 */
export const playClickSound = (): void => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  } catch {
    // Ignora silenciosamente em navegadores restritos
  }
};
