import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      // Custom domain kimhessclimbs.com - use root path
      base: '/',
      server: {
        port: 6900,
        host: 'localhost',
      },
      preview: {
        port: 6900,
        host: 'localhost',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
