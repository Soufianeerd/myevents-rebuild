import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    server: { deps: { inline: ['@neondatabase/auth'] } },
    maxWorkers: 1,
    testTimeout: 15000,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
