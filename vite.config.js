import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {port: 5188},
  // Relative base so built asset paths work whether the site is served from
  // a domain root (Vercel/Netlify) or a GitHub Pages repo subpath
  // (username.github.io/repo-name/).
  base: '/ya-shams/',
})
