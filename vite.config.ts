import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        editor: 'index.html',
        background: 'src/background.ts',
        content: 'src/content.ts',
      },
      output: { entryFileNames: '[name].js' },
    },
  },
});
