import fs from 'fs';
import path from 'path';

/**
 * Script de compilación y ensamble HTML/estático de BuchiSapa
 * Asegura la presencia de recursos en dist sin carpetas duplicadas.
 */
function compilarHtml() {
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copiar manifiesto PWA y trabajador de servicio desde publico si existen
  const publicoDir = path.resolve(process.cwd(), 'publico');
  if (fs.existsSync(publicoDir)) {
    const files = fs.readdirSync(publicoDir);
    for (const f of files) {
      const src = path.join(publicoDir, f);
      const dest = path.join(distDir, f);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    }
  }

  // Asegurar que las imágenes de public/ estén en dist/imagenes
  const imgDir = path.resolve(process.cwd(), 'public/imagenes');
  const distImgDir = path.resolve(distDir, 'imagenes');
  if (fs.existsSync(imgDir)) {
    fs.cpSync(imgDir, distImgDir, { recursive: true });
  }

  console.log('✓ Compilación estática y ensamblado finalizado con éxito.');
}

compilarHtml();
