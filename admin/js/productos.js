/**
 * BUCHISAPA BURGER & BROASTER - PRODUCTOS MODULE JS
 * admin/js/productos.js
 * Gestión integral de platos, alto rendimiento, guardado y eliminación asíncrona,
 * selector de categorías personalizado sin scroll nativo y fotografía de plato en ancho completo.
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

/**
 * Acompañamientos Reales y Oficiales por Categoría y Plato de la Carta BuchiSapa
 */
/**
 * Acompañamientos Reales y Estandarizados por Categoría de la Carta BuchiSapa
 * Regla: Papa -> Papa crocante / Papas -> Papas crocantes / Ensalada -> Ensalada fresca
 */
const CATEGORY_REAL_ACCOMPANIMENTS = {
    'c0001': [ // PROMOCIONES
        'Papa crocante',
        'Hamburguesa artesanal',
        'Ensalada fresca',
        'Arroz',
        'Queso cheddar',
        'Maduros fritos',
        'Sarza criolla'
    ],
    'c0002': [ // ALITAS
        '5 alitas',
        'Papas crocantes'
    ],
    'c0003': [], // BEBIDAS (Sin acompañamientos)
    'c0004': [ // BROASTER
        'Papa crocante',
        'Ensalada fresca',
        'Arroz'
    ],
    'c0005': [ // HAMBURGUESAS
        'Hamburguesa artesanal',
        'Papa crocante',
        'Papas crocantes',
        'Carne artesanal',
        'Carne casera',
        'Pollo crispy',
        'Pollo deshilachado',
        'Pollo',
        'Chorizo',
        'Huevo',
        'Huevo frito',
        'Jamón',
        'Queso',
        'Queso cheddar',
        'Tocino',
        'Piña',
        'Plátano',
        'Ensalada fresca'
    ],
    'c0006': [], // INFUSIONES (Sin acompañamientos)
    'c0007': [ // PLATOS AMAZÓNICOS
        'Patacones',
        'Chorizo',
        'Maduros fritos',
        'Sarza criolla',
        'Inguiri',
        'Plátano',
        'Arroz',
        'Maduro frito',
        'Yuca',
        'Verduras de la selva',
        'Cecina y chorizo amazónico salteado'
    ],
    'c0008': [], // REFRESCOS (Sin acompañamientos)
    'c0009': [ // SALCHIPAPAS Y SALCHIBROASTERS
        'Papas crocantes',
        'Ensalada fresca'
    ],
    'c0010': [] // ADICIONALES (Sin acompañamientos)
};

var activeCategories = (typeof window !== 'undefined' && window.activeCategories) ? window.activeCategories : [
    { id: 'C0001', code: 'C0001', slug: 'promociones',       name: 'PROMOCIONES',                  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    { id: 'C0002', code: 'C0002', slug: 'alitas',            name: 'ALITAS',                       image: '/imagenes/categorias/alitas/banner.webp' },
    { id: 'C0003', code: 'C0003', slug: 'bebidas',           name: 'BEBIDAS',                      image: '/imagenes/categorias/bebidas/banner.webp' },
    { id: 'C0004', code: 'C0004', slug: 'broaster',          name: 'BROASTER',                     image: '/imagenes/categorias/broaster/banner.webp' },
    { id: 'C0005', code: 'C0005', slug: 'hamburguesas',      name: 'HAMBURGUESAS',                 image: '/imagenes/categorias/hamburguesas/banner.webp' },
    { id: 'C0006', code: 'C0006', slug: 'infusiones',        name: 'INFUSIONES',                   image: '/imagenes/categorias/infusiones/banner.webp' },
    { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS',            image: '/imagenes/categorias/platos-amazonicos/banner.webp' },
    { id: 'C0008', code: 'C0008', slug: 'refrescos',         name: 'REFRESCOS',                    image: '/imagenes/categorias/refrescos/banner.webp' },
    { id: 'C0009', code: 'C0009', slug: 'salchipapas',       name: 'SALCHIPAPAS Y SALCHIBROASTERS', image: '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp' },
    { id: 'C0010', code: 'C0010', slug: 'adicional',         name: 'ADICIONAL',                    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80' }
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
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

function showToast(message, type = 'success') {
    // Sin notificaciones ni alertas emergentes sobre el modal
    return;
}

/**
 * Obtiene la lista de acompañamientos reales para un plato o categoría
 */
function getRealAccompaniments(product, categoryKey) {
    if (product) {
        if (Array.isArray(product.accompaniments) && product.accompaniments.length > 0) {
            return [...product.accompaniments];
        }
        if (typeof product.accompaniments === 'string' && product.accompaniments.trim()) {
            return product.accompaniments.split(',').map(s => s.trim()).filter(Boolean);
        }

        const name = (product.name || '').toLowerCase().trim();
        const cat = (categoryKey || product.category_id || product.category || '').toLowerCase();

        // 1. PROMOCIONES
        if (name.includes('buchi duo') || name.includes('buchi dúo')) {
            return ['Papa crocante', 'Hamburguesa artesanal', 'Ensalada fresca'];
        }
        if (name.includes('broaster familiar')) {
            return ['Papa crocante', 'Ensalada fresca', 'Arroz'];
        }
        if (name.includes('salchi burger')) {
            return ['Queso cheddar', 'Papa crocante', 'Ensalada fresca'];
        }
        if (name.includes('selva power')) {
            return ['Maduros fritos', 'Sarza criolla', 'Papa crocante', 'Ensalada fresca'];
        }

        // 2. HAMBURGUESAS
        if (name === 'clásica' || name === 'clasica') {
            return ['Hamburguesa artesanal', 'Papa crocante', 'Ensalada fresca'];
        }
        if (name.includes('choripán') || name.includes('choripan')) {
            return ['Papas crocantes', 'Chorizo', 'Ensalada fresca'];
        }
        if (name.includes('hawaiana carne')) {
            return ['Papa crocante', 'Carne artesanal', 'Huevo', 'Jamón', 'Queso', 'Piña', 'Ensalada fresca'];
        }
        if (name.includes('hawaiana pollo')) {
            return ['Papa crocante', 'Pollo crispy', 'Huevo', 'Jamón', 'Queso', 'Piña', 'Ensalada fresca'];
        }
        if (name.includes('deshilachado')) {
            return ['Papas crocantes', 'Ensalada fresca'];
        }
        if (name.includes('filete')) {
            return ['Papas crocantes', 'Ensalada fresca'];
        }
        if (name.includes('cheese')) {
            return ['Queso cheddar'];
        }
        if (name.includes('bacon')) {
            return ['Papas crocantes', 'Tocino', 'Queso'];
        }
        if (name.includes('suprema')) {
            return ['Tocino', 'Queso', 'Huevo frito', 'Jamón'];
        }
        if (name.includes('hamburguesa a lo pobre')) {
            return ['Huevo frito', 'Queso', 'Jamón', 'Plátano'];
        }
        if (name.includes('royal a lo pobre')) {
            return ['Papa crocante', 'Carne artesanal', 'Huevo', 'Jamón', 'Queso', 'Plátano', 'Ensalada fresca'];
        }
        if (name === 'royal') {
            return ['Carne casera', 'Pollo deshilachado', 'Pollo', 'Chorizo'];
        }

        // 3. BROASTER
        if (cat.includes('broaster') || cat.includes('c0004')) {
            return ['Papa crocante', 'Ensalada fresca', 'Arroz'];
        }

        // 4. SALCHIPAPAS Y SALCHIBROASTERS
        if (cat.includes('salchi') || cat.includes('c0009')) {
            return ['Papas crocantes', 'Ensalada fresca'];
        }

        // 5. ALITAS
        if (cat.includes('alita') || cat.includes('c0002')) {
            return ['5 alitas', 'Papas crocantes'];
        }

        // 6. PLATOS AMAZÓNICOS
        if (name.includes('patacones con chorizo') || (name.includes('patacon') && name.includes('chorizo'))) {
            return ['Patacones', 'Chorizo'];
        }
        if (name.includes('tacacho')) {
            return ['Maduros fritos', 'Sarza criolla'];
        }
        if (name.includes('juane') || name.includes('juanes')) {
            return ['Maduros fritos'];
        }
        if (name.includes('chilcano') || name.includes('carachama')) {
            return ['Inguiri', 'Plátano'];
        }
        if (name.includes('palometa')) {
            return ['Arroz', 'Maduro frito'];
        }
        if (name.includes('caldo amazónico') || name.includes('caldo amazonico')) {
            return ['Yuca', 'Verduras de la selva'];
        }
        if (name.includes('chaufa') && (cat.includes('amazon') || cat.includes('c0007'))) {
            return ['Cecina y chorizo amazónico salteado'];
        }

        // 7. BEBIDAS, REFRESCOS, INFUSIONES, ADICIONALES
        if (
            cat.includes('bebida') || cat.includes('c0003') ||
            cat.includes('refresco') || cat.includes('c0008') ||
            cat.includes('infusion') || cat.includes('c0006') ||
            cat.includes('adicion') || cat.includes('c0010')
        ) {
            return [];
        }
    }

    const catKey = (categoryKey || (product ? (product.category_id || product.category || '') : '')).toLowerCase();
    
    if (catKey.includes('c0001') || catKey.includes('promo')) return CATEGORY_REAL_ACCOMPANIMENTS['c0001'];
    if (catKey.includes('c0002') || catKey.includes('alita')) return CATEGORY_REAL_ACCOMPANIMENTS['c0002'];
    if (catKey.includes('c0003') || catKey.includes('bebida')) return CATEGORY_REAL_ACCOMPANIMENTS['c0003'];
    if (catKey.includes('c0004') || catKey.includes('broaster')) return CATEGORY_REAL_ACCOMPANIMENTS['c0004'];
    if (catKey.includes('c0005') || catKey.includes('hamburg')) return CATEGORY_REAL_ACCOMPANIMENTS['c0005'];
    if (catKey.includes('c0006') || catKey.includes('infusion')) return CATEGORY_REAL_ACCOMPANIMENTS['c0006'];
    if (catKey.includes('c0007') || catKey.includes('amazon') || catKey.includes('selva')) return CATEGORY_REAL_ACCOMPANIMENTS['c0007'];
    if (catKey.includes('c0008') || catKey.includes('refresco')) return CATEGORY_REAL_ACCOMPANIMENTS['c0008'];
    if (catKey.includes('c0009') || catKey.includes('salchi')) return CATEGORY_REAL_ACCOMPANIMENTS['c0009'];
    if (catKey.includes('c0010') || catKey.includes('adicion')) return CATEGORY_REAL_ACCOMPANIMENTS['c0010'];

    return CATEGORY_REAL_ACCOMPANIMENTS['c0005'];
}

/**
 * Filtrar bloques de categorías en el listado
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
 * Filtrar platos en tiempo real
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
 * Calcular siguiente ID Oficial (Formato estándar PL0001 a PL0057 -> Siguiente: PL0058)
 */
function calcularSiguientePlatoId() {
    let maxNum = 0;
    document.querySelectorAll('.producto-card').forEach(card => {
        const idAttr = card.getAttribute('data-producto-id') || card.getAttribute('data-id') || card.textContent || '';
        const match = idAttr.match(/PL(\d+)/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    if (maxNum === 0) maxNum = 57;
    const next = maxNum + 1;
    return 'PL' + String(next).padStart(4, '0');
}

/**
 * Renderiza el Selector Desplegable de Categorías (Sin scroll, despliegue sucesivo fluido)
 * @param {string} selectedCatId - ID de la categoría (ej: 'C0002')
 * @param {boolean} isCreateMode - True si se abre en modo 'Crear Producto'
 */
function renderCustomCategoryDropdown(selectedCatId, isCreateMode = false) {
    const normSelected = String(selectedCatId || '').toLowerCase().trim();
    const selectedCat = activeCategories.find(c => 
        c.id.toLowerCase() === normSelected || 
        c.slug.toLowerCase() === normSelected || 
        c.code.toLowerCase() === normSelected
    );

    const hasSelection = !isCreateMode && selectedCat;

    const triggerHtml = hasSelection ? `
        <div class="cat-trigger-content" id="cat-trigger-content">
            <span class="cat-code-badge">${selectedCat.id || selectedCat.code}</span>
            <span class="cat-name-selected">${selectedCat.name}</span>
        </div>
    ` : `
        <div class="cat-trigger-content" id="cat-trigger-content">
            <span class="cat-placeholder-text">
                <i data-lucide="layers" class="w-4 h-4 text-slate-500 shrink-0"></i>
                <span>Seleccionar categoría</span>
            </span>
        </div>
    `;

    return `
    <div class="custom-category-dropdown" id="custom-category-dropdown-container">
        <button type="button" class="category-dropdown-trigger" id="cat-dropdown-trigger" onclick="toggleCategoryDropdown()">
            ${triggerHtml}
            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200" id="cat-dropdown-chevron"></i>
        </button>
        
        <div class="category-dropdown-menu" id="cat-dropdown-menu" style="display: none;">
            ${activeCategories.map(cat => {
                const isSel = hasSelection && (
                    cat.id.toLowerCase() === selectedCat.id?.toLowerCase() || 
                    cat.slug.toLowerCase() === selectedCat.slug?.toLowerCase() || 
                    cat.code.toLowerCase() === selectedCat.code?.toLowerCase()
                );
                return `
                <div class="category-dropdown-item ${isSel ? 'is-selected' : ''}" onclick="selectDropdownCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', '${cat.code || cat.id}', this)">
                    <div class="cat-left-meta">
                        <span class="cat-code-badge">${cat.id}</span>
                        <span class="cat-name-text">${cat.name}</span>
                    </div>
                    <div class="cat-status-indicator"></div>
                </div>
                `;
            }).join('')}
        </div>
        <input type="hidden" name="category_id" id="selected-category-input" required value="${hasSelection ? selectedCat.id : ''}">
    </div>
    `;
}

/**
 * Alterna apertura/cierre del menú desplegable de categorías
 */
function toggleCategoryDropdown() {
    const menu = document.getElementById('cat-dropdown-menu');
    const trigger = document.getElementById('cat-dropdown-trigger');
    if (!menu || !trigger) return;

    const isOpen = menu.style.display !== 'none';
    if (isOpen) {
        menu.style.display = 'none';
        trigger.classList.remove('is-open');
    } else {
        menu.style.display = 'flex';
        trigger.classList.add('is-open');
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Selecciona una categoría del menú desplegable
 */
function selectDropdownCategory(catId, catName, catCode, itemEl) {
    const input = document.getElementById('selected-category-input');
    if (input) input.value = catId;

    const triggerContent = document.getElementById('cat-trigger-content');
    if (triggerContent) {
        triggerContent.innerHTML = `
            <span class="cat-code-badge">${catCode || catId}</span>
            <span class="cat-name-selected">${catName}</span>
        `;
    }

    // Actualizar clase activa en items
    document.querySelectorAll('.category-dropdown-item').forEach(c => c.classList.remove('is-selected'));
    if (itemEl) itemEl.classList.add('is-selected');

    // Cerrar desplegable
    const menu = document.getElementById('cat-dropdown-menu');
    const trigger = document.getElementById('cat-dropdown-trigger');
    if (menu) menu.style.display = 'none';
    if (trigger) trigger.classList.remove('is-open');

    // No auto-agregar acompañamientos predeterminados al cambiar categoría (debe permanecer según la selección manual del usuario)
    const list = document.getElementById('accompaniments-list');
    if (list) {
        const rows = list.querySelectorAll('.interactive-option-row[data-type="acc"]');
        if (rows.length === 0) {
            list.innerHTML = `
                <div class="p-3 bg-[#080b14] border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    Sin acompañamientos seleccionados. Puedes añadir tu propio acompañamiento abajo.
                </div>
            `;
        }
    }

    if (window.lucide) window.lucide.createIcons();
}

/**
 * Renderiza una fila interactiva de acompañamiento con botón eliminar
 */
function renderAccompanimentRow(item, isChecked) {
    const safeName = item.replace(/"/g, '&quot;');
    return `
    <div class="interactive-option-row ${isChecked ? 'is-selected' : ''}" data-type="acc">
        <div class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onclick="toggleItemRow(this.closest('.interactive-option-row'))">
            <input type="checkbox" name="accompaniments[]" value="${safeName}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 pointer-events-none shrink-0">
            <span class="row-label-text truncate">${item}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
            <span class="row-status-pill ${isChecked ? 'status-included' : 'status-excluded'}" onclick="toggleItemRow(this.closest('.interactive-option-row'))">
                ${isChecked ? 'Incluido' : 'Sin esto'}
            </span>
            <button type="button" onclick="eliminarFilaAcompanamiento(this, event)" title="Eliminar acompañamiento" class="btn-delete-item">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
        </div>
    </div>
    `;
}

/**
 * Elimina una fila de acompañamiento de la lista
 */
function eliminarFilaAcompanamiento(btn, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const row = btn.closest('.interactive-option-row');
    if (!row) return;
    const nameEl = row.querySelector('.row-label-text');
    const name = nameEl ? nameEl.textContent : 'Acompañamiento';
    row.remove();
    showToast(`Acompañamiento «${name}» eliminado`);
}

/**
 * Renderiza una fila interactiva de salsa / crema
 */
function renderSauceRow(sauce, isChecked) {
    const safeName = sauce.replace(/"/g, '&quot;');
    return `
    <div class="interactive-option-row ${isChecked ? 'is-selected' : ''}" data-type="sauce">
        <div class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onclick="toggleItemRow(this.closest('.interactive-option-row'))">
            <input type="checkbox" name="cremas[]" value="${safeName}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 pointer-events-none shrink-0">
            <span class="row-label-text truncate">${sauce}</span>
        </div>
        <span class="row-status-pill ${isChecked ? 'status-included' : 'status-excluded'} cursor-pointer" onclick="toggleItemRow(this.closest('.interactive-option-row'))">
            ${isChecked ? 'Incluido' : 'Sin esto'}
        </span>
    </div>
    `;
}

/**
 * Alterna estado de fila
 */
function toggleItemRow(rowEl) {
    if (!rowEl) return;
    const checkbox = rowEl.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    
    checkbox.checked = !checkbox.checked;
    updateRowVisualState(rowEl, checkbox.checked);
}

function updateRowVisualState(rowEl, isChecked) {
    const statusPill = rowEl.querySelector('.row-status-pill');
    if (isChecked) {
        rowEl.classList.add('is-selected');
        if (statusPill) {
            statusPill.className = 'row-status-pill status-included';
            statusPill.textContent = 'Incluido';
        }
    } else {
        rowEl.classList.remove('is-selected');
        if (statusPill) {
            statusPill.className = 'row-status-pill status-excluded';
            statusPill.textContent = 'Sin esto';
        }
    }
}

/**
 * Acciones rápidas para acompañamientos
 */
function setAllAccompaniments(mode) {
    document.querySelectorAll('.interactive-option-row[data-type="acc"]').forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        const shouldCheck = (mode === 'all');
        checkbox.checked = shouldCheck;
        updateRowVisualState(row, shouldCheck);
    });
}

/**
 * Acciones rápidas para cremas
 */
function setAllSauces(mode) {
    const classicSauces = ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto', 'Tártara'];
    document.querySelectorAll('.interactive-option-row[data-type="sauce"]').forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        
        let shouldCheck = false;
        if (mode === 'all') {
            shouldCheck = true;
        } else if (mode === 'none') {
            shouldCheck = false;
        } else if (mode === 'classics') {
            shouldCheck = classicSauces.includes(checkbox.value);
        }

        checkbox.checked = shouldCheck;
        updateRowVisualState(row, shouldCheck);
    });
}

/**
 * Añadir acompañamiento personalizado
 */
function agregarAcompanamientoPersonalizado() {
    const input = document.getElementById('nuevo-acompanamiento-input');
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;

    const list = document.getElementById('accompaniments-list');
    if (!list) return;

    // Si la lista sólo contenía el mensaje de "Sin acompañamientos", limpiarlo antes
    const placeholderNotice = list.querySelector('div.bg-\\[\\#080b14\\]');
    if (placeholderNotice) {
        placeholderNotice.remove();
    }

    const temp = document.createElement('div');
    temp.innerHTML = renderAccompanimentRow(value, true);
    list.appendChild(temp.firstElementChild);

    input.value = '';
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Pestañas de subida de imagen
 */
function switchImageTab(mode) {
    const fileTab = document.getElementById('tab-upload-file');
    const urlTab = document.getElementById('tab-upload-url');
    const fileZone = document.getElementById('zone-upload-file');
    const urlZone = document.getElementById('zone-upload-url');

    if (mode === 'file') {
        fileTab?.classList.add('active');
        urlTab?.classList.remove('active');
        if (fileZone) fileZone.style.display = 'block';
        if (urlZone) urlZone.style.display = 'none';
    } else {
        urlTab?.classList.add('active');
        fileTab?.classList.remove('active');
        if (urlZone) urlZone.style.display = 'block';
        if (fileZone) fileZone.style.display = 'none';
    }
}

/**
 * Actualiza la vista previa de la foto y el contenedor de estado vacío
 */
function setImagePreview(src) {
    const preview = document.getElementById('product-photo-preview');
    const placeholder = document.getElementById('photo-empty-placeholder');
    const hiddenVal = document.getElementById('product-image-value');

    if (hiddenVal) hiddenVal.value = src || '';

    if (src) {
        if (preview) {
            preview.src = src;
            preview.classList.remove('hidden');
        }
        if (placeholder) {
            placeholder.classList.add('hidden');
        }
    } else {
        if (preview) {
            preview.src = '';
            preview.classList.add('hidden');
        }
        if (placeholder) {
            placeholder.classList.remove('hidden');
        }
    }
}

/**
 * Convierte cualquier archivo de imagen a formato WebP optimizado y ultra ligero
 */
function convertImageFileToWebP(file, maxDim = 800, quality = 0.80) {
    return new Promise((resolve) => {
        if (!file) return resolve('');
        const reader = new FileReader();
        reader.onload = function(e) {
            const rawData = e.target.result;
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    let webpData = canvas.toDataURL('image/webp', quality);
                    if (!webpData.startsWith('data:image/webp')) {
                        webpData = canvas.toDataURL('image/jpeg', quality);
                    }
                    resolve(webpData);
                } catch (err) {
                    resolve(rawData);
                }
            };
            img.onerror = function() {
                resolve(rawData);
            };
            img.src = rawData;
        };
        reader.onerror = function() {
            resolve('');
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Subida de archivo local de imagen con conversión automática a WebP
 */
async function handleImageFileUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const webpBase64 = await convertImageFileToWebP(file, 800, 0.82);
    if (webpBase64) {
        setImagePreview(webpBase64);
    }
}

/**
 * Actualizar preview al pegar URL
 */
function handleImageUrlInput(url) {
    const trimmed = url.trim();
    setImagePreview(trimmed);
}

/**
 * Normaliza cadenas para comparación de duplicados (ignora mayúsculas, minúsculas, tildes y espacios)
 */
function normalizeTextForComparison(str) {
    return String(str || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
}

/**
 * Guardar o Actualizar Plato vía AJAX de Alto Rendimiento
 */
async function guardarProductoAjax(event, formId) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const form = document.getElementById(formId) || document.querySelector('form#' + formId) || document.querySelector('form');
    if (!form) {
        console.error("Form not found:", formId);
        return false;
    }

    const submitBtns = document.querySelectorAll('button[form="' + formId + '"], #' + formId + ' button, .action-bar-fixed-bottom button');
    const saveBtn = Array.from(submitBtns).find(b => 
        b.textContent.includes('Guardar') || 
        b.textContent.includes('Actualizar') || 
        b.textContent.includes('Guardando') || 
        b.type === 'submit'
    );

    if (saveBtn) {
        saveBtn.disabled = true;
        if (!saveBtn.dataset.oldHtml) saveBtn.dataset.oldHtml = saveBtn.innerHTML;
        saveBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin shrink-0"></i> <span>Guardando...</span>`;
        if (window.lucide) window.lucide.createIcons();
    }

    let timeoutId = null;

    try {
        const id = (form.querySelector('input[name="id"]')?.value || '').trim();
        const action = (form.querySelector('input[name="action"]')?.value || (formId.includes('create') ? 'create' : 'edit')).trim();
        const name = (form.querySelector('input[name="name"]')?.value || '').trim();
        
        const priceInput = form.querySelector('input[name="price"]')?.value;
        const price = priceInput !== undefined && priceInput !== '' ? (parseFloat(priceInput) || 0) : 0;
        
        const stockInput = form.querySelector('input[name="stock"]')?.value;
        const stock = stockInput !== undefined && stockInput !== '' ? (parseInt(stockInput, 10) || 0) : 0;
        
        const available = form.querySelector('input[name="available"]')?.checked ?? true;
        const imageUrl = (form.querySelector('input[name="image_url"]')?.value || '/imagenes/productos/fallback.webp').trim();
        const description = (form.querySelector('textarea[name="description"]')?.value || '').trim();
        const categoryId = (form.querySelector('input[name="category_id"]')?.value || 'C0001').trim();

        if (!name) {
            showToast("⚠️ Por favor ingresa un nombre para el plato");
            return false;
        }

        // Validar duplicidad de plato (sin importar mayúsculas, minúsculas o tildes)
        const normId = String(id || '').toUpperCase().trim();
        const normName = normalizeTextForComparison(name);
        let isDuplicateDish = false;
        let duplicateDishName = '';

        if (normName) {
            document.querySelectorAll('.producto-card').forEach(card => {
                const cardId = String(card.getAttribute('data-producto-id') || card.getAttribute('data-id') || '').toUpperCase().trim();
                const titleEl = card.querySelector('.producto-title-text');
                const cardName = titleEl ? titleEl.textContent.trim() : '';

                // En edición, ignorar la tarjeta del propio plato que se está editando
                if (action === 'edit' && normId && cardId === normId) return;

                if (cardName && normalizeTextForComparison(cardName) === normName) {
                    if (action === 'create' || (cardId && cardId !== normId)) {
                        isDuplicateDish = true;
                        duplicateDishName = cardName;
                    }
                }
            });
        }

        if (isDuplicateDish) {
            showToast(`⚠️ El plato «${duplicateDishName || name}» ya existe. No se permiten nombres duplicados.`);
            if (saveBtn) {
                saveBtn.disabled = false;
                if (saveBtn.dataset.oldHtml) saveBtn.innerHTML = saveBtn.dataset.oldHtml;
                if (window.lucide) window.lucide.createIcons();
            }
            return false;
        }

        // Obtener acompañamientos marcados en el DOM
        const accompaniments = [];
        form.querySelectorAll('input[name="accompaniments[]"]:checked').forEach(input => {
            if (input.value && input.value.trim()) accompaniments.push(input.value.trim());
        });

        // Obtener cremas marcadas en el DOM
        const cremas = [];
        form.querySelectorAll('input[name="cremas[]"]:checked').forEach(input => {
            if (input.value && input.value.trim()) cremas.push(input.value.trim());
        });

        const payload = {
            action,
            id,
            name,
            price,
            stock,
            available,
            image_url: imageUrl,
            image: imageUrl,
            description,
            category_id: categoryId,
            category: categoryId,
            accompaniments,
            cremas,
            includes_sauces: cremas.length > 0
        };

        let response;
        if (action === 'create') {
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const resData = await response.json().catch(() => ({}));

        if (!response.ok || resData.success === false) {
            console.error("Error al guardar el plato:", resData);
            if (saveBtn) {
                saveBtn.disabled = false;
                if (saveBtn.dataset.oldHtml) saveBtn.innerHTML = saveBtn.dataset.oldHtml;
                if (window.lucide) window.lucide.createIcons();
            }
            return false;
        }

        cerrarModal();
        await initProductosView();

    } catch (error) {
        console.error("Error crítico al guardar plato:", error);
        cerrarModal();
        await initProductosView();
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            if (saveBtn.dataset.oldHtml) saveBtn.innerHTML = saveBtn.dataset.oldHtml;
        }
        if (window.lucide) window.lucide.createIcons();
    }
    return false;
}

/**
 * Eliminar Plato vía AJAX de Alto Rendimiento
 */
async function eliminarPlatoAjax(id, nombre) {
    if (!id) return;

    const cards = document.querySelectorAll(`.producto-card[data-producto-id="${id}"], .producto-card[data-id="${id}"]`);
    cards.forEach(card => {
        card.style.opacity = '0.3';
        card.style.pointerEvents = 'none';
    });

    cerrarModal();

    try {
        await fetch(`/api/products/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
    } catch (error) {
        console.error("Error al eliminar plato:", error);
    }

    cards.forEach(card => card.remove());
    await initProductosView();
}

/**
 * Abrir Formulario de Edición de Plato
 */
function abrirEditarProductoModal(p) {
    if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch(e){}
    }

    const currentCat = (p.category_id || p.category || 'C0001');
    const realAccs = getRealAccompaniments(p, currentCat);
    
    let checkedAccs = [];
    if (Array.isArray(p.accompaniments) && p.accompaniments.length > 0) {
        checkedAccs = p.accompaniments;
    } else if (typeof p.accompaniments === 'string' && p.accompaniments.trim()) {
        checkedAccs = p.accompaniments.split(',').map(s => s.trim()).filter(Boolean);
    } else {
        checkedAccs = realAccs;
    }

    const allAccsToDisplay = Array.from(new Set([...checkedAccs, ...realAccs]));
    
    let accRows = '';
    if (allAccsToDisplay.length === 0) {
        accRows = `
            <div class="p-3 bg-[#080b14] border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                Este plato no incluye acompañamientos predeterminados. Puedes añadir uno si lo deseas.
            </div>
        `;
    } else {
        allAccsToDisplay.forEach(acc => {
            const isChecked = checkedAccs.includes(acc);
            accRows += renderAccompanimentRow(acc, isChecked);
        });
    }

    const currentCremas = Array.isArray(p.cremas) ? p.cremas : [];
    let sauceRows = '';
    ALL_AVAILABLE_SAUCES.forEach(sauce => {
        const isChecked = currentCremas.length === 0 ? true : currentCremas.includes(sauce);
        sauceRows += renderSauceRow(sauce, isChecked);
    });

    const isAvailable = (p.available === true || p.available === 'true' || p.available === undefined);
    const imageUrl = p.image || '/imagenes/productos/fallback.webp';

    const html = `
        <div class="product-editor-container animate-fade-in">
            
            <!-- Header Sticky Superior -->
            <div class="product-sticky-header">
                <div class="product-header-title-box">
                    <button type="button" onclick="cerrarModal()" class="product-back-btn">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0"></div>
                        <div class="min-w-0">
                            <h2 class="product-header-title truncate">${(p.name || 'Editar Plato').replace(/"/g, '&quot;')}</h2>
                            <span class="text-[11px] text-slate-400 hidden sm:inline">Edición de carta y precios</span>
                        </div>
                    </div>

                    <div class="product-id-pill">
                        <span>${p.id || ''}</span>
                    </div>
                </div>
            </div>

            <!-- Formulario Principal -->
            <form id="producto-edit-form" novalidate action="javascript:void(0)" onsubmit="event.preventDefault(); guardarProductoAjax(event, 'producto-edit-form'); return false;" class="space-y-6 flex-1 px-3 sm:px-6">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" value="${p.id || ''}">
                <input type="hidden" id="product-image-value" name="image_url" value="${imageUrl}">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                    
                    <!-- Columna Izquierda: Identificación, Categoría Elegante, Precios, Stock y Foto Grande (7 cols) -->
                    <div class="lg:col-span-7 space-y-5">
                        
                        <!-- Bloque 1: Identificación y Categoría Oficial Personalizada (Sin Scroll) -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-orange">
                                    <i data-lucide="tag" class="w-4 h-4"></i> Identificación del Plato
                                </span>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Código / ID Oficial (Fijo)</label>
                                <input type="text" value="${p.id || ''}" readonly class="form-input-text font-mono-numbers font-bold text-orange-400">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Categoría Oficial *</label>
                                ${renderCustomCategoryDropdown(currentCat, false)}
                            </div>

                            <div class="form-group">
                                <label class="form-label">Nombre del Plato *</label>
                                <input type="text" name="name" required value="${(p.name || '').replace(/"/g, '&quot;')}" placeholder="Ej: Combo Burger Lover" class="form-input-text font-bold text-base">
                            </div>
                        </div>

                        <!-- Bloque 2: Precios, Stock y Disponibilidad -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-emerald flex items-center gap-2">
                                    <i data-lucide="coins" class="w-4 h-4 text-emerald-400"></i>
                                    <span>Precio en Soles (S/), Stock y Disponibilidad</span>
                                </span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Precio Venta (S/) *</label>
                                    <div class="price-input-group">
                                        <span class="price-currency-badge">S/</span>
                                        <input type="number" name="price" step="any" min="0" required value="${typeof p.price === 'number' ? p.price.toFixed(2) : (parseFloat(p.price) || 0).toFixed(2)}" placeholder="0.00" class="price-input-field">
                                    </div>
                                </div>

                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Stock en Cocina</label>
                                    <input type="number" name="stock" min="0" value="${p.stock !== undefined ? p.stock : 0}" class="form-input-text font-mono-numbers font-bold">
                                </div>
                            </div>

                            <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span class="text-xs font-bold text-white block">Estado en Carta</span>
                                    <span class="text-[11px] text-slate-400">Los platos no disponibles se marcan como agotados</span>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer select-none">
                                    <input type="checkbox" name="available" value="1" ${isAvailable ? 'checked' : ''} class="sr-only peer">
                                    <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>

                        <!-- Bloque 3: Fotografía del Plato (Grande y Ancho Completo en Móvil) -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-amber">
                                    <i data-lucide="image" class="w-4 h-4"></i> Fotografía del Plato
                                </span>
                                
                                <div class="upload-tab-buttons">
                                    <button type="button" id="tab-upload-file" onclick="switchImageTab('file')" class="upload-tab-btn active">Subir Archivo</button>
                                    <button type="button" id="tab-upload-url" onclick="switchImageTab('url')" class="upload-tab-btn">Pegar URL</button>
                                </div>
                            </div>

                            <div class="photo-uploader-full-box">
                                <!-- Preview de Foto en Gran Tamaño -->
                                <div class="photo-preview-full-hero relative flex flex-col items-center justify-center bg-[#0a0d16] border border-dashed border-slate-800 rounded-xl p-4 min-h-[200px]">
                                    <img id="product-photo-preview" src="${imageUrl}" alt="Vista previa" class="photo-preview-img-hero ${imageUrl ? '' : 'hidden'}" onerror="this.classList.add('hidden'); document.getElementById('photo-empty-placeholder')?.classList.remove('hidden');">
                                    <div id="photo-empty-placeholder" class="flex flex-col items-center justify-center space-y-2 text-center ${imageUrl ? 'hidden' : ''}">
                                        <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                                            <i data-lucide="image" class="w-6 h-6 text-slate-500"></i>
                                        </div>
                                        <span class="text-xs font-bold text-slate-300 block">Sin fotografía seleccionada</span>
                                        <span class="text-[10px] text-slate-500 block">Selecciona un archivo o pega una URL para previsualizar</span>
                                    </div>
                                </div>

                                <!-- Zona 1: Subir Archivo -->
                                <div id="zone-upload-file">
                                    <label class="dropzone-trigger-area-large">
                                        <input type="file" accept="image/*" class="hidden" onchange="handleImageFileUpload(this)">
                                        <i data-lucide="upload-cloud" class="w-6 h-6 text-orange-400 shrink-0"></i>
                                        <div class="text-left">
                                            <span class="text-sm font-bold text-white block">Toca para seleccionar imagen de tu dispositivo</span>
                                            <span class="text-xs text-slate-400">JPG, PNG o WEBP de alta calidad</span>
                                        </div>
                                    </label>
                                </div>

                                <!-- Zona 2: Enlace URL -->
                                <div id="zone-upload-url" style="display: none;" class="space-y-1.5">
                                    <input type="url" id="input-image-url" oninput="handleImageUrlInput(this.value)" value="${imageUrl.startsWith('data:') ? '' : imageUrl}" placeholder="https://ejemplo.com/foto.jpg" class="form-input-text text-xs">
                                    <span class="text-[10px] text-slate-400 block">Pega la URL web directa de la imagen</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bloque 4: Descripción del Plato -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-cyan">
                                    <i data-lucide="align-left" class="w-4 h-4"></i> Descripción e Ingredientes
                                </span>
                            </div>

                            <div class="form-group">
                                <textarea name="description" oninput="autoResizeTextarea(this)" placeholder="Describe los ingredientes, cortes de carne o detalles..." class="form-textarea-no-scroll">${p.description || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Columna Derecha: Acompañamientos y Cremas (5 cols) -->
                    <div class="lg:col-span-5 space-y-5">
                        
                        <!-- Sección Acompañamientos Reales -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <div>
                                    <span class="product-section-title title-orange">
                                        <i data-lucide="utensils" class="w-4 h-4"></i> Acompañamientos Reales
                                    </span>
                                    <span class="text-[11px] text-slate-400 block mt-0.5">Toca para incluir o quitar</span>
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <button type="button" onclick="setAllAccompaniments('all')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Todos</button>
                                    <button type="button" onclick="setAllAccompaniments('none')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Ninguno</button>
                                </div>
                            </div>

                            <div id="accompaniments-list" class="interactive-list-container">
                                ${accRows}
                            </div>

                            <!-- Input para añadir acompañamiento personalizado -->
                            <div class="pt-2 border-t border-slate-800/60">
                                <div class="flex items-center gap-2">
                                    <input type="text" id="nuevo-acompanamiento-input" placeholder="Otro acompañamiento..." class="form-input-text text-xs flex-1">
                                    <button type="button" onclick="agregarAcompanamientoPersonalizado()" class="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shrink-0">
                                        + Añadir
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Sección Cremas de la Casa -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <div>
                                    <span class="product-section-title title-emerald">
                                        <i data-lucide="flame" class="w-4 h-4"></i> Cremas de la Casa
                                    </span>
                                    <span class="text-[11px] text-slate-400 block mt-0.5">Salsas que acompañan al plato</span>
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <button type="button" onclick="setAllSauces('all')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Todas</button>
                                    <button type="button" onclick="setAllSauces('classics')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Clásicas</button>
                                    <button type="button" onclick="setAllSauces('none')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Ninguna</button>
                                </div>
                            </div>

                            <div id="sauces-list" class="interactive-list-container">
                                ${sauceRows}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Barra Fija Inferior con Botones Flexibles Equilibrados en Móvil y Escritorio -->
                <div class="action-bar-fixed-bottom flex items-center justify-between gap-3 w-full">
                    <button type="button" onclick="eliminarPlatoAjax('${p.id || ''}', '${(p.name || '').replace(/'/g, "\\'")}')" class="px-4 py-3 bg-red-950/70 hover:bg-red-900/90 text-red-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-red-500/40 active-press cursor-pointer transition-all">
                        <i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>
                        <span>Eliminar</span>
                    </button>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="cerrarModal()" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all active-press cursor-pointer border border-slate-700/50">
                            Cancelar
                        </button>
                        <button type="button" onclick="guardarProductoAjax(event, 'producto-edit-form')" class="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/20 active-press cursor-pointer">
                            <i data-lucide="check-circle" class="w-4 h-4"></i>
                            <span>Guardar Cambios</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    abrirModalHtml(html);
}

/**
 * Abrir Formulario de Creación de Plato
 */
function abrirCrearProductoModal() {
    const nextId = calcularSiguientePlatoId();
    let accRows = `
        <div class="p-3 bg-[#080b14] border border-slate-800 rounded-xl text-center text-xs text-slate-400">
            Sin acompañamientos seleccionados. Puedes añadir tu propio acompañamiento abajo.
        </div>
    `;

    let sauceRows = ALL_AVAILABLE_SAUCES.map(s => renderSauceRow(s, true)).join('');
    const defaultImage = '';

    const html = `
        <div class="product-editor-container animate-fade-in">
            
            <!-- Header Sticky Superior -->
            <div class="product-sticky-header">
                <div class="product-header-title-box">
                    <button type="button" onclick="cerrarModal()" class="product-back-btn">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                        <div class="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] shrink-0"></div>
                        <div class="min-w-0">
                            <h2 class="product-header-title">Nuevo Plato</h2>
                            <span class="text-[11px] text-slate-400 hidden sm:inline">Añadir plato a la carta</span>
                        </div>
                    </div>

                    <div class="product-id-pill">
                        <span>${nextId}</span>
                    </div>
                </div>
            </div>

            <!-- Formulario Principal -->
            <form id="producto-create-form" novalidate action="javascript:void(0)" onsubmit="event.preventDefault(); guardarProductoAjax(event, 'producto-create-form'); return false;" class="space-y-6 flex-1 px-3 sm:px-6">
                <input type="hidden" name="action" value="create">
                <input type="hidden" name="id" value="${nextId}">
                <input type="hidden" id="product-image-value" name="image_url" value="">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                    
                    <!-- Columna Izquierda (7 cols) -->
                    <div class="lg:col-span-7 space-y-5">
                        
                        <!-- Bloque 1: Identificación y Categoría -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-orange">
                                    <i data-lucide="tag" class="w-4 h-4"></i> Identificación del Plato
                                </span>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Código / ID Oficial (Fijo)</label>
                                <input type="text" value="${nextId}" readonly class="form-input-text font-mono-numbers font-bold text-orange-400">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Categoría Oficial *</label>
                                ${renderCustomCategoryDropdown('', true)}
                            </div>

                            <div class="form-group">
                                <label class="form-label">Nombre del Plato *</label>
                                <input type="text" name="name" required placeholder="Ej: Hamburguesa Buchisapa Especial" class="form-input-text font-bold text-base">
                            </div>
                        </div>

                        <!-- Bloque 2: Precios, Stock y Disponibilidad -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-emerald flex items-center gap-2">
                                    <i data-lucide="coins" class="w-4 h-4 text-emerald-400"></i>
                                    <span>Precio en Soles (S/), Stock y Disponibilidad</span>
                                </span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Precio Venta (S/) *</label>
                                    <div class="price-input-group">
                                        <span class="price-currency-badge">S/</span>
                                        <input type="number" name="price" step="any" min="0" required value="0.00" placeholder="0.00" class="price-input-field">
                                    </div>
                                </div>

                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Stock Inicial en Cocina</label>
                                    <input type="number" name="stock" min="0" value="0" placeholder="0" class="form-input-text font-mono-numbers font-bold">
                                </div>
                            </div>

                            <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span class="text-xs font-bold text-white block">Estado en Carta</span>
                                    <span class="text-[11px] text-slate-400">Disponible inmediatamente para los clientes</span>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer select-none">
                                    <input type="checkbox" name="available" value="1" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>

                        <!-- Bloque 3: Fotografía del Plato (Vacío inicialmente para nuevos platos) -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-amber">
                                    <i data-lucide="image" class="w-4 h-4"></i> Fotografía del Plato
                                </span>
                                
                                <div class="upload-tab-buttons">
                                    <button type="button" id="tab-upload-file" onclick="switchImageTab('file')" class="upload-tab-btn active">Subir Archivo</button>
                                    <button type="button" id="tab-upload-url" onclick="switchImageTab('url')" class="upload-tab-btn">Pegar URL</button>
                                </div>
                            </div>

                            <div class="photo-uploader-full-box">
                                <!-- Preview de Foto Vacio inicialmente -->
                                <div class="photo-preview-full-hero relative flex flex-col items-center justify-center bg-[#0a0d16] border border-dashed border-slate-800 rounded-xl p-6 min-h-[200px]">
                                    <img id="product-photo-preview" src="" alt="Vista previa" class="photo-preview-img-hero hidden" onerror="this.classList.add('hidden'); document.getElementById('photo-empty-placeholder')?.classList.remove('hidden');">
                                    <div id="photo-empty-placeholder" class="flex flex-col items-center justify-center space-y-2 text-center">
                                        <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                                            <i data-lucide="image" class="w-6 h-6 text-slate-500"></i>
                                        </div>
                                        <span class="text-xs font-bold text-slate-300 block">Sin fotografía seleccionada</span>
                                        <span class="text-[10px] text-slate-500 block">Selecciona un archivo o pega una URL para previsualizar</span>
                                    </div>
                                </div>

                                <!-- Zona 1: Subir Archivo -->
                                <div id="zone-upload-file">
                                    <label class="dropzone-trigger-area-large">
                                        <input type="file" accept="image/*" class="hidden" onchange="handleImageFileUpload(this)">
                                        <i data-lucide="upload-cloud" class="w-6 h-6 text-orange-400 shrink-0"></i>
                                        <div class="text-left">
                                            <span class="text-sm font-bold text-white block">Toca para seleccionar imagen de tu dispositivo</span>
                                            <span class="text-xs text-slate-400">JPG, PNG o WEBP de alta calidad</span>
                                        </div>
                                    </label>
                                </div>

                                <!-- Zona 2: Enlace URL -->
                                <div id="zone-upload-url" style="display: none;" class="space-y-1.5">
                                    <input type="url" id="input-image-url" oninput="handleImageUrlInput(this.value)" placeholder="https://ejemplo.com/foto.jpg" class="form-input-text text-xs">
                                    <span class="text-[10px] text-slate-400 block">Pega la URL web directa de la imagen</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bloque 4: Descripción e Ingredientes -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <span class="product-section-title title-cyan">
                                    <i data-lucide="align-left" class="w-4 h-4"></i> Descripción e Ingredientes
                                </span>
                            </div>

                            <div class="form-group">
                                <textarea name="description" oninput="autoResizeTextarea(this)" placeholder="Describe los ingredientes, cortes de carne o detalles..." class="form-textarea-no-scroll"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Columna Derecha (5 cols) -->
                    <div class="lg:col-span-5 space-y-5">
                        
                        <!-- Sección Acompañamientos Reales -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <div>
                                    <span class="product-section-title title-orange">
                                        <i data-lucide="utensils" class="w-4 h-4"></i> Acompañamientos Reales
                                    </span>
                                    <span class="text-[11px] text-slate-400 block mt-0.5">Toca para incluir o quitar</span>
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <button type="button" onclick="setAllAccompaniments('all')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Todos</button>
                                    <button type="button" onclick="setAllAccompaniments('none')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Ninguno</button>
                                </div>
                            </div>

                            <div id="accompaniments-list" class="interactive-list-container">
                                ${accRows}
                            </div>

                            <!-- Input para añadir acompañamiento personalizado -->
                            <div class="pt-2 border-t border-slate-800/60">
                                <div class="flex items-center gap-2">
                                    <input type="text" id="nuevo-acompanamiento-input" placeholder="Otro acompañamiento..." class="form-input-text text-xs flex-1">
                                    <button type="button" onclick="agregarAcompanamientoPersonalizado()" class="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shrink-0">
                                        + Añadir
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Sección Cremas de la Casa -->
                        <div class="product-section-card">
                            <div class="product-section-header">
                                <div>
                                    <span class="product-section-title title-emerald">
                                        <i data-lucide="flame" class="w-4 h-4"></i> Cremas de la Casa
                                    </span>
                                    <span class="text-[11px] text-slate-400 block mt-0.5">Salsas que acompañan al plato</span>
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <button type="button" onclick="setAllSauces('all')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Todas</button>
                                    <button type="button" onclick="setAllSauces('classics')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Clásicas</button>
                                    <button type="button" onclick="setAllSauces('none')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold">Ninguna</button>
                                </div>
                            </div>

                            <div id="sauces-list" class="interactive-list-container">
                                ${sauceRows}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Barra Fija Inferior con Botones Flexibles Equilibrados en Móvil y Escritorio -->
                <div class="action-bar-fixed-bottom flex items-center justify-center sm:justify-end gap-3 w-full">
                    <button type="button" onclick="cerrarModal()" class="flex-1 sm:flex-none text-center justify-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all active-press cursor-pointer border border-slate-700/50">
                        Cancelar
                    </button>
                    <button type="button" onclick="guardarProductoAjax(event, 'producto-create-form')" class="flex-1 sm:flex-none text-center justify-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/20 active-press cursor-pointer">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>
                        <span>Guardar Producto</span>
                    </button>
                </div>
            </form>
        </div>
    `;

    abrirModalHtml(html);
}

/**
 * Auto-ajusta la altura de la caja de texto para que todo el texto sea visible sin scroll
 */
function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.max(el.scrollHeight, 100);
    el.style.height = (newHeight + 4) + 'px';
}

/**
 * Abre el modal a pantalla completa
 */
function abrirModalHtml(html) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!container || !content) return;

    content.innerHTML = html;
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Auto-ajustar todas las textareas para eliminar scroll interno y desplegar texto completo
    const textareas = content.querySelectorAll('textarea');
    textareas.forEach(tx => {
        autoResizeTextarea(tx);
    });

    setTimeout(() => {
        textareas.forEach(tx => {
            autoResizeTextarea(tx);
        });
    }, 50);

    setTimeout(() => {
        textareas.forEach(tx => {
            autoResizeTextarea(tx);
        });
    }, 150);

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Cierra el modal y restablece el scroll
 */
function cerrarModal() {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!container) return;

    container.classList.add('hidden');
    if (content) content.innerHTML = '';
    document.body.style.overflow = '';
}

/**
 * Inicialización y Renderizado Asíncrono Ultra Rápido (100% JS REST API, 0% PHP)
 */
async function initProductosView() {
    const container = document.getElementById('productos-container');
    if (!container) return;

    try {
        const [prodRes, catRes] = await Promise.all([
            fetch('/api/products').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/categories').then(r => r.json()).catch(() => ({ data: [] }))
        ]);
        if (catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
            activeCategories = catRes.data;
        }
        const productos = prodRes.data || [];
        renderProductosDOM(productos);
    } catch (err) {
        console.error("Error cargando productos vía API:", err);
    }
}

function renderProductosDOM(productos) {
    const container = document.getElementById('productos-container');
    if (!container) return;

    // Colores y descripciones por defecto para íconos
    const CAT_ICONS_COLORS = {
        'promociones':       { icon: 'sparkles',   color: '#f59e0b', desc: 'Combos especiales, ofertas de la semana y paquetes familiares.' },
        'alitas':            { icon: 'flame',      color: '#ef4444', desc: 'Alitas crujientes en salsa acevichada, BBQ y cremas de la casa.' },
        'bebidas':           { icon: 'cup-soda',   color: '#06b6d4', desc: 'Gaseosas heladas, agua mineral y bebidas embotelladas.' },
        'broaster':          { icon: 'drumstick',  color: '#f97316', desc: 'Pollo broaster ultra crocante con papas doradas y cremas.' },
        'hamburguesas':      { icon: 'beef',       color: '#eab308', desc: 'Hamburguesas artesanales, choripanes y sándwiches especiales.' },
        'infusiones':        { icon: 'coffee',     color: '#10b981', desc: 'Infusiones calientes, café aromático pasado y manzanilla.' },
        'platos-amazonicos': { icon: 'utensils',   color: '#8b5cf6', desc: 'Auténticos sabores de la selva: tacacho, cecina, chorizo y patacones.' },
        'refrescos':         { icon: 'glass-water',color: '#3b82f6', desc: 'Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.' },
        'salchipapas':       { icon: 'layers',     color: '#ec4899', desc: 'Papas crocantes, salchichas frankfurter y combinaciones broaster.' },
        'adicional':         { icon: 'plus-circle',color: '#94a3b8', desc: 'Porciones extra, salsas especiales, cremas adicionales y guarniciones.' },
        'postre':            { icon: 'cake',       color: '#ec4899', desc: 'Postres artesanales, delicias dulces y especialidades de la casa.' }
    };

    // Ordenar categorías: PROMOCIONES al inicio, luego alfabéticamente
    activeCategories.sort((a, b) => {
        const isPromoA = (a.slug === 'promociones' || a.id === 'C0001');
        const isPromoB = (b.slug === 'promociones' || b.id === 'C0001');
        if (isPromoA && !isPromoB) return -1;
        if (!isPromoA && isPromoB) return 1;
        return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
    });

    const totalProductos = productos.length;
    const disponiblesCount = productos.filter(p => p.available !== false && p.available !== 'false').length;
    const criticosCount = productos.filter(p => parseInt(String(p.stock || '0'), 10) <= 5).length;

    // Actualizar Tarjetas de Métricas Rápidas dinámicamente
    const statTotalEl = document.getElementById('stat-total-platos');
    if (statTotalEl) statTotalEl.textContent = `${totalProductos} platos`;

    const statCatEl = document.getElementById('stat-categorias-platos');
    if (statCatEl) statCatEl.textContent = `${activeCategories.length} líneas`;

    const statDispEl = document.getElementById('stat-disponibles-platos');
    if (statDispEl) statDispEl.textContent = `${disponiblesCount} activos`;

    const statCritEl = document.getElementById('stat-criticos-platos');
    if (statCritEl) statCritEl.textContent = `${criticosCount} en alerta`;

    // 1. Barra de pestañas de categorías
    const filterBar = document.getElementById('categories-filter-bar');
    if (filterBar) {
        let filterTabsHtml = `
            <button type="button" onclick="seleccionarFiltroCategoria('all')" class="category-tab-btn active px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 bg-orange-600 text-white" data-cat="all">
                Todos (${totalProductos})
            </button>
        `;
        activeCategories.forEach(cat => {
            const cid = (cat.id || cat.code || '').toUpperCase();
            const cslug = (cat.slug || cid.toLowerCase()).toLowerCase();
            const cname = (cat.name || cid).toUpperCase().trim();
            const countInCat = productos.filter(p => (
                (p.category_id || '').toUpperCase() === cid || 
                (p.category_id || '').toLowerCase() === cslug || 
                (p.category || '').toUpperCase() === cid || 
                (p.category || '').toLowerCase() === cslug
            )).length;
            filterTabsHtml += `
            <button type="button" onclick="seleccionarFiltroCategoria('${cid}')" class="category-tab-btn px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 text-slate-400 hover:text-white bg-[#0f1424] border border-slate-800" data-cat="${cid}" data-cat-slug="${cslug}">
                <span class="font-mono-numbers text-[9px] text-orange-400/90 font-bold mr-1">${cid}</span> ${cname} (${countInCat})
            </button>
            `;
        });
        filterBar.innerHTML = filterTabsHtml;
    }

    // 2. Render de bloques de categorías
    let categoriesBlocksHtml = '';
    activeCategories.forEach(cat => {
        const cid = (cat.id || cat.code || '').toUpperCase();
        const cslug = (cat.slug || cid.toLowerCase()).toLowerCase();
        const cname = (cat.name || cid).toUpperCase().trim();
        const iconInfo = CAT_ICONS_COLORS[cslug] || CAT_ICONS_COLORS[cid.toLowerCase()] || { icon: 'utensils', color: '#f97316', desc: `Especialidades de ${cname}` };
        const catColor = cat.color || iconInfo.color;
        const catDesc = cat.description || cat.phrase || iconInfo.desc;

        const platosEnCat = productos.filter(p => (
            (p.category_id || '').toUpperCase() === cid || 
            (p.category_id || '').toLowerCase() === cslug || 
            (p.category || '').toUpperCase() === cid || 
            (p.category || '').toLowerCase() === cslug
        ));

        // Ordenar productos alfabéticamente
        platosEnCat.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));

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
                const image = p.image || '/imagenes/productos/fallback.webp';
                const available = p.available !== false;
                const isCrit = stock <= 5;
                const accompaniments = Array.isArray(p.accompaniments) ? p.accompaniments : [];
                const cremas = Array.isArray(p.cremas) ? p.cremas : [];

                const pJsonStr = JSON.stringify(p).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

                return `
                <div class="producto-card bg-[#111728] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-md relative overflow-hidden group select-none" data-producto-id="${id}" data-search-target="${(name + ' ' + desc + ' ' + accompaniments.join(' ') + ' ' + cremas.join(' ')).toLowerCase()}">
                    <div class="space-y-3">
                        <div class="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-[#0a0d16]">
                            <img src="${image}" alt="${name}" class="producto-img-element w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/imagenes/productos/fallback.webp'">
                            <span class="producto-avail-pill absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase backdrop-blur-md ${available ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border border-red-500/50 text-red-300'}">
                                ${available ? 'Disponible' : 'Agotado'}
                            </span>
                        </div>

                        <div>
                            <div class="flex items-start justify-between gap-2">
                                <h4 class="producto-title-text font-black text-base text-white leading-snug line-clamp-2">${name}</h4>
                                <span class="producto-price-text font-mono-numbers font-black text-base text-emerald-400 shrink-0">S/ ${price.toFixed(2)}</span>
                            </div>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="inline-flex items-center gap-1.5 text-xs font-mono-numbers font-bold ${isCrit ? 'text-red-400 animate-pulse' : 'text-slate-300'}">
                                    <i data-lucide="package" class="w-3.5 h-3.5 text-slate-400"></i> Stock: <span class="producto-stock-text">${stock} un.</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/80">
                        <span class="text-[10px] font-mono-numbers text-slate-400 font-bold bg-[#0a0d16] px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                            <span class="text-slate-500">ID:</span>
                            <span class="text-orange-400 font-extrabold tracking-wide">${id}</span>
                        </span>
                        
                        <div class="flex items-center gap-2">
                            <button type="button" onclick='abrirEditarProductoModal(${pJsonStr})' class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active-press shadow-sm">
                                <i data-lucide="edit-3" class="w-3.5 h-3.5 text-orange-400"></i>
                                <span>Editar</span>
                            </button>
                            <button type="button" onclick="eliminarPlatoAjax('${id}', '${name.replace(/'/g, "\\'")}')" class="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all active-press">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('\n');
        }

        categoriesBlocksHtml += `
        <section class="category-block space-y-4" id="cat-section-${cid}" data-cat-id="${cid}" data-cat-slug="${cslug}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div class="flex items-center gap-2.5">
                    <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${catColor}; box-shadow: 0 0 10px ${catColor}80;"></span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono-numbers font-extrabold bg-orange-950/40 border border-orange-500/40 text-orange-400 tracking-wider">${cid}</span>
                    <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                        ${cname}
                    </h3>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-slate-300 bg-slate-800/60 border border-slate-700/60">
                        ${platosEnCat.length} platos
                    </span>
                </div>
                <p class="text-[11px] text-slate-400 italic">${catDesc}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                ${cardsHtml}
            </div>
        </section>
        `;
    });

    container.innerHTML = categoriesBlocksHtml;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

const DEFAULT_CATEGORY_IMAGES = {
    'c0001': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'c0002': '/imagenes/categorias/alitas/banner.webp',
    'c0003': '/imagenes/categorias/bebidas/banner.webp',
    'c0004': '/imagenes/categorias/broaster/banner.webp',
    'c0005': '/imagenes/categorias/hamburguesas/banner.webp',
    'c0006': '/imagenes/categorias/infusiones/banner.webp',
    'c0007': '/imagenes/categorias/platos-amazonicos/banner.webp',
    'c0008': '/imagenes/categorias/refrescos/banner.webp',
    'c0009': '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp',
    'c0010': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    'promociones': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'alitas': '/imagenes/categorias/alitas/banner.webp',
    'bebidas': '/imagenes/categorias/bebidas/banner.webp',
    'broaster': '/imagenes/categorias/broaster/banner.webp',
    'hamburguesas': '/imagenes/categorias/hamburguesas/banner.webp',
    'infusiones': '/imagenes/categorias/infusiones/banner.webp',
    'platos-amazonicos': '/imagenes/categorias/platos-amazonicos/banner.webp',
    'refrescos': '/imagenes/categorias/refrescos/banner.webp',
    'salchipapas': '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp',
    'adicional': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80'
};

function updateCatPreviewName(text) {
    const nameTxt = document.getElementById('cat-preview-name-text');
    const val = (text || '').trim().toUpperCase();
    if (nameTxt) nameTxt.textContent = val || 'NOMBRE DE CATEGORÍA';
}

function setCatPhotoPreview(src) {
    const preview = document.getElementById('cat-photo-preview');
    const placeholder = document.getElementById('cat-photo-placeholder');
    const valInput = document.getElementById('cat-image-value');

    if (valInput) valInput.value = src || '';

    if (src) {
        if (preview) {
            preview.src = src;
            preview.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
    } else {
        if (preview) {
            preview.src = '';
            preview.classList.add('hidden');
        }
        if (placeholder) placeholder.classList.remove('hidden');
    }
}

async function handleCatImageUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const webpBase64 = await convertImageFileToWebP(file, 800, 0.82);
    if (webpBase64) {
        setCatPhotoPreview(webpBase64);
    }
}

function handleCatUrlInput(url) {
    const cleanUrl = (url || '').trim();
    setCatPhotoPreview(cleanUrl);
}

/**
 * Abre el formulario modal para crear o editar categorías
 */
function abrirCrearCategoriaModal(editCatId) {
    let targetCat = null;
    if (editCatId) {
        const searchId = editCatId.toString().trim().toLowerCase();
        targetCat = activeCategories.find(c => 
            (c.id || '').toLowerCase() === searchId || 
            (c.code || '').toLowerCase() === searchId || 
            (c.slug || '').toLowerCase() === searchId
        );
    }

    const nextNum = (activeCategories.length + 1).toString().padStart(4, '0');
    const nextId = targetCat ? (targetCat.id || targetCat.code) : ('C' + nextNum);
    const initialName = targetCat ? targetCat.name.toUpperCase() : '';
    const initialImg = targetCat ? (targetCat.image || DEFAULT_CATEGORY_IMAGES[targetCat.slug] || DEFAULT_CATEGORY_IMAGES[(targetCat.id || '').toLowerCase()] || '') : '';

    let existingGridHtml = activeCategories.map(cat => {
        const cid = cat.id || cat.code;
        const cslug = cat.slug || cid.toLowerCase();
        const cname = (cat.name || cid).toUpperCase().trim();
        const cimg = cat.image || DEFAULT_CATEGORY_IMAGES[cslug] || DEFAULT_CATEGORY_IMAGES[cid.toLowerCase()] || '/imagenes/categorias/hamburguesas/banner.webp';

        return `
        <div class="bg-[#101524] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all shadow-md">
            <div class="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-800/80 bg-[#080b14]">
                <img src="${cimg}" alt="${cname}" class="w-full h-full object-cover">
                <div class="absolute bottom-2 left-2 max-w-[88%] bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20 shadow-lg">
                    <span class="text-[11px] font-black text-white uppercase tracking-wider block leading-tight">${cname}</span>
                </div>
            </div>

            <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono-numbers font-bold text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/30">${cid}</span>
                    <span class="text-[10px] text-slate-500 uppercase font-semibold">${cslug}</span>
                </div>

                <div class="flex items-center gap-2">
                    <button type="button" onclick="editarCategoriaAction('${cid}')" class="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active-press border border-slate-700/60">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5 text-orange-400"></i>
                        <span>Editar</span>
                    </button>
                    <button type="button" onclick="eliminarCategoriaAjax('${cid}')" class="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active-press border border-red-500/30">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 text-red-400"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    const html = `
        <div class="product-editor-container animate-fade-in max-w-4xl mx-auto space-y-6">
            
            <!-- Header Sticky Superior -->
            <div class="product-sticky-header">
                <div class="product-header-title-box">
                    <button type="button" onclick="cerrarModal()" class="product-back-btn">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                        <div class="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] shrink-0"></div>
                        <div class="min-w-0">
                            <h2 class="product-header-title">${targetCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                            <span class="text-[11px] text-slate-400 hidden sm:inline">Gestión de imagen y nombre en MAYÚSCULAS para la carta pública</span>
                        </div>
                    </div>

                    <div class="product-id-pill">
                        <span>${nextId}</span>
                    </div>
                </div>
            </div>

            <!-- Formulario Principal de Categoría -->
            <form id="categoria-create-form" novalidate action="javascript:void(0)" onsubmit="event.preventDefault(); guardarCategoriaAjax(event); return false;" class="space-y-6 px-3 sm:px-6">
                <input type="hidden" id="cat-id-input" value="${nextId}">
                <input type="hidden" id="cat-image-value" value="${initialImg}">
                
                <div class="product-section-card space-y-5">
                    <div class="product-section-header">
                        <span class="product-section-title title-orange">
                            <i data-lucide="folder-plus" class="w-4 h-4"></i>
                            <span>${targetCat ? 'Modificar Categoría' : 'Datos de la Categoría'}</span>
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
                        
                        <!-- Columna Izquierda: ID y Nombre (6 cols) -->
                        <div class="md:col-span-6 space-y-4">
                            <div class="form-group">
                                <label class="form-label">Código / ID Oficial</label>
                                <input type="text" value="${nextId}" readonly class="form-input-text font-mono-numbers font-bold text-orange-400">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Nombre de la Categoría (MAYÚSCULAS) *</label>
                                <input type="text" id="cat-name-input" required value="${initialName}" placeholder="EJ: POSTRES Y HELADOS" oninput="this.value = this.value.toUpperCase(); updateCatPreviewName(this.value);" class="form-input-text font-black text-base uppercase tracking-wider">
                            </div>
                        </div>

                        <!-- Columna Derecha: Imagen Banner Cuadrada (6 cols) -->
                        <div class="md:col-span-6 space-y-4">
                            <label class="form-label">Fotografía / Imagen Cuadrada (1:1) *</label>
                            
                            <div class="relative w-full max-w-[280px] mx-auto aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0d16] shadow-md group">
                                <img id="cat-photo-preview" src="${initialImg}" alt="Vista previa" class="w-full h-full object-cover ${initialImg ? '' : 'hidden'}">
                                <div id="cat-photo-placeholder" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center ${initialImg ? 'hidden' : ''}">
                                    <i data-lucide="image" class="w-8 h-8 text-slate-500 mb-2"></i>
                                    <span class="text-xs font-bold text-slate-300 block">Sin fotografía seleccionada</span>
                                    <span class="text-[10px] text-slate-500 block">Sube una imagen o pega URL</span>
                                </div>
                                <div id="cat-preview-overlay" class="absolute bottom-3 left-3 max-w-[85%] bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                                    <span id="cat-preview-name-text" class="text-xs font-black text-white uppercase tracking-wider block leading-tight">${initialName || 'NOMBRE DE CATEGORÍA'}</span>
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <label class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer border border-slate-700/60 transition-all flex items-center gap-1.5 shrink-0 active-press">
                                    <i data-lucide="upload" class="w-3.5 h-3.5 text-orange-400"></i>
                                    <span>Subir Foto</span>
                                    <input type="file" accept="image/*" class="hidden" onchange="handleCatImageUpload(this)">
                                </label>
                                <input type="url" id="cat-url-input" value="${initialImg.startsWith('data:') ? '' : initialImg}" placeholder="O pega URL web..." oninput="handleCatUrlInput(this.value)" class="form-input-text text-xs flex-1">
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción Debajo de la Imagen y Datos de la Categoría -->
                    <div class="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3 w-full">
                        <button type="button" onclick="cerrarModal()" class="flex-1 sm:flex-initial h-11 px-7 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-all active-press cursor-pointer border border-slate-700/60 flex items-center justify-center">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 sm:flex-initial h-11 px-7 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active-press cursor-pointer border border-orange-400/30">
                            <i data-lucide="check" class="w-4 h-4 text-white"></i>
                            <span>Guardar</span>
                        </button>
                    </div>
                </div>
            </form>

            <!-- Categorías Existentes -->
            <div class="px-3 sm:px-6 space-y-4 pt-4 border-t border-slate-800/80 pb-8">
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                        <i data-lucide="layers" class="w-4 h-4 text-orange-400"></i>
                        <span>Categorías Existentes en la Carta</span>
                    </h3>
                    <span class="text-xs text-slate-400 font-mono-numbers">${activeCategories.length} categorías</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${existingGridHtml}
                </div>
            </div>
        </div>
    `;

    abrirModalHtml(html);
}

function editarCategoriaAction(cid) {
    if (!cid) return;
    abrirCrearCategoriaModal(cid);
    const scrollTarget = document.getElementById('categoria-create-form');
    if (scrollTarget && typeof scrollTarget.scrollIntoView === 'function') {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

async function guardarCategoriaAjax(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('cat-id-input');
    const nameInput = document.getElementById('cat-name-input');
    const imageInput = document.getElementById('cat-image-value');

    const id = idInput ? idInput.value : '';
    const name = nameInput ? nameInput.value.trim().toUpperCase() : '';
    const image = imageInput ? imageInput.value.trim() : '';

    if (!name) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const categoryData = {
        id,
        code: id,
        name,
        slug,
        image
    };

    const searchId = id.toString().trim().toLowerCase();
    const existingIndex = activeCategories.findIndex(c => 
        (c.id || '').toLowerCase() === searchId || 
        (c.code || '').toLowerCase() === searchId || 
        (c.slug || '').toLowerCase() === searchId
    );

    if (existingIndex !== -1) {
        activeCategories[existingIndex] = { ...activeCategories[existingIndex], ...categoryData };
        try {
            await fetch(`/api/categories/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(categoryData)
            }).catch(() => {});
        } catch (err) {}
    } else {
        activeCategories.push(categoryData);
        try {
            await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(categoryData)
            }).catch(() => {});
        } catch (err) {}
    }

    cerrarModal();
    await initProductosView();
}

async function eliminarCategoriaAjax(cid) {
    if (!cid) return;
    const searchId = cid.toString().trim().toLowerCase();

    activeCategories = activeCategories.filter(c => 
        (c.id || '').toLowerCase() !== searchId && 
        (c.code || '').toLowerCase() !== searchId && 
        (c.slug || '').toLowerCase() !== searchId
    );

    try {
        await fetch(`/api/categories/${encodeURIComponent(cid)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });
    } catch (err) {
        console.error("Error al eliminar categoría:", err);
    }

    cerrarModal();
    await initProductosView();
}

document.addEventListener('DOMContentLoaded', () => {
    initProductosView();
});

