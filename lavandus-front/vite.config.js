import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('.', import.meta.url))

// Dos entradas: el panel interno (index.html) y la vista del cliente (cliente.html).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        principal: `${raiz}index.html`,
        cliente: `${raiz}cliente.html`,
      },
    },
  },
})
