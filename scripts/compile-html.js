import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');

export function compileHtml() {
  console.log('🔄 Compilando HTML estático y organizando rutas para producción y Vercel...');

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // 1. Compilar index.html con todos sus partials
  const partials = {
    'HEADER': 'public/html/header.html',
    'PORTADA': 'public/html/portada.html',
    'CARRUSEL_PORTADA': 'public/html/portada.html',
    'CATEGORIA': 'public/html/categoria.html',
    'PRODUCTO': 'public/html/producto.html',
    'DESCRIPCION_PRODUCTO': 'public/html/descripcionProducto.html',
    'CARRITO': 'public/html/carrito.html',
    'PANEL_CARRITO': 'public/html/carrito.html',
    'RECOJO': 'public/html/recojo-modal.html',
    'VENTANA_UBICACION': 'public/html/recojo-modal.html',
    'CHECKOUT': 'public/html/checkout.html',
    'VENTANA_CARTA_COMPLETA': 'public/html/checkout.html',
    'AUTENTICACION_PERFIL': 'public/html/autenticacionPerfil.html',
    'VENTANA_AUTENTICACION': 'public/html/autenticacionPerfil.html',
    'FOOTER': 'public/html/footer.html',
    'PIE_PAGINA': 'public/html/footer.html'
  };

  let indexTemplate = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  for (const [key, relPath] of Object.entries(partials)) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      indexTemplate = indexTemplate.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    } else {
      console.warn(`⚠️ Partial no encontrado: ${relPath}`);
    }
  }

  // Guardar index.html compilado en dist/
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexTemplate, 'utf8');
  console.log('✅ dist/index.html compilado con éxito (partials inyectados).');

  // 2. Copiar archivos de public a dist
  function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDirRecursive(path.join(ROOT_DIR, 'public'), DIST_DIR);
  console.log('✅ Archivos públicos copiados a dist/.');

  // 3. Asegurar rutas directas para Vercel y hosts estáticos
  const directPages = [
    { src: 'public/custom-checkout.html', outName: 'custom-checkout' },
    { src: 'public/html/checkout.html', outName: 'checkout' },
    { src: 'public/html/recojo.html', outName: 'recojo' },
    { src: 'public/html/reclamaciones.html', outName: 'reclamaciones' },
    { src: 'public/html/nosotros.html', outName: 'nosotros' },
    { src: 'public/html/contactanos.html', outName: 'contactanos' },
    { src: 'public/html/historia.html', outName: 'historia' },
    { src: 'public/html/vision.html', outName: 'vision' },
    { src: 'public/html/mision.html', outName: 'mision' },
    { src: 'public/html/politicas-privacidad.html', outName: 'politicas-privacidad' },
    { src: 'public/html/terminos.html', outName: 'terminos' }
  ];

  for (const page of directPages) {
    const fullSrc = path.join(ROOT_DIR, page.src);
    if (fs.existsSync(fullSrc)) {
      const content = fs.readFileSync(fullSrc, 'utf8');
      
      // dist/{page}.html
      fs.writeFileSync(path.join(DIST_DIR, `${page.outName}.html`), content, 'utf8');
      
      // dist/{page}/index.html (para navegación limpia con slash final)
      const pageDir = path.join(DIST_DIR, page.outName);
      if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, 'index.html'), content, 'utf8');
    }
  }
  console.log('✅ Rutas estáticas limpias creadas.');
}

compileHtml();
