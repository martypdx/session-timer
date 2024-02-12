import { defineConfig } from 'vite';
import azothPlugin from '@azoth-web/vite-plugin-azoth';

export default defineConfig({
    plugins: [
        azothPlugin(),
    ],
})