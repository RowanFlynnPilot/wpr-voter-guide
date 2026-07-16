import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// config/ and data/ are canonical at the repo root (see CLAUDE.md data
// contracts). This plugin serves them in dev and copies them into dist/
// at build time, so the app fetches the same paths in both environments.
function staticData() {
  const roots = ['config', 'data'];
  return {
    name: 'wpr-static-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Dev URLs include the configured base; strip it to get repo paths.
        const url = req.url.split('?')[0].replace(server.config.base, '/');
        const root = roots.find((r) => url.startsWith(`/${r}/`));
        if (!root) return next();
        const file = resolve(process.cwd(), '.' + url);
        if (!file.startsWith(resolve(process.cwd(), root)) || !existsSync(file)) {
          res.statusCode = 404;
          return res.end('Not found');
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(readFileSync(file));
      });
    },
    closeBundle() {
      for (const root of roots) {
        cpSync(root, join('dist', root), { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: '/wpr-voter-guide/',
  // Dev harness may assign a port via PORT; Vite's default otherwise.
  server: { port: Number(process.env.PORT) || 5173 },
  plugins: [react(), staticData()],
});
