import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Opens browser automatically
    port: 3001, // Keeps the port you are used to
  },
  build: {
    outDir: 'build', // Keeps the output folder compatible with Netlify default settings
  }
});
