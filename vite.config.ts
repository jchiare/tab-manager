import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    build: {
        sourcemap: true,
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                entry: resolve(__dirname, 'src/index.html')
            }
        }
    },
    esbuild: { exclude: './src/scripts/background.ts' }
});
