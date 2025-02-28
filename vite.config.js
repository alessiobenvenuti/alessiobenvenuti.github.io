import { defineConfig } from 'vite';

export default defineConfig({
  base: '/alessiobenvenuti.github.io/',
  resolve: {
    alias: {
      'three': '/node_modules/three',
    },
  },
});
