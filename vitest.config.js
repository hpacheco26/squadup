import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
        include: ['src/**/*.{test,spec}.{js,jsx}', 'tests/unit/**/*.{test,spec}.{js,jsx}'],
        exclude: ['node_modules', 'dist', 'tests/e2e/**', 'tests/rules/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.{js,jsx}'],
            exclude: [
                'src/**/*.test.{js,jsx}',
                'src/main.jsx',
                'src/config/**',
                'src/i18n/{en,pt}.js',
            ],
        },
    },
});
