import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { google } from 'googleapis';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  const devApiPlugin = () => ({
    name: 'dev-api-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/auth/google/url', (req: any, res: any) => {
        try {
          const googleOAuth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
            env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || `${env.APP_URL || ''}/auth/google/callback`
          );
          const scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
          ];
          const url = googleOAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ url }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    }
  });

  return {
    plugins: [react(), tailwindcss(), devApiPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
