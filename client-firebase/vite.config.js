import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No backend proxy — this build talks directly to Firestore.
// When building for the Electron desktop wrapper, assets are loaded via
// file:// so paths must be relative. Set VITE_DESKTOP=1 in that build.
const isDesktop = process.env.VITE_DESKTOP === '1';

export default defineConfig({
  plugins: [react()],
  base: isDesktop ? './' : '/',
  server: {
    port: 5174
  }
});
