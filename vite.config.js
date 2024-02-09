import { defineConfig } from 'vite';
import azothPlugin from '@azothjsx/vite-plugin-azoth';

export default defineConfig({
    plugins: [
        azothPlugin(),
    ],
})