import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
        __APP_COMMIT__: JSON.stringify('test'),
        __APP_BUILD_TIME__: JSON.stringify('1970-01-01T00:00:00.000Z'),
    },
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
