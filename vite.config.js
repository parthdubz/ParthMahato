import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If you're deploying this as a GitHub Pages *project* site
// (https://<user>.github.io/<repo>/), uncomment and set `base` to your repo name:
// export default defineConfig({
//   plugins: [react()],
//   base: '/<repo-name>/',
// });

export default defineConfig({
  plugins: [react()],
  base: './',
});
