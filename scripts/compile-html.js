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
  copyDirRecursive(path.join(ROOT_DIR, 'admin'), path.join(DIST_DIR, 'admin'));
  copyDirRecursive(path.join(ROOT_DIR, 'data'), path.join(DIST_DIR, 'data'));
  console.log('✅ Archivos públicos, admin y catálogo data copiados a dist/.');

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

  // 4. Pre-compilar Panel de Administración estático como respaldo para Vercel
  try {
    const headerPath = path.join(ROOT_DIR, 'admin/includes/header.php');
    const sidebarPath = path.join(ROOT_DIR, 'admin/includes/sidebar.php');
    const topbarPath = path.join(ROOT_DIR, 'admin/includes/topbar.php');
    const footerPath = path.join(ROOT_DIR, 'admin/includes/footer.php');

    if (fs.existsSync(headerPath) && fs.existsSync(sidebarPath) && fs.existsSync(topbarPath) && fs.existsSync(footerPath)) {
      let rawHeader = fs.readFileSync(headerPath, 'utf8').replace(/<\?php[\s\S]*?\?>/g, '');
      let rawSidebar = fs.readFileSync(sidebarPath, 'utf8').replace(/<\?php[\s\S]*?\?>/g, '');
      let rawTopbar = fs.readFileSync(topbarPath, 'utf8').replace(/<\?php[\s\S]*?\?>/g, '');
      let rawFooter = fs.readFileSync(footerPath, 'utf8');

      // Vistas principales a pre-generar
      const adminViews = ['dashboard', 'productos', 'clientes', 'pedidos', 'ticket', 'configuracion'];

      for (const view of adminViews) {
        const viewPath = path.join(ROOT_DIR, `admin/views/${view}.php`);
        if (!fs.existsSync(viewPath)) continue;

        let viewContent = fs.readFileSync(viewPath, 'utf8');
        viewContent = viewContent.replace(/<\?php[\s\S]*?\?>/g, '');

        let footerScripts = `<script src="/admin/js/${view}.js"></script>`;
        if (view === 'dashboard') {
          footerScripts = `<script src="/admin/js/chart.min.js"></script>\n${footerScripts}`;
        }
        let viewFooter = rawFooter.replace(/<\?php[\s\S]*?\?>/g, footerScripts);

        let viewHtml = rawHeader;
        viewHtml += `
        <div class="flex h-screen overflow-hidden">
            ${rawSidebar}
            <div class="flex-1 flex flex-col overflow-hidden">
                ${rawTopbar}
                <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
                    ${viewContent}
                </main>
            </div>
        </div>
        `;
        viewHtml += viewFooter;

        // Limpiezas y metadatos
        viewHtml = viewHtml.replace(/<\?php[\s\S]*?\?>/g, '');
        viewHtml = viewHtml.replace(/\$user_email/g, 'admin@buchisapa.pe');
        viewHtml = viewHtml.replace(/\$active_title/g, view.charAt(0).toUpperCase() + view.slice(1));

        const adminOutDir = path.join(DIST_DIR, 'admin');
        if (!fs.existsSync(adminOutDir)) fs.mkdirSync(adminOutDir, { recursive: true });

        // dist/admin/{view}.html
        fs.writeFileSync(path.join(adminOutDir, `${view}.html`), viewHtml, 'utf8');

        if (view === 'dashboard') {
          // dist/admin/index.html y dist/admin.html
          fs.writeFileSync(path.join(adminOutDir, 'index.html'), viewHtml, 'utf8');
          fs.writeFileSync(path.join(DIST_DIR, 'admin.html'), viewHtml, 'utf8');
        }
      }
      console.log('✅ Vistas estáticas de respaldo del panel admin creadas para Vercel.');
    }
  } catch (err) {
    console.warn('⚠️ Error al pre-compilar panel admin de respaldo:', err.message);
  }

  console.log('✅ Rutas estáticas limpias creadas.');
}

compileHtml();
