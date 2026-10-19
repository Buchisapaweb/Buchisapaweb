import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

/**
 * El HTML público usa rutas absolutas (/css, /js, /imagenes, /datos).
 * Los archivos fuente viven en interfaz/src y datos, por lo que Vite no los
 * publicaba automáticamente. Copiarlos después de compilar conserva esas
 * rutas y evita que producción muestre HTML sin estilos ni imágenes.
 */
function copiarRecursosPublicos(): Plugin {
  return {
    name: 'buchisapa-copiar-recursos-publicos',
    apply: 'build',
    closeBundle() {
      const raiz = process.cwd()
      const salida = resolve(raiz, 'dist')

      const copias: Array<[string, string]> = [
        ['interfaz/src/estilos', 'css'],
        ['interfaz/src/javascript', 'js'],
        ['interfaz/src/recursos/imagenes', 'imagenes'],
        ['datos', 'datos'],
        ['publico', '.'],
      ]

      mkdirSync(salida, { recursive: true })

      for (const [origenRelativo, destinoRelativo] of copias) {
        const origen = resolve(raiz, origenRelativo)
        const destino = resolve(salida, destinoRelativo)

        if (!existsSync(origen)) {
          throw new Error(
            `No se encontró el directorio requerido para producción: ${origenRelativo}`,
          )
        }

        cpSync(origen, destino, { recursive: true, force: true })
      }

      // Publicar la página de detalle bajo /producto (cleanUrls de Vercel).
      const paginaProducto = resolve(raiz, 'interfaz/src/paginas/producto-detalle.html')
      if (!existsSync(paginaProducto)) {
        throw new Error('No se encontró la página requerida: interfaz/src/paginas/producto-detalle.html')
      }
      copyFileSync(paginaProducto, resolve(salida, 'producto.html'))
    },
  }
}

export default defineConfig({
  plugins: [copiarRecursosPublicos()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  build: {
    target: ['es2015', 'chrome60', 'edge79', 'firefox60', 'safari12'],
  },
})
