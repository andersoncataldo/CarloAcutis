import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Config separada do vite.config.ts para não misturar o plugin de
// visualização de bundle (produção) com o ambiente de testes.
export default mergeConfig(
  defineConfig({ plugins: [react()] }),
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          'src/types/',
          'src/data/',
          '**/*.d.ts',
        ],
      },
    },
  })
);
