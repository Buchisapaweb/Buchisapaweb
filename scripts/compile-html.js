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
    'ENCABEZADO': 'frontend/src/components/html/encabezado.html',
    'MENU_MOVIL': 'frontend/src/components/html/menu-movil.html',
    'CARRUSEL_PORTADA': 'frontend/src/components/html/carrusel-portada.html',
    'PANEL_CARRITO': 'frontend/src/components/html/panel-carrito.html',
    'VENTANA_UBICACION': 'frontend/src/components/html/ventana-ubicacion.html',
    'VENTANA_CARTA_COMPLETA': 'frontend/src/components/html/ventana-carta-completa.html',
    'VENTANA_AUTENTICACION': 'frontend/src/components/html/ventana-autenticacion.html',
    'VENTANA_RASTREO_PEDIDO': 'frontend/src/components/html/ventana-rastreo-pedido.html',
    'PIE_PAGINA': 'frontend/src/components/html/pie-pagina.html'
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

  // Recursos del frontend: se mantienen las URLs públicas /css, /js e /imagenes
  // aunque internamente el código esté organizado por responsabilidad.
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/styles'), path.join(DIST_DIR, 'css'));
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/scripts'), path.join(DIST_DIR, 'js'));
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/assets/images'), path.join(DIST_DIR, 'imagenes'));
  console.log('✅ Recursos del frontend copiados a dist/css, dist/js y dist/imagenes.');

  // 3. Copiar módulo independiente /admin a dist/admin y compilar sus partials
  const adminSrc = path.join(ROOT_DIR, 'frontend/src/admin');
  const adminDest = path.join(DIST_DIR, 'admin');
  copyDirRecursive(adminSrc, adminDest);
  // El shell es una plantilla de compilación, no un archivo público adicional.
  fs.rmSync(path.join(adminDest, 'admin-shell.html'), { force: true });

  const adminPartials = {
    'SIDEBAR': 'frontend/src/admin/components/sidebar.html',
    'TOPBAR': 'frontend/src/admin/components/topbar.html',
    'VIEW_DASHBOARD': 'frontend/src/admin/pages/dashboard.html',
    'VIEW_CLIENTES': 'frontend/src/admin/pages/clientes.html',
    'VIEW_PRODUCTOS': 'frontend/src/admin/pages/productos.html',
    'VIEW_CATEGORIAS': 'frontend/src/admin/pages/categorias.html',
    'VIEW_PEDIDOS': 'frontend/src/admin/pages/pedidos.html',
    'VIEW_TICKET': 'frontend/src/admin/pages/ticket.html',
    'VIEW_PORTADA': 'frontend/src/admin/pages/portada.html',
    'VIEW_INSUMOS': 'frontend/src/admin/pages/insumos.html',
    'VIEW_UTENSILIOS': 'frontend/src/admin/pages/utensilios.html',
    'VIEW_CONFIGURACION': 'frontend/src/admin/pages/configuracion.html',
    'MODALS': 'frontend/src/admin/components/modals.html'
  };

  let adminTemplate = fs.readFileSync(path.join(ROOT_DIR, 'frontend/src/admin/admin-shell.html'), 'utf8');
  for (const [key, relPath] of Object.entries(adminPartials)) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      adminTemplate = adminTemplate.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    }
  }

  fs.writeFileSync(path.join(adminDest, 'index.html'), adminTemplate, 'utf8');
  console.log('✅ dist/admin/index.html compilado con éxito.');

  // 4. Asegurar rutas directas para Vercel y hosts estáticos
  const directPages = [
    { src: 'frontend/src/pages/html/cocina.html', outName: 'cocina' },
    { src: 'frontend/src/pages/html/cocina.html', outName: 'kitchen' },
    { src: 'frontend/src/pages/html/ubicacion.html', outName: 'ubicacion' },
    { src: 'frontend/src/pages/html/estado-pedido.html', outName: 'estado-pedido' },
    { src: 'frontend/src/pages/html/estado-pedido.html', outName: 'order-status' },
    { src: 'frontend/src/pages/html/estado-pedido.html', outName: 'rastreo' },
    { src: 'frontend/src/pages/html/reclamaciones.html', outName: 'reclamaciones' },
    { src: 'frontend/src/pages/html/informacion.html', outName: 'informacion' },
    { src: 'frontend/src/pages/html/nosotros.html', outName: 'nosotros' },
    { src: 'frontend/src/pages/html/servicios.html', outName: 'servicios' },
    { src: 'frontend/src/pages/html/politicas.html', outName: 'politicas' },
    { src: 'frontend/src/pages/html/contactanos.html', outName: 'contactanos' },
    { src: 'frontend/src/pages/html/historia.html', outName: 'historia' },
    { src: 'frontend/src/pages/html/vision.html', outName: 'vision' },
    { src: 'frontend/src/pages/html/valores.html', outName: 'valores' },
    { src: 'frontend/src/pages/html/restaurantes.html', outName: 'restaurantes' },
    { src: 'frontend/src/pages/html/reservas.html', outName: 'reservas' },
    { src: 'frontend/src/pages/html/catering.html', outName: 'catering' },
    { src: 'frontend/src/pages/html/fiestas.html', outName: 'fiestas' },
    { src: 'frontend/src/pages/html/giftcards.html', outName: 'giftcards' },
    { src: 'frontend/src/pages/html/valores-nutricionales.html', outName: 'valores-nutricionales' },
    { src: 'frontend/src/pages/html/cartilla-alergenos.html', outName: 'cartilla-alergenos' },
    { src: 'frontend/src/pages/html/politicas-privacidad.html', outName: 'politicas-privacidad' },
    { src: 'frontend/src/pages/html/terminos.html', outName: 'terminos' },
    { src: 'frontend/src/pages/html/promociones.html', outName: 'promociones' },
    { src: 'frontend/src/pages/html/trabaja.html', outName: 'trabaja' },
    { src: 'frontend/src/pages/html/proveedores.html', outName: 'proveedores' }
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
  console.log('✅ Rutas estáticas limpias creadas (/kitchen, /ubicacion, /rastreo, /reclamaciones).');

  // 5. Verificar carpeta de imágenes en dist/ para Vercel
  const logoDist = path.join(DIST_DIR, 'imagenes', 'logo', 'logo-buchisapa.webp');
  console.log(`✅ Archivos de imágenes verificados en dist/imagenes.`);
}

compileHtml();
