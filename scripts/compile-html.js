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

  // 2. Copiar archivos de public, admin y data a dist
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
      fs.writeFileSync(path.join(DIST_DIR, `${page.outName}.html`), content, 'utf8');
      
      const pageDir = path.join(DIST_DIR, page.outName);
      if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, 'index.html'), content, 'utf8');
    }
  }

  // 4. Pre-compilar Panel de Administración estático completo y 100% funcional para Vercel
  try {
    const headerPath = path.join(ROOT_DIR, 'admin/includes/header.php');
    const sidebarPath = path.join(ROOT_DIR, 'admin/includes/sidebar.php');
    const topbarPath = path.join(ROOT_DIR, 'admin/includes/topbar.php');
    const footerPath = path.join(ROOT_DIR, 'admin/includes/footer.php');

    const productsPath = path.join(ROOT_DIR, 'data/products.json');
    const categoriesPath = path.join(ROOT_DIR, 'data/categories.json');

    const products = fs.existsSync(productsPath) ? JSON.parse(fs.readFileSync(productsPath, 'utf8')) : [];
    const categories = fs.existsSync(categoriesPath) ? JSON.parse(fs.readFileSync(categoriesPath, 'utf8')) : [];

    if (fs.existsSync(headerPath) && fs.existsSync(sidebarPath) && fs.existsSync(topbarPath) && fs.existsSync(footerPath)) {
      const rawHeader = fs.readFileSync(headerPath, 'utf8');
      const rawSidebar = fs.readFileSync(sidebarPath, 'utf8');
      const rawTopbar = fs.readFileSync(topbarPath, 'utf8');
      const rawFooter = fs.readFileSync(footerPath, 'utf8');

      const CATEGORIAS_DEFINIDAS = [
        { id: 'C0001', code: 'C0001', slug: 'promociones',       name: '⭐ PROMOCIONES',               icon: 'sparkles',  color: '#f59e0b', desc: 'Combos especiales, ofertas de la semana y paquetes familiares.' },
        { id: 'C0002', code: 'C0002', slug: 'alitas',            name: 'ALITAS',                       icon: 'flame',     color: '#ef4444', desc: 'Alitas crujientes en salsa acevichada, BBQ y cremas de la casa.' },
        { id: 'C0003', code: 'C0003', slug: 'bebidas',           name: 'BEBIDAS',                      icon: 'cup-soda',  color: '#06b6d4', desc: 'Gaseosas heladas, agua mineral y bebidas embotelladas.' },
        { id: 'C0004', code: 'C0004', slug: 'broaster',          name: 'BROASTER',                     icon: 'drumstick', color: '#f97316', desc: 'Pollo broaster ultra crocante con papas doradas y cremas.' },
        { id: 'C0005', code: 'C0005', slug: 'hamburguesas',      name: 'HAMBURGUESAS',                 icon: 'beef',      color: '#eab308', desc: 'Hamburguesas artesanales, choripanes y sándwiches especiales.' },
        { id: 'C0006', code: 'C0006', slug: 'infusiones',        name: 'INFUSIONES',                   icon: 'coffee',    color: '#10b981', desc: 'Infusiones calientes, café aromático pasado y manzanilla.' },
        { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS',            icon: 'utensils',  color: '#8b5cf6', desc: 'Auténticos sabores de la selva: tacacho, cecina, chorizo y patacones.' },
        { id: 'C0008', code: 'C0008', slug: 'refrescos',         name: 'REFRESCOS',                    icon: 'glass-water',color: '#3b82f6', desc: 'Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.' },
        { id: 'C0009', code: 'C0009', slug: 'salchipapas',       name: 'SALCHIPAPAS Y SALCHIBROASTERS', icon: 'layers',    color: '#ec4899', desc: 'Papas crocantes, salchichas frankfurter y combinaciones broaster.' },
        { id: 'C0010', code: 'C0010', slug: 'adicional',         name: 'ADICIONAL',                    icon: 'plus-circle',color: '#94a3b8', desc: 'Porciones extra, salsas especiales, cremas adicionales y guarniciones.' }
      ];

      const adminViews = ['dashboard', 'productos', 'clientes', 'pedidos', 'ticket', 'configuracion'];

      for (const view of adminViews) {
        const viewPath = path.join(ROOT_DIR, `admin/views/${view}.php`);
        if (!fs.existsSync(viewPath)) continue;

        let cleanHeader = rawHeader.replace(/<\?php[\s\S]*?\?>/g, '');
        let cleanSidebar = rawSidebar;
        let cleanTopbar = rawTopbar.replace(/<\?php[\s\S]*?\?>/g, '');
        let viewContent = fs.readFileSync(viewPath, 'utf8');

        // Resaltar ítem activo en sidebar
        const activeClass = 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20';
        const inactiveClass = 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100';

        cleanSidebar = cleanSidebar.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'dashboard'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'dashboard' ? activeClass : inactiveClass);
        cleanSidebar = cleanSidebar.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'clientes'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'clientes' ? activeClass : inactiveClass);
        cleanSidebar = cleanSidebar.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'productos'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'productos' ? activeClass : inactiveClass);
        cleanSidebar = cleanSidebar.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'pedidos'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'pedidos' ? activeClass : inactiveClass);
        cleanSidebar = cleanSidebar.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'ticket'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'ticket' ? activeClass : inactiveClass);
        cleanSidebar = cleanSidebar.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'configuracion'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'configuracion' ? activeClass : inactiveClass);
        cleanSidebar = cleanSidebar.replace(/<\?php[\s\S]*?\?>/g, '');

        let footerScripts = `<script src="/admin/js/${view}.js"></script>`;
        if (view === 'dashboard') {
          footerScripts = `<script src="/admin/js/chart.min.js"></script>\n    ${footerScripts}`;
        }
        let cleanFooter = rawFooter.replace(/<\?php[\s\S]*?\?>/g, footerScripts);

        let viewHtml = cleanHeader;
        viewHtml += `
        <div class="flex h-screen overflow-hidden">
            ${cleanSidebar}
            <div class="flex-1 flex flex-col overflow-hidden">
                ${cleanTopbar}
                <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
                    ${viewContent}
                </main>
            </div>
        </div>
        `;
        viewHtml += cleanFooter;

        // Limpiar directivas PHP y asignar metadatos
        viewHtml = viewHtml.replace(/<\?php\s+if\s*\(!empty\(\$success\)\):\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, '');
        viewHtml = viewHtml.replace(/<\?php\s+if\s*\(!empty\(\$error\)\):\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, '');
        viewHtml = viewHtml.replace(/<\?php[\s\S]*?require_once[\s\S]*?\?>/g, '');
        viewHtml = viewHtml.replace(/<\?php[\s\S]*?checkAdminAuth\(\);[\s\S]*?\?>/g, '');

        const view_title = view === 'dashboard' ? 'Dashboard' : view === 'clientes' ? 'Clientes' : view === 'productos' ? 'Productos' : view === 'pedidos' ? 'Pedidos y Comandas' : view === 'ticket' ? 'Ticket' : 'Configuración';
        viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$active_title;\s*\?>/g, view_title);
        viewHtml = viewHtml.replace(/<\?php\s+echo\s+htmlspecialchars\(\$active_title\);\s*\?>/g, view_title);
        viewHtml = viewHtml.replace(/<\?php\s+echo\s+htmlspecialchars\(\$user_email\);\s*\?>/g, 'admin@buchisapa.pe');
        viewHtml = viewHtml.replace(/<\?php\s+echo\s+substr\(\$user_email,\s*0,\s*2\);\s*\?>/g, 'AD');
        viewHtml = viewHtml.replace(/<\?php\s+echo\s+date\('H:i:s'\);\s*\?>/g, '12:00:00');

        // Renderizado específico según vista
        if (view === 'dashboard') {
          const defaultWeekly = [0, 0, 0, 0, 0, 0, 0];
          const defaultCategories = {
            'promociones': 0, 'alitas': 0, 'bebidas': 0, 'broaster': 0,
            'hamburguesas': 0, 'infusiones': 0, 'platos-amazonicos': 0,
            'refrescos': 0, 'salchipapas': 0, 'adicional': 0
          };
          const totalCriticos = products.filter(p => parseInt(String(p.stock || '0'), 10) <= 5).length;

          viewHtml = viewHtml.replace(/<\?php\s+echo\s+number_format\(\$ventas_totales,\s*2\);\s*\?>/g, '0.00');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$pedidos_atendidos;\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+count\(\$clientes\);\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$stock_critico_count;\s*\?>/g, String(totalCriticos));
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$stock_critico_count\s*>\s*0\s*\?\s*'text-red-400 font-black animate-pulse'\s*:\s*'text-white';\s*\?>/g, totalCriticos > 0 ? 'text-red-400 font-black animate-pulse' : 'text-white');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$stock_critico_count\s*>\s*0\s*\?\s*'animate-pulse-glow'\s*:\s*'';\s*\?>/g, totalCriticos > 0 ? 'animate-pulse-glow' : '');
          
          viewHtml = viewHtml.replace(/data-weekly="[^"]*"/g, `data-weekly='${JSON.stringify(defaultWeekly)}'`);
          viewHtml = viewHtml.replace(/data-categories='[^']*'/g, `data-categories='${JSON.stringify(defaultCategories)}'`);
          viewHtml = viewHtml.replace(/window\.dashboardData\s*=\s*\{[\s\S]*?\};/g, `window.dashboardData = { weekly: ${JSON.stringify(defaultWeekly)}, categories: ${JSON.stringify(defaultCategories)} };`);
        } else if (view === 'productos') {
          const totalProductos = products.length;
          const totalDisponibles = products.filter(p => p.available !== false).length;
          const totalCriticos = products.filter(p => parseInt(String(p.stock || '0'), 10) <= 5).length;

          let filterTabsHtml = `
              <button type="button" onclick="seleccionarFiltroCategoria('all')" class="category-tab-btn active px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 bg-orange-600 text-white" data-cat="all">
                  Todos (${totalProductos})
              </button>
          `;
          CATEGORIAS_DEFINIDAS.forEach(cat => {
              const countInCat = products.filter(p => (
                  (p.category_id || '') === cat.id || 
                  (p.category_id || '') === cat.slug || 
                  (p.category || '') === cat.id || 
                  (p.category || '') === cat.slug
              )).length;
              filterTabsHtml += `
              <button type="button" onclick="seleccionarFiltroCategoria('${cat.id}')" class="category-tab-btn px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 text-slate-400 hover:text-white bg-[#0f1424] border border-slate-800" data-cat="${cat.id}" data-cat-slug="${cat.slug}">
                  <span class="font-mono-numbers text-[9px] text-orange-400/90 font-bold mr-1">${cat.id}</span> ${cat.name} (${countInCat})
              </button>
              `;
          });

          let categoriesBlocksHtml = '';
          CATEGORIAS_DEFINIDAS.forEach(cat => {
              const platosEnCat = products.filter(p => (
                  (p.category_id || '') === cat.id || 
                  (p.category_id || '') === cat.slug || 
                  (p.category || '') === cat.id || 
                  (p.category || '') === cat.slug
              ));
              
              let cardsHtml = '';
              if (platosEnCat.length === 0) {
                  cardsHtml = `<div class="p-6 text-center text-slate-500 text-xs font-semibold bg-[#101424] rounded-xl border border-slate-800/60 col-span-full">No hay platos registrados en esta categoría aún.</div>`;
              } else {
                  cardsHtml = platosEnCat.map(p => {
                      const id = p.id || '';
                      const name = p.name || 'Sin nombre';
                      const desc = p.description || 'Delicioso plato preparado con ingredientes frescos.';
                      const price = parseFloat(p.price || '0');
                      const stock = parseInt(String(p.stock || '25'), 10);
                      const badge = p.badge || '';
                      const image = p.image || '/imagenes/productos/fallback.webp';
                      const available = p.available !== false;
                      const isCrit = stock <= 5;
                      const accompaniments = Array.isArray(p.accompaniments) ? p.accompaniments : [];
                      const cremas = Array.isArray(p.cremas) ? p.cremas : [];

                      const accHtml = accompaniments.length > 0 
                          ? `<div class="flex flex-wrap gap-1">${accompaniments.map((a) => `<span class="text-[9px] font-bold px-1.5 py-0.5 bg-[#0a0d16] border border-slate-800 text-slate-300 rounded">${a}</span>`).join('')}</div>`
                          : `<span class="text-[9px] text-slate-500 italic">Sin acompañamiento directo (Bebida / Individual)</span>`;

                      const cremasHtml = cremas.length > 0
                          ? `<div class="flex flex-wrap gap-1">${cremas.map((c) => `<span class="text-[9px] font-bold px-1.5 py-0.5 bg-orange-950/20 border border-orange-900/40 text-orange-300 rounded">${c}</span>`).join('')}</div>`
                          : `<span class="text-[9px] text-slate-500 italic">No incluye cremas</span>`;

                      const badgeHtml = badge 
                          ? `<span class="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-600/90 text-[8px] font-black text-white uppercase rounded tracking-wider shadow">${badge}</span>` 
                          : '';

                      const pJsonStr = JSON.stringify(p).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

                      return `
                      <div class="producto-card bg-[#111728] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-md relative overflow-hidden group select-none" data-search-target="${(name + ' ' + desc + ' ' + accompaniments.join(' ') + ' ' + cremas.join(' ')).toLowerCase()}">
                          <div class="space-y-3">
                              <div class="flex gap-3">
                                  <div class="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-[#0a0d16]">
                                      <img src="${image}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/imagenes/productos/fallback.webp'">
                                      ${badgeHtml}
                                  </div>
                                  <div class="flex-1 min-w-0">
                                      <div class="flex items-start justify-between gap-1">
                                          <h4 class="font-black text-sm text-white truncate leading-tight">${name}</h4>
                                          <span class="font-mono-numbers font-black text-sm text-emerald-400 shrink-0">S/ ${price.toFixed(2)}</span>
                                      </div>
                                      <div class="flex items-center gap-2 mt-1">
                                          <span class="inline-flex items-center gap-1 text-[10px] font-mono-numbers font-bold ${isCrit ? 'text-red-400 animate-pulse' : 'text-slate-400'}">
                                              <i data-lucide="package" class="w-3 h-3"></i> Stock: ${stock}
                                          </span>
                                          <span class="text-slate-600">·</span>
                                          <span class="text-[9px] font-black uppercase ${available ? 'text-emerald-400' : 'text-slate-500'}">
                                              ${available ? 'Disponible' : 'Agotado'}
                                          </span>
                                      </div>
                                      <p class="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">${desc}</p>
                                  </div>
                              </div>

                              <div class="pt-2.5 border-t border-slate-800/60">
                                  <span class="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                                      <i data-lucide="utensils-crossed" class="w-2.5 h-2.5 inline mr-1 text-orange-400"></i> Acompañamientos:
                                  </span>
                                  ${accHtml}
                              </div>

                              <div class="pt-2 border-t border-slate-800/60">
                                  <span class="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                                      <i data-lucide="sparkles" class="w-2.5 h-2.5 inline mr-1 text-yellow-400"></i> Cremas incluidas:
                                  </span>
                                  ${cremasHtml}
                              </div>
                          </div>

                          <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60">
                              <span class="text-[9px] font-mono-numbers text-slate-400 font-bold bg-[#0a0d16] px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                                  <span class="text-slate-500">ID:</span>
                                  <span class="text-orange-400 font-mono-numbers">${id}</span>
                              </span>
                              <div class="flex items-center gap-1.5">
                                  <button type="button" onclick='abrirEditarProductoModal(${pJsonStr})' class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[11px] font-black transition-all flex items-center gap-1">
                                      <i data-lucide="edit-3" class="w-3 h-3"></i> Editar
                                  </button>
                                  <form method="POST" action="/admin?view=productos" onsubmit="return confirm('¿Seguro que deseas eliminar este plato?');" class="inline">
                                      <input type="hidden" name="action" value="delete">
                                      <input type="hidden" name="id" value="${id}">
                                      <button type="submit" class="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                      </button>
                                  </form>
                              </div>
                          </div>
                      </div>
                      `;
                  }).join('\n');
              }

              categoriesBlocksHtml += `
              <section class="category-block space-y-4 pt-2" id="category-section-${cat.id}" data-category-id="${cat.id}" data-category-slug="${cat.slug}">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-[#0f1424] border border-slate-800/80 rounded-2xl">
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${cat.color}20; border: 1px solid ${cat.color}40; color: ${cat.color};">
                              <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
                          </div>
                          <div>
                              <div class="flex items-center gap-2">
                                  <span class="font-mono-numbers text-[10px] font-black px-2 py-0.5 rounded" style="background-color: ${cat.color}25; color: ${cat.color}; border: 1px solid ${cat.color}50;">
                                      ${cat.id}
                                  </span>
                                  <h3 class="text-base font-black text-white tracking-tight">${cat.name}</h3>
                              </div>
                              <p class="text-xs text-slate-400 mt-0.5">${cat.desc}</p>
                          </div>
                      </div>
                      <span class="text-xs font-bold text-slate-400 px-3 py-1 bg-[#090d18] rounded-xl border border-slate-800 self-start sm:self-auto shrink-0 font-mono-numbers">
                          ${platosEnCat.length} ${platosEnCat.length === 1 ? 'plato' : 'platos'}
                      </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      ${cardsHtml}
                  </div>
              </section>
              `;
          });

          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$total_productos;\s*\?>/g, String(totalProductos));
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$total_disponibles;\s*\?>/g, String(totalDisponibles));
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$total_criticos;\s*\?>/g, String(totalCriticos));

          viewHtml = viewHtml.replace(/<\?php[\s\S]*?foreach\s*\(\$CATEGORIAS_DEFINIDAS\s+as\s+\$cat\)[\s\S]*?endforeach;\s*\?>/g, filterTabsHtml);
          viewHtml = viewHtml.replace(/<!-- CATEGORIAS_BLOCKS_PLACEHOLDER -->/g, categoriesBlocksHtml);
          viewHtml = viewHtml.replace(/<div id="categorias-blocks-container">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Fin catálogo -->/g, `<div id="categorias-blocks-container">${categoriesBlocksHtml}</div></div><!-- Fin catálogo -->`);
          
          viewHtml = viewHtml.replace(/data-categories='[^']*'/g, `data-categories='${JSON.stringify(CATEGORIAS_DEFINIDAS)}'`);
        } else if (view === 'clientes') {
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+count\(\$clientes\);\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+if\s*\(empty\(\$clientes\)\):[\s\S]*?<\?php\s+else:\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-semibold">No se encontraron clientes registrados en la base de datos.</td></tr>`);
        } else if (view === 'pedidos') {
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+count\(\$pedidos\);\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$pedidos_por_estado\['recibido'\]\s*\?\?\s*0;\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$pedidos_por_estado\['en_cocina'\]\s*\?\?\s*0;\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$pedidos_por_estado\['en_camino'\]\s*\?\?\s*0;\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+echo\s+\$pedidos_por_estado\['entregado'\]\s*\?\?\s*0;\s*\?>/g, '0');
          viewHtml = viewHtml.replace(/<\?php\s+if\s*\(empty\(\$pedidos\)\):[\s\S]*?<\?php\s+else:\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, `<tr><td colspan="8" class="p-8 text-center text-slate-500 font-semibold">No hay comandas ni pedidos activos en este momento.</td></tr>`);
        } else if (view === 'ticket') {
          viewHtml = viewHtml.replace(/<\?php\s+if\s*\(empty\(\$pedidos\)\):[\s\S]*?<\?php\s+else:\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-semibold select-none">No hay pedidos disponibles para emitir tickets.</td></tr>`);
        }

        // Eliminar cualquier etiqueta PHP residual
        viewHtml = viewHtml.replace(/<\?php[\s\S]*?\?>/g, '');

        // Asegurar enlaces de CSS y JS específicos de la vista
        if (!viewHtml.includes(`/admin/css/${view}.css`) && fs.existsSync(path.join(ROOT_DIR, `admin/css/${view}.css`))) {
          viewHtml = viewHtml.replace('</head>', `  <link rel="stylesheet" href="/admin/css/${view}.css">\n</head>`);
        }
        if (!viewHtml.includes(`/admin/js/${view}.js`) && fs.existsSync(path.join(ROOT_DIR, `admin/js/${view}.js`))) {
          viewHtml = viewHtml.replace('</body>', `  <script src="/admin/js/${view}.js"></script>\n</body>`);
        }

        const adminOutDir = path.join(DIST_DIR, 'admin');
        if (!fs.existsSync(adminOutDir)) fs.mkdirSync(adminOutDir, { recursive: true });

        // Guardar dist/admin/{view}.html
        fs.writeFileSync(path.join(adminOutDir, `${view}.html`), viewHtml, 'utf8');

        if (view === 'dashboard') {
          // En dist/admin/index.html inyectamos el client-side view router para redireccionar parámetros ?view=xxx
          const indexHtmlWithRouter = viewHtml.replace('</body>', `
          <script>
            (function() {
              const urlParams = new URLSearchParams(window.location.search);
              const requestedView = urlParams.get('view');
              if (requestedView && requestedView !== 'dashboard') {
                const validViews = ['clientes', 'productos', 'pedidos', 'ticket', 'configuracion'];
                if (validViews.includes(requestedView)) {
                  window.location.replace('/admin/' + requestedView + '.html' + window.location.search);
                }
              }
            })();
          </script>
          </body>
          `);

          fs.writeFileSync(path.join(adminOutDir, 'index.html'), indexHtmlWithRouter, 'utf8');
          fs.writeFileSync(path.join(DIST_DIR, 'admin.html'), indexHtmlWithRouter, 'utf8');
        }
      }
      console.log('✅ Vistas completas del panel admin pre-compiladas y optimizadas para Vercel.');
    }
  } catch (err) {
    console.error('⚠️ Error al pre-compilar panel admin:', err);
  }

  console.log('✅ Rutas estáticas limpias y panel admin listos para producción.');
}

compileHtml();
