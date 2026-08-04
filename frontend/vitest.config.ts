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
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/**/*Types.ts',
        'src/test/**',
        'src/vite-env.d.ts',
      ],
      // Initial whole-application baseline. Raise these values as coverage is
      // added; unlike the previous auth-only scope, regressions anywhere in src
      // now affect the global result.
      thresholds: { lines: 5, functions: 25, statements: 5, branches: 45 },
    },
  },
});
