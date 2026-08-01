import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/features/auth/authStorage.ts', 'src/pages/LoginPage.tsx'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/test/**'],
      thresholds: { lines: 60, functions: 60, statements: 60, branches: 50 },
    },
  },
});
