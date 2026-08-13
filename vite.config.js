import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project pages from a /<repo-name>/ subpath rather
  // than the domain root, so asset URLs need this base prefix in production.
  base: '/cellular-automata-lab/',
})
