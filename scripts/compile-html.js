import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

export function compileHtml() {
  console.log('🔄 Compilando HTML estático y organizando rutas para producción y Vercel...');

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

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

  // 1. Sincronizar recursos del frontend a public/ para que Vite los encuentre en build time
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/styles'), path.join(PUBLIC_DIR, 'css'));
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/scripts'), path.join(PUBLIC_DIR, 'js'));
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/assets/images'), path.join(PUBLIC_DIR, 'imagenes'));

  // 2. Compilar index.html con todos sus partials
  const partials = {
    'ENCABEZADO': 'frontend/src/components/html/encabezado.html',
    'MENU_MOVIL': 'frontend/src/components/html/menu-movil.html',
    'CARRUSEL_PORTADA': 'frontend/src/components/html/carrusel-portada.html',
    'PANEL_CARRITO': 'frontend/src/components/html/panel-carrito.html',
    'VENTANA_UBICACION': 'frontend/src/components/html/ventana-ubicacion.html',
    'VENTANA_AUTENTICACION': 'frontend/src/components/html/ventana-autenticacion.html',
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

  // 3. Copiar archivos de public a dist
  copyDirRecursive(PUBLIC_DIR, DIST_DIR);

  // Recursos del frontend a dist/
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/styles'), path.join(DIST_DIR, 'css'));
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/scripts'), path.join(DIST_DIR, 'js'));
  copyDirRecursive(path.join(ROOT_DIR, 'frontend/src/assets/images'), path.join(DIST_DIR, 'imagenes'));
  console.log('✅ Recursos del frontend copiados a dist/css, dist/js y dist/imagenes.');

  // 4. Copiar módulo independiente /admin a dist/admin y compilar sus partials
  const adminSrc = path.join(ROOT_DIR, 'frontend/src/admin');
  const adminDest = path.join(DIST_DIR, 'admin');
  copyDirRecursive(adminSrc, adminDest);

  const adminPartials = {
    'ENCABEZADO': 'frontend/src/admin/components/encabezado.html',
    'VIEW_DASHBOARD': 'frontend/src/admin/pages/dashboard.html',
    'VIEW_CLIENTES': 'frontend/src/admin/pages/clientes.html',
    'VIEW_PRODUCTOS': 'frontend/src/admin/pages/productos.html',
    'VIEW_CATEGORIAS': 'frontend/src/admin/pages/categorias.html',
    'VIEW_PORTADA': 'frontend/src/admin/pages/portada.html',
    'VIEW_PEDIDOS': 'frontend/src/admin/pages/pedidos.html',
    'VIEW_TICKET': 'frontend/src/admin/pages/ticket.html',
    'VIEW_INSUMOS': 'frontend/src/admin/pages/insumos.html',
    'VIEW_UTENSILIOS': 'frontend/src/admin/pages/utensilios.html',
    'VIEW_CONFIGURACION': 'frontend/src/admin/pages/configuracion.html'
  };

  let adminTemplate = fs.readFileSync(path.join(ROOT_DIR, 'frontend/src/admin/admin.html'), 'utf8');
  for (const [key, relPath] of Object.entries(adminPartials)) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      adminTemplate = adminTemplate.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    }
  }

  fs.writeFileSync(path.join(adminDest, 'index.html'), adminTemplate, 'utf8');
  console.log('✅ dist/admin/index.html compilado con éxito.');

  // 5. Asegurar rutas directas para Vercel y hosts estáticos
  const directPages = [
    { src: 'frontend/src/pages/html/cocina.html', outName: 'cocina' },
    { src: 'frontend/src/pages/html/cocina.html', outName: 'kitchen' },
    { src: 'frontend/src/pages/html/ubicacion.html', outName: 'ubicacion' },
    { src: 'frontend/src/pages/html/reclamaciones.html', outName: 'reclamaciones' },
    { src: 'frontend/src/pages/html/informacion.html', outName: 'informacion' },
    { src: 'frontend/src/pages/html/nosotros.html', outName: 'nosotros' },
    { src: 'frontend/src/pages/html/servicios.html', outName: 'servicios' },
    { src: 'frontend/src/pages/html/politicas.html', outName: 'politicas' },
    { src: 'frontend/src/pages/html/contactanos.html', outName: 'contactanos' },
    { src: 'frontend/src/pages/html/historia.html', outName: 'historia' },
    { src: 'frontend/src/pages/html/vision.html', outName: 'vision' },
    { src: 'frontend/src/pages/html/valores.html', outName: 'valores' },
    { src: 'frontend/src/pages/html/reservas.html', outName: 'reservas' },
    { src: 'frontend/src/pages/html/catering.html', outName: 'catering' },
    { src: 'frontend/src/pages/html/fiestas.html', outName: 'fiestas' },
    { src: 'frontend/src/pages/html/giftcards.html', outName: 'giftcards' },
    { src: 'frontend/src/pages/html/valores-nutricionales.html', outName: 'valores-nutricionales' },
    { src: 'frontend/src/pages/html/politicas-privacidad.html', outName: 'politicas-privacidad' },
    { src: 'frontend/src/pages/html/terminos.html', outName: 'terminos' },
    { src: 'frontend/src/pages/html/carrito.html', outName: 'carrito' }
  ];

  for (const page of directPages) {
    const fullSrc = path.join(ROOT_DIR, page.src);
    if (fs.existsSync(fullSrc)) {
      const content = fs.readFileSync(fullSrc, 'utf8');
      
      fs.writeFileSync(path.join(DIST_DIR, `${page.outName}.html`), content, 'utf8');
      
      const pageDir = path.join(DIST_DIR, page.outName);
      if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, 'index.html'), content, 'utf8');
    }
  }
  console.log('✅ Rutas estáticas limpias creadas (/kitchen, /ubicacion, /reclamaciones).');
}

compileHtml();
