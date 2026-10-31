import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

import fs from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vite-dev-settings-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url.startsWith('/api/save.php') || req.url.startsWith('/api/save'))) {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk;
                });
                req.on('end', () => {
                  try {
                    const parsed = JSON.parse(body);
                    if (parsed && parsed.settings) {
                      parsed.settings.updatedAt = new Date().toISOString();
                      const jsonStr = JSON.stringify(parsed.settings, null, 2);
                      const dataPath = path.resolve(__dirname, 'public/api/data.json');
                      const settingsPath = path.resolve(__dirname, 'public/settings.json');
                      fs.writeFileSync(dataPath, jsonStr, 'utf-8');
                      fs.writeFileSync(settingsPath, jsonStr, 'utf-8');
                      res.setHeader('Content-Type', 'application/json');
                      res.end(
                        JSON.stringify({
                          success: true,
                          message: 'Ayarlar başarıyla kaydedildi (Tüm cihazlar ve ziyaretçiler için senkronize).',
                          updatedAt: parsed.settings.updatedAt,
                        })
                      );
                      return;
                    }
                  } catch (err: any) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, error: err.message }));
                    return;
                  }
                });
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
