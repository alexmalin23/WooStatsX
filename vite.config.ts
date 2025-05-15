import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets/build',
    assetsDir: '',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'assets/src/index.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'assets/src'),
    },
  },
}); 