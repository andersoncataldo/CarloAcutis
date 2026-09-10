import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gera stats.html com o mapa do bundle. Só roda com ANALYZE=true
    // (npm run analyze) para não pesar o build normal.
    process.env.ANALYZE === 'true' &&
      visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true, open: true }),
  ].filter(Boolean),
  // NÃO aumente chunkSizeWarningLimit para "silenciar" o aviso de bundle
  // grande — o objetivo é reduzir o peso real via lazy loading e code
  // splitting (ver App.tsx), e o aviso padrão (600kb) é o sinal de alerta
  // que deve continuar disparando se algo regredir.
=======

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> 1c9dddf3020316eaaa9e1fdf62452ec18491ea3a
})
