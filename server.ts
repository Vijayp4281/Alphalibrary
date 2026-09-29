import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import { createApp } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.resolve(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || (!process.env.NODE_ENV && fs.existsSync(distPath));

  if (!isProduction) {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('[Backend Server] Warning: dist/ folder not found. API is active.');
      app.get('*', (_req, res) => {
        res.status(200).send('Alpha Library System is active.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend Server] Alpha Library running at http://0.0.0.0:${PORT}`);
    console.log(`[Backend Server] API routes available at http://0.0.0.0:${PORT}/api`);
  });
}

startServer().catch((err) => {
  console.error('[Backend Server] Failed to start:', err);
  process.exit(1);
});
