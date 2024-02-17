import { defineConfig } from 'vite';
import azothPlugin from '@azoth-web/vite-plugin-azoth';
import inspect from 'vite-plugin-inspect';

export default defineConfig({
    plugins: [
        azothPlugin(),
        inspect(),
    ],
    test: {
        environment: 'jsdom',
        testTimeout: 30_000,
    },
    esbuild: {
        jsx: 'preserve',
    },
    build: {
        target: 'esnext',
        minify: false,
        // modulePreload: false,
        // rollupOptions: {
        //     output: [{
        //         format: 'es'
        //     }]
        // },
    },
});