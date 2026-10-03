/**
 * BUCHISAPA BURGER & BROASTER - PRODUCTOS MODULE JS
 * admin/js/productos.js
 * Filtrado dinámico por categorías oficiales C0001-C0010, búsqueda en tiempo real,
 * imágenes cuadradas en tarjetas y formulario de edición a PANTALLA COMPLETA
 */

const ALL_AVAILABLE_SAUCES = [
    'Mayonesa',
    'Mostaza',
    'Ketchup',
    'Ají de Rocoto',
    'Tártara',
    'Ají Charapita',
    'Acevichada',
    'Salsa BBQ',
    'Salsa Golf',
    'Ocopa',
    'Aceituna',
    'Vinagreta'
];

var activeCategories = (typeof window !== 'undefined' && window.activeCategories) ? window.activeCategories : [
    { id: 'C0001', code: 'C0001', slug: 'promociones',       name: 'PROMOCIONES' },
    { id: 'C0002', code: 'C0002', slug: 'alitas',            name: 'ALITAS' },
    { id: 'C0003', code: 'C0003', slug: 'bebidas',           name: 'BEBIDAS' },
    { id: 'C0004', code: 'C0004', slug: 'broaster',          name: 'BROASTER' },
    { id: 'C0005', code: 'C0005', slug: 'hamburguesas',      name: 'HAMBURGUESAS' },
    { id: 'C0006', code: 'C0006', slug: 'infusiones',        name: 'INFUSIONES' },
    { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS' },
    { id: 'C0008', code: 'C0008', slug: 'refrescos',         name: 'REFRESCOS' },
    { id: 'C0009', code: 'C0009', slug: 'salchipapas',       name: 'SALCHIPAPAS Y SALCHIBROASTERS' },
    { id: 'C0010', code: 'C0010', slug: 'adicional',         name: 'ADICIONAL' }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('productos-categories-data');
    if (container) {
        try {
            const rawCategories = container.getAttribute('data-categories');
            if (rawCategories) {
                activeCategories = JSON.parse(rawCategories);
            }
        } catch (e) {
            console.error('Error parsing categories data:', e);
        }
    }
    console.log("🍔 Productos Module Initialized con IDs oficiales C0001 y PL000001");
});

/**
 * Filtra los bloques de categorías y los platos según la pestaña seleccionada
 */
function seleccionarFiltroCategoria(catId) {
    document.querySelectorAll('.category-tab-btn').forEach(btn => {
        const bCat = btn.getAttribute('data-cat');
        const bSlug = btn.getAttribute('data-cat-slug');
        if (bCat === catId || bSlug === catId) {
            btn.classList.add('active', 'bg-orange-600', 'text-white');
            btn.classList.remove('bg-[#0f1424]', 'text-slate-400');
        } else {
            btn.classList.remove('active', 'bg-orange-600', 'text-white');
            btn.classList.add('bg-[#0f1424]', 'text-slate-400');
        }
    });

    const blocks = document.querySelectorAll('.category-block');
    blocks.forEach(block => {
        if (catId === 'all') {
            block.style.display = '';
        } else {
            const bCat = block.getAttribute('data-cat-id');
            const bSlug = block.getAttribute('data-cat-slug');
            block.style.display = (bCat === catId || bSlug === catId) ? '' : 'none';
        }
    });
}

/**
 * Filtrado de búsqueda en tiempo real
 */
function filtrarPlatos() {
    const input = document.getElementById('productos-search');
    if (!input) return;
    const filter = input.value.toLowerCase().trim();

    const cards = document.querySelectorAll('.producto-card');
    cards.forEach(card => {
        const target = (card.getAttribute('data-search-target') || '').toLowerCase();
        card.style.display = target.includes(filter) ? '' : 'none';
    });

    // Ocultar sección completa si no tiene ningún plato visible
    document.querySelectorAll('.category-block').forEach(block => {
        const visibleCards = block.querySelectorAll('.producto-card:not([style*="display: none"])');
        if (filter.length > 0 && visibleCards.length === 0) {
            block.style.display = 'none';
        } else {
            const currentTab = document.querySelector('.category-tab-btn.active')?.getAttribute('data-cat') || 'all';
            const bCat = block.getAttribute('data-cat-id');
            const bSlug = block.getAttribute('data-cat-slug');
            if (currentTab === 'all' || bCat === currentTab || bSlug === currentTab) {
                block.style.display = '';
            }
        }
    });
}

/**
 * Calcula el siguiente ID con formato estándar PL000001
 */
function calcularSiguientePlatoId() {
    let maxNum = 0;
    document.querySelectorAll('.producto-card').forEach(card => {
        const text = card.textContent || '';
        const match = text.match(/PL(\d{6})/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    if (maxNum === 0) maxNum = 61;
    const next = maxNum + 1;
    return 'PL' + String(next).padStart(6, '0');
}

/**
 * Abrir Formulario de Creación de Plato a PANTALLA COMPLETA
 */
function abrirCrearProductoModal() {
    const nextPlatoId = calcularSiguientePlatoId();
    let catOptions = '';
    activeCategories.forEach(c => {
        catOptions += `<option value="${c.id}">[${c.id}] ${c.name}</option>`;
    });

    let cremasCheckboxes = '';
    ALL_AVAILABLE_SAUCES.forEach(sauce => {
        cremasCheckboxes += `
        <label class="flex items-center gap-2 p-2.5 bg-[#0a0d16] border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer hover:border-orange-500/60 transition-all select-none">
            <input type="checkbox" name="cremas[]" value="${sauce}" class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-0">
            <span class="font-medium">${sauce}</span>
        </label>
        `;
    });

    const html = `
        <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col py-4 sm:py-6 animate-fade-in">
            <!-- Barra Superior Fija / Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800/80 sticky top-0 bg-[#070a13] z-20">
                <div class="flex items-center gap-3">
                    <button type="button" onclick="cerrarModal()" class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all border border-slate-700/60 active-press">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    <div>
                        <div class="flex items-center gap-2.5">
                            <span class="w-2 h-5 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Agregar Nuevo Plato</h2>
                            <span class="px-2.5 py-0.5 rounded-lg text-xs font-mono-numbers font-black bg-orange-950/50 border border-orange-500/50 text-orange-400">ID: ${nextPlatoId}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">Configura los datos del plato, precios, stock, acompañamientos y cremas</p>
                    </div>
                </div>

                <div class="flex items-center gap-2.5 self-end sm:self-auto">
                    <button type="button" onclick="cerrarModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-xs">
                        Cancelar
                    </button>
                    <button type="submit" form="producto-form" class="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl transition-all shadow-lg text-xs flex items-center gap-2 active-press">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Guardar Plato en la Carta</span>
                    </button>
                </div>
            </div>

            <!-- Formulario a Pantalla Completa con 2 Columnas Principales -->
            <form id="producto-form" action="/admin?view=productos" method="POST" class="space-y-6 flex-1 pb-16">
                <input type="hidden" name="action" value="create">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    <!-- Columna Izquierda: Información Básica y Comercial (7 cols) -->
                    <div class="lg:col-span-7 space-y-5">
                        
                        <!-- Bloque 1: Identificación y Categoría -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-4">
                            <h3 class="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="tag" class="w-4 h-4"></i> Identificación del Plato
                            </h3>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Código / ID Oficial *</label>
                                    <input type="text" name="id" value="${nextPlatoId}" required pattern="^PL\\d{6}$" title="El ID debe seguir el formato PL seguido de 6 dígitos (ej: PL000062)" class="w-full bg-[#070a13] border border-orange-500/50 text-orange-400 font-mono-numbers font-black rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Categoría Oficial (C0001 - C0010) *</label>
                                    <select name="category" required class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                                        ${catOptions}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Nombre del Plato *</label>
                                <input type="text" name="name" required placeholder="Ej: Hamburguesa Buchisapa Doble Carne" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-bold placeholder:text-slate-600">
                            </div>
                        </div>

                        <!-- Bloque 2: Precios, Stock y Estado -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-4">
                            <h3 class="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="dollar-sign" class="w-4 h-4"></i> Precio, Stock y Disponibilidad
                            </h3>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Precio Venta (S/) *</label>
                                    <input type="number" step="0.5" name="price" required placeholder="25.00" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-mono-numbers font-black focus:outline-none focus:border-orange-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Stock en Cocina</label>
                                    <input type="number" name="stock" value="25" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono-numbers font-bold focus:outline-none focus:border-orange-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Distintivo / Badge</label>
                                    <input type="text" name="badge" placeholder="PROMO, SELVA, POPULAR" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 uppercase placeholder:text-slate-600">
                                </div>
                            </div>

                            <div>
                                <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Disponibilidad en Carta</label>
                                <select name="available" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                                    <option value="true" selected>Disponible para Pedidos</option>
                                    <option value="false">Agotado / Desactivado Temporalmente</option>
                                </select>
                            </div>
                        </div>

                        <!-- Bloque 3: Descripción Detallada -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                                <i data-lucide="file-text" class="w-4 h-4 text-orange-400"></i> Descripción del Plato
                            </h3>
                            <textarea name="description" rows="3" placeholder="Describe los ingredientes, la sazón, la guarnición y porciones..." class="w-full bg-[#070a13] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 placeholder:text-slate-600 leading-relaxed"></textarea>
                        </div>
                    </div>

                    <!-- Columna Derecha: Imagen, Acompañamientos y Cremas (5 cols) -->
                    <div class="lg:col-span-5 space-y-5">
                        
                        <!-- Bloque 4: Imagen del Producto (Cuadrada) -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="image" class="w-4 h-4"></i> Imagen del Producto (Cuadrada)
                            </h3>
                            
                            <div>
                                <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">URL de la Imagen *</label>
                                <input type="text" id="create-image-input" name="image_url" value="/imagenes/productos/fallback.webp" oninput="document.getElementById('create-image-preview').src = this.value" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500">
                            </div>

                            <!-- Vista Previa Cuadrada Grande -->
                            <div class="mt-2">
                                <span class="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-1.5">Vista Previa:</span>
                                <div class="w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#070a13] shadow-inner relative group">
                                    <img id="create-image-preview" src="/imagenes/productos/fallback.webp" class="w-full h-full object-cover" onerror="this.src='/imagenes/productos/fallback.webp'">
                                </div>
                            </div>
                        </div>

                        <!-- Bloque 5: Acompañamientos -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-yellow-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="utensils-crossed" class="w-4 h-4"></i> Acompañamientos / Guarniciones
                            </h3>
                            <p class="text-[11px] text-slate-400">Ingresa los acompañamientos separados por coma (ej. Papas fritas, Ensalada fresca, Plátanos fritos):</p>
                            <textarea name="accompaniments" rows="2" placeholder="Papas fritas familiares, Ensalada cocida, Chicha morada 1.5L..." class="w-full bg-[#070a13] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 placeholder:text-slate-600"></textarea>
                        </div>

                        <!-- Bloque 6: Cremas Disponibles -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="sparkles" class="w-4 h-4"></i> Cremas y Salsas de la Casa
                            </h3>
                            <p class="text-[11px] text-slate-400">Selecciona las cremas que el cliente podrá elegir para este plato:</p>
                            <div class="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1.5 border border-slate-800/80 rounded-xl bg-[#070a13]">
                                ${cremasCheckboxes}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
    abrirModalHtml(html);
}

/**
 * Abrir Formulario de Edición de Plato a PANTALLA COMPLETA
 */
function abrirEditarProductoModal(p) {
    if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch(e){}
    }

    let catOptions = '';
    const currentCat = p.category_id || p.category || '';
    activeCategories.forEach(c => {
        const isSel = (c.id === currentCat || c.slug === currentCat || c.code === currentCat) ? 'selected' : '';
        catOptions += `<option value="${c.id}" ${isSel}>[${c.id}] ${c.name}</option>`;
    });

    const currentCremas = Array.isArray(p.cremas) ? p.cremas : [];
    let cremasCheckboxes = '';
    ALL_AVAILABLE_SAUCES.forEach(sauce => {
        const checked = currentCremas.includes(sauce) ? 'checked' : '';
        cremasCheckboxes += `
        <label class="flex items-center gap-2 p-2.5 bg-[#0a0d16] border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer hover:border-orange-500/60 transition-all select-none">
            <input type="checkbox" name="cremas[]" value="${sauce}" ${checked} class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-0">
            <span class="font-medium">${sauce}</span>
        </label>
        `;
    });

    const accompanimentsText = Array.isArray(p.accompaniments) ? p.accompaniments.join(', ') : (p.accompaniments || '');
    const isAvailable = (p.available === true || p.available === 'true' || p.available === undefined);
    const imageUrl = p.image || '/imagenes/productos/fallback.webp';

    const html = `
        <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col py-4 sm:py-6 animate-fade-in">
            <!-- Barra Superior Fija / Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800/80 sticky top-0 bg-[#070a13] z-20">
                <div class="flex items-center gap-3">
                    <button type="button" onclick="cerrarModal()" class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all border border-slate-700/60 active-press">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    <div>
                        <div class="flex items-center gap-2.5">
                            <span class="w-2 h-5 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-md">Editar: ${p.name || ''}</h2>
                            <span class="px-2.5 py-0.5 rounded-lg text-xs font-mono-numbers font-black bg-orange-950/50 border border-orange-500/50 text-orange-400">ID: ${p.id || ''}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">Modifica los detalles, precios, fotos, acompañamientos y cremas</p>
                    </div>
                </div>

                <div class="flex items-center gap-2.5 self-end sm:self-auto">
                    <button type="button" onclick="cerrarModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-xs">
                        Cancelar
                    </button>
                    <button type="submit" form="producto-edit-form" class="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl transition-all shadow-lg text-xs flex items-center gap-2 active-press">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Actualizar Plato</span>
                    </button>
                </div>
            </div>

            <!-- Formulario a Pantalla Completa con 2 Columnas -->
            <form id="producto-edit-form" action="/admin?view=productos" method="POST" class="space-y-6 flex-1 pb-16">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" value="${p.id || ''}">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    <!-- Columna Izquierda: Información Básica y Comercial (7 cols) -->
                    <div class="lg:col-span-7 space-y-5">
                        
                        <!-- Bloque 1: Identificación y Categoría -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-4">
                            <h3 class="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="tag" class="w-4 h-4"></i> Identificación del Plato
                            </h3>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Código / ID Oficial (Fijo)</label>
                                    <input type="text" value="${p.id || ''}" disabled class="w-full bg-[#070a13] border border-slate-800 text-orange-400 font-mono-numbers font-black rounded-xl px-3.5 py-2.5 text-sm opacity-80 cursor-not-allowed">
                                </div>
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Categoría Oficial *</label>
                                    <select name="category" required class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                                        ${catOptions}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Nombre del Plato *</label>
                                <input type="text" name="name" value="${p.name || ''}" required class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-bold">
                            </div>
                        </div>

                        <!-- Bloque 2: Precios, Stock y Estado -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-4">
                            <h3 class="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="dollar-sign" class="w-4 h-4"></i> Precio, Stock y Disponibilidad
                            </h3>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Precio Venta (S/) *</label>
                                    <input type="number" step="0.5" name="price" value="${p.price || 0}" required class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-mono-numbers font-black focus:outline-none focus:border-orange-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Stock en Cocina</label>
                                    <input type="number" name="stock" value="${p.stock !== undefined ? p.stock : 25}" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono-numbers font-bold focus:outline-none focus:border-orange-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Distintivo / Badge</label>
                                    <input type="text" name="badge" value="${p.badge || ''}" placeholder="PROMO, SELVA, POPULAR" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 uppercase">
                                </div>
                            </div>

                            <div>
                                <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">Disponibilidad en Carta</label>
                                <select name="available" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                                    <option value="true" ${isAvailable ? 'selected' : ''}>Disponible para Pedidos</option>
                                    <option value="false" ${!isAvailable ? 'selected' : ''}>Agotado / Desactivado Temporalmente</option>
                                </select>
                            </div>
                        </div>

                        <!-- Bloque 3: Descripción Detallada -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                                <i data-lucide="file-text" class="w-4 h-4 text-orange-400"></i> Descripción del Plato
                            </h3>
                            <textarea name="description" rows="3" class="w-full bg-[#070a13] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 leading-relaxed">${p.description || ''}</textarea>
                        </div>
                    </div>

                    <!-- Columna Derecha: Imagen, Acompañamientos y Cremas (5 cols) -->
                    <div class="lg:col-span-5 space-y-5">
                        
                        <!-- Bloque 4: Imagen del Producto (Cuadrada) -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="image" class="w-4 h-4"></i> Imagen del Producto (Cuadrada)
                            </h3>
                            
                            <div>
                                <label class="block text-[11px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider">URL de la Imagen *</label>
                                <input type="text" id="edit-image-input" name="image_url" value="${imageUrl}" oninput="document.getElementById('edit-image-preview').src = this.value" class="w-full bg-[#070a13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500">
                            </div>

                            <!-- Vista Previa Cuadrada Grande -->
                            <div class="mt-2">
                                <span class="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-1.5">Vista Previa:</span>
                                <div class="w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#070a13] shadow-inner relative group">
                                    <img id="edit-image-preview" src="${imageUrl}" class="w-full h-full object-cover" onerror="this.src='/imagenes/productos/fallback.webp'">
                                </div>
                            </div>
                        </div>

                        <!-- Bloque 5: Acompañamientos -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-yellow-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="utensils-crossed" class="w-4 h-4"></i> Acompañamientos / Guarniciones
                            </h3>
                            <p class="text-[11px] text-slate-400">Ingresa los acompañamientos separados por coma:</p>
                            <textarea name="accompaniments" rows="2" class="w-full bg-[#070a13] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500">${accompanimentsText}</textarea>
                        </div>

                        <!-- Bloque 6: Cremas Disponibles -->
                        <div class="p-5 bg-[#0e1424] border border-slate-800/80 rounded-2xl space-y-3">
                            <h3 class="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-2">
                                <i data-lucide="sparkles" class="w-4 h-4"></i> Cremas y Salsas de la Casa
                            </h3>
                            <p class="text-[11px] text-slate-400">Selecciona las cremas disponibles para este plato:</p>
                            <div class="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1.5 border border-slate-800/80 rounded-xl bg-[#070a13]">
                                ${cremasCheckboxes}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
    abrirModalHtml(html);
}

function abrirModalHtml(html) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (container && content) {
        content.innerHTML = html;
        container.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function cerrarModal() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}
