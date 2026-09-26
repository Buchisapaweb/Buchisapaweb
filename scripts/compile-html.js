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
    'ENCABEZADO': 'public/html/encabezado.html',
    'MENU_MOVIL': 'public/html/menu-movil.html',
    'CARRUSEL_PORTADA': 'public/html/carrusel-portada.html',
    'PANEL_CARRITO': 'public/html/panel-carrito.html',
    'VENTANA_UBICACION': 'public/html/ventana-ubicacion.html',
    'VENTANA_CARTA_COMPLETA': 'public/html/ventana-carta-completa.html',
    'VENTANA_AUTENTICACION': 'public/html/ventana-autenticacion.html',
    'VENTANA_RASTREO_PEDIDO': 'public/html/ventana-rastreo-pedido.html',
    'PIE_PAGINA': 'public/html/pie-pagina.html'
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

  // 3. Copiar módulo independiente /admin a dist/admin y compilar sus partials
  const adminSrc = path.join(ROOT_DIR, 'admin');
  const adminDest = path.join(DIST_DIR, 'admin');
  copyDirRecursive(adminSrc, adminDest);

  const adminPartials = {
    'SIDEBAR': 'admin/partials/sidebar.html',
    'TOPBAR': 'admin/partials/topbar.html',
    'VIEW_DASHBOARD': 'admin/views/dashboard.html',
    'VIEW_PRODUCTOS': 'admin/views/productos.html',
    'VIEW_PEDIDOS': 'admin/views/pedidos.html',
    'VIEW_VENTAS': 'admin/views/ventas.html',
    'VIEW_CAJA': 'admin/views/caja.html',
    'VIEW_TICKET': 'admin/views/ticket.html',
    'VIEW_PORTADA': 'admin/views/portada.html',
    'VIEW_INSUMOS': 'admin/views/insumos.html',
    'VIEW_UTENSILIOS': 'admin/views/utensilios.html',
    'VIEW_DELIVERY': 'admin/views/delivery.html',
    'VIEW_RECOJO': 'admin/views/recojo.html',
    'VIEW_UBICACION': 'admin/views/ubicacion.html',
    'VIEW_REPORTES': 'admin/views/reportes.html',
    'VIEW_CONFIGURACION': 'admin/views/configuracion.html',
    'MODALS': 'admin/partials/modals.html'
  };

  let adminTemplate = fs.readFileSync(path.join(ROOT_DIR, 'admin/index.html'), 'utf8');
  for (const [key, relPath] of Object.entries(adminPartials)) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      adminTemplate = adminTemplate.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    }
  }

  fs.writeFileSync(path.join(adminDest, 'index.html'), adminTemplate, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'admin.html'), adminTemplate, 'utf8');
  console.log('✅ dist/admin/index.html y dist/admin.html compilados con éxito.');

  // 4. Asegurar rutas directas para Vercel y hosts estáticos
  const directPages = [
    { src: 'public/html/cocina.html', outName: 'cocina' },
    { src: 'public/html/cocina.html', outName: 'kitchen' },
    { src: 'public/html/ubicacion.html', outName: 'ubicacion' },
    { src: 'public/html/estado-pedido.html', outName: 'estado-pedido' },
    { src: 'public/html/estado-pedido.html', outName: 'order-status' },
    { src: 'public/html/estado-pedido.html', outName: 'rastreo' },
    { src: 'public/html/reclamaciones.html', outName: 'reclamaciones' },
    { src: 'public/html/informacion.html', outName: 'informacion' },
    { src: 'public/html/nosotros.html', outName: 'nosotros' },
    { src: 'public/html/servicios.html', outName: 'servicios' },
    { src: 'public/html/politicas.html', outName: 'politicas' },
    { src: 'public/html/contactanos.html', outName: 'contactanos' },
    { src: 'public/html/historia.html', outName: 'historia' },
    { src: 'public/html/vision.html', outName: 'vision' },
    { src: 'public/html/valores.html', outName: 'valores' },
    { src: 'public/html/restaurantes.html', outName: 'restaurantes' },
    { src: 'public/html/reservas.html', outName: 'reservas' },
    { src: 'public/html/catering.html', outName: 'catering' },
    { src: 'public/html/fiestas.html', outName: 'fiestas' },
    { src: 'public/html/giftcards.html', outName: 'giftcards' },
    { src: 'public/html/valores-nutricionales.html', outName: 'valores-nutricionales' },
    { src: 'public/html/cartilla-alergenos.html', outName: 'cartilla-alergenos' },
    { src: 'public/html/politicas-privacidad.html', outName: 'politicas-privacidad' },
    { src: 'public/html/terminos.html', outName: 'terminos' },
    { src: 'public/html/promociones.html', outName: 'promociones' },
    { src: 'public/html/trabaja.html', outName: 'trabaja' },
    { src: 'public/html/proveedores.html', outName: 'proveedores' }
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
  const logoDist = path.join(DIST_DIR, 'imagenes', 'logo', 'logo-buchisapa.png');
  console.log(`✅ Archivos de imágenes verificados en dist/imagenes.`);
}

compileHtml();
