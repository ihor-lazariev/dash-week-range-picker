import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        // jsdom so renderHook (which mounts into a DOM container) works for the state-machine tests
        environment: 'jsdom',
        include: ['src/**/*.test.{ts,tsx}'],
    },
});
