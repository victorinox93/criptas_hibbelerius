import { defineConfig } from 'vite';
// base relativa: funciona en GitHub Pages sin importar el nombre del repositorio.
// __BUILD__ cambia en cada publicación: se usa para que el navegador no muestre
// una portada (u otros archivos de public/) vieja guardada en caché.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  define: { __BUILD__: JSON.stringify(Date.now().toString(36)) },
});
