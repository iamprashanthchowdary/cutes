import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages project path so assets resolve correctly
// at https://iamprashanthchowdary.github.io/cutes/
export default defineConfig({
  base: '/cutes/',
  plugins: [react()],
})
