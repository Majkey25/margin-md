import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        editor: 'index.html',
        diagram: 'diagram.html',
        launcher: 'launcher.html',
        background: 'src/background.ts',
        content: 'src/content.ts',
      },
      output: { entryFileNames: '[name].js' },
    },
  },
});
