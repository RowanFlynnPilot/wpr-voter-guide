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
        const url = req.url.split('?')[0];
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
  plugins: [react(), staticData()],
});
