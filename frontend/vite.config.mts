import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(frontendRoot, '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  return {
    root: frontendRoot,
    envDir: projectRoot,
    plugins: [react(), tailwindcss()],
    server: { port: Number(env.VITE_PORT || 5173), proxy: { '/api': env.API_PROXY_TARGET || 'http://localhost:5000' } },
    build: { outDir: path.join(frontendRoot, 'dist') },
  };
});
