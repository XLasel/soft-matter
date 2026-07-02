import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // later: add vite-plugin-glsl to import .glsl files directly
})
