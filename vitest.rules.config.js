import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/rules/**/*.test.js'],
        // Rules tests hit the live emulator; serialize to avoid project-id collisions.
        fileParallelism: false,
        testTimeout: 15000,
        hookTimeout: 15000,
    },
});
