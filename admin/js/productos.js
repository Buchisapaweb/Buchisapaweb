/**
 * BUCHISAPA BURGER & BROASTER - PRODUCTOS MODULE JS
 * admin/js/productos.js
 * Filtrado dinámico por categorías oficiales C0001-C0010, búsqueda en tiempo real e IDs PL000001
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
    { id: 'C0001', code: 'C0001', slug: 'promociones',       name: '⭐ PROMOCIONES' },
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
 * Abrir Modal de Creación de Plato
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
        <label class="flex items-center gap-1.5 p-1.5 bg-[#0a0d16] border border-slate-800 rounded-lg text-[11px] text-slate-300 cursor-pointer hover:border-orange-500/50">
            <input type="checkbox" name="cremas[]" value="${sauce}" class="rounded text-orange-500 focus:ring-0">
            <span>${sauce}</span>
        </label>
        `;
    });

    const html = `
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
                <span class="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                <h3 class="text-sm font-black uppercase text-white tracking-wider">
                    Nuevo Plato de la Carta
                </h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono-numbers font-bold bg-orange-950/40 border border-orange-500/40 text-orange-400">ID: ${nextPlatoId}</span>
            </div>
            <button type="button" onclick="cerrarModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <form action="/admin?view=productos" method="POST" class="space-y-4 text-xs">
            <input type="hidden" name="action" value="create">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Código / ID del Plato (Formato PL000001) *</label>
                    <input type="text" name="id" value="${nextPlatoId}" required pattern="^PL\\d{6}$" title="El ID debe seguir el formato PL seguido de 6 dígitos (ej: PL000062)" class="w-full bg-[#0a0d16] border border-orange-500/40 text-orange-400 font-mono-numbers font-black rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Categoría Oficial (C0001 - C0010) *</label>
                    <select name="category" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                        ${catOptions}
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Nombre del Plato *</label>
                <input type="text" name="name" required placeholder="Ej: Tacacho con Cecina Especial" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
            </div>

            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Precio Venta (S/) *</label>
                    <input type="number" step="0.5" name="price" required placeholder="15.00" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Stock Disponible</label>
                    <input type="number" name="stock" value="25" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Distintivo / Badge</label>
                    <input type="text" name="badge" placeholder="SELVA, TÍPICO, POPULAR" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">URL de Imagen</label>
                    <input type="text" name="image_url" value="/imagenes/productos/fallback.webp" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Disponibilidad</label>
                    <select name="available" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                        <option value="true" selected>Disponible</option>
                        <option value="false">Agotado / Desactivado</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Descripción para Clientes</label>
                <textarea name="description" rows="2" placeholder="Describe los ingredientes, punto de cocción y sabor característico..." class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"></textarea>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Acompañamientos / Guarniciones (separados por coma)</label>
                <textarea name="accompaniments" rows="2" placeholder="Papas fritas, Ensalada fresca de la casa, Plátano maduro frito..." class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"></textarea>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1.5 uppercase tracking-wider">Cremas y Salsas de la Casa Disponibles</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-800/80 rounded-xl bg-[#090d18]">
                    ${cremasCheckboxes}
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onclick="cerrarModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all">Cancelar</button>
                <button type="submit" class="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-all shadow-md">Guardar Plato en la Carta</button>
            </div>
        </form>
    `;
    abrirModalHtml(html);
}

/**
 * Abrir Modal de Edición de Plato
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
        <label class="flex items-center gap-1.5 p-1.5 bg-[#0a0d16] border border-slate-800 rounded-lg text-[11px] text-slate-300 cursor-pointer hover:border-orange-500/50">
            <input type="checkbox" name="cremas[]" value="${sauce}" ${checked} class="rounded text-orange-500 focus:ring-0">
            <span>${sauce}</span>
        </label>
        `;
    });

    const accompanimentsText = Array.isArray(p.accompaniments) ? p.accompaniments.join(', ') : (p.accompaniments || '');
    const isAvailable = (p.available === true || p.available === 'true' || p.available === undefined);

    const html = `
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
                <span class="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                <h3 class="text-sm font-black uppercase text-white tracking-wider truncate max-w-xs sm:max-w-sm">
                    Editar: ${p.name || ''}
                </h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono-numbers font-bold bg-orange-950/40 border border-orange-500/40 text-orange-400">ID: ${p.id || ''}</span>
            </div>
            <button type="button" onclick="cerrarModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <form action="/admin?view=productos" method="POST" class="space-y-4 text-xs">
            <input type="hidden" name="action" value="edit">
            <input type="hidden" name="id" value="${p.id || ''}">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Nombre del Plato *</label>
                    <input type="text" name="name" value="${p.name || ''}" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Categoría Oficial *</label>
                    <select name="category" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                        ${catOptions}
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Precio Venta (S/) *</label>
                    <input type="number" step="0.5" name="price" value="${p.price || 0}" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Stock en Cocina</label>
                    <input type="number" name="stock" value="${p.stock !== undefined ? p.stock : 25}" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono-numbers">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Distintivo / Badge</label>
                    <input type="text" name="badge" value="${p.badge || ''}" placeholder="SELVA, TÍPICO, POPULAR" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">URL de Imagen</label>
                    <input type="text" name="image_url" value="${p.image || '/imagenes/productos/fallback.webp'}" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Disponibilidad</label>
                    <select name="available" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                        <option value="true" ${isAvailable ? 'selected' : ''}>Disponible</option>
                        <option value="false" ${!isAvailable ? 'selected' : ''}>Agotado / Desactivado</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Descripción para Clientes</label>
                <textarea name="description" rows="2" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500">${p.description || ''}</textarea>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1 uppercase tracking-wider">Acompañamientos / Guarniciones (separados por coma)</label>
                <textarea name="accompaniments" rows="2" class="w-full bg-[#0a0d16] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500">${accompanimentsText}</textarea>
            </div>

            <div>
                <label class="block text-[10px] text-slate-400 font-extrabold mb-1.5 uppercase tracking-wider">Cremas y Salsas de la Casa Disponibles</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-800/80 rounded-xl bg-[#090d18]">
                    ${cremasCheckboxes}
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onclick="cerrarModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all">Cancelar</button>
                <button type="submit" class="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-all shadow-md">Actualizar Plato</button>
            </div>
        </form>
    `;
    abrirModalHtml(html);
}

function abrirModalHtml(html) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (container && content) {
        content.innerHTML = html;
        container.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function cerrarModal() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.classList.add('hidden');
    }
}
