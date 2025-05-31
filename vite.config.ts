import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        code: resolve(__dirname, 'plugin/controller.ts'),
        ui: resolve(__dirname, 'src/App.tsx'),
      },
      output: {
        entryFileNames: ({ name }) => {
          if (name === 'code') return 'code.js'; // controller.ts
          if (name === 'ui') return 'ui.html';     // React UI entry
          return '[name].js';
        },
        chunkFileNames: undefined,
        assetFileNames: undefined,
      },
    },
  },
});
