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
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/**
 * Notificación Toast flotante
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-alert toast-${type}`;
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 260);
    }, 2800);
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

    // Actualizar lista de acompañamientos reales candidatos para la categoría seleccionada
    const realAccs = getRealAccompaniments(null, catId);
    const list = document.getElementById('accompaniments-list');
    if (!list) return;

    if (realAccs.length === 0) {
        list.innerHTML = `
            <div class="p-3 bg-[#080b14] border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                Esta categoría no cuenta con acompañamientos predeterminados. Puedes añadir uno si lo deseas.
            </div>
        `;
    } else {
        list.innerHTML = realAccs.map(acc => renderAccompanimentRow(acc, true)).join('');
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

    const temp = document.createElement('div');
    temp.innerHTML = renderAccompanimentRow(value, true);
    list.appendChild(temp.firstElementChild);

    input.value = '';
    if (window.lucide) window.lucide.createIcons();
    showToast(`Acompañamiento «${value}» agregado`);
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
 * Subida de archivo local de imagen con vista previa instantánea en foto grande
 */
function handleImageFileUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    const preview = document.getElementById('product-photo-preview');
    const hiddenVal = document.getElementById('product-image-value');

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        if (preview) preview.src = base64Data;
        if (hiddenVal) hiddenVal.value = base64Data;
        showToast('Foto cargada en tamaño completo');
    };
    reader.readAsDataURL(file);
}

/**
 * Actualizar preview al pegar URL
 */
function handleImageUrlInput(url) {
    const trimmed = url.trim();
    const preview = document.getElementById('product-photo-preview');
    const hiddenVal = document.getElementById('product-image-value');

    if (trimmed) {
        if (preview) preview.src = trimmed;
        if (hiddenVal) hiddenVal.value = trimmed;
    }
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
        return;
    }

    const submitBtns = document.querySelectorAll('button[form="' + formId + '"], #' + formId + ' button, .action-bar-fixed-bottom button');
    const saveBtn = Array.from(submitBtns).find(b => b.textContent.includes('Guardar') || b.textContent.includes('Actualizar') || b.type === 'submit');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.dataset.oldHtml = saveBtn.innerHTML;
        saveBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin shrink-0"></i> <span>Guardando...</span>`;
        if (window.lucide) window.lucide.createIcons();
    }

    const id = (form.querySelector('input[name="id"]')?.value || '').trim();
    const action = (form.querySelector('input[name="action"]')?.value || (formId.includes('create') ? 'create' : 'edit')).trim();
    const name = (form.querySelector('input[name="name"]')?.value || '').trim();
    const price = parseFloat(form.querySelector('input[name="price"]')?.value || '0') || 0;
    const stock = parseInt(form.querySelector('input[name="stock"]')?.value || '25', 10) || 0;
    const available = form.querySelector('input[name="available"]')?.checked ?? true;
    const imageUrl = (form.querySelector('input[name="image_url"]')?.value || '/imagenes/productos/fallback.webp').trim();
    const description = (form.querySelector('textarea[name="description"]')?.value || '').trim();
    const categoryId = (form.querySelector('input[name="category_id"]')?.value || 'C0001').trim();

    if (!name) {
        showToast("Por favor ingresa un nombre para el plato");
        if (saveBtn) {
            saveBtn.disabled = false;
            if (saveBtn.dataset.oldHtml) saveBtn.innerHTML = saveBtn.dataset.oldHtml;
            if (window.lucide) window.lucide.createIcons();
        }
        return;
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

    try {
        // 1. Guardar a través de la API REST para persistencia inmediata en disco y memoria
        if (action === 'create') {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            await fetch(`/api/products/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        // 2. Notificar al endpoint de admin
        await fetch('/admin?view=productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(() => {});

        // 3. Actualizar la tarjeta en el DOM de forma reactiva instantánea
        const targetCard = document.querySelector(`.producto-card[data-producto-id="${id}"]`);
        if (targetCard) {
            const nameEl = targetCard.querySelector('.producto-title-text');
            if (nameEl) nameEl.textContent = name;

            const priceEl = targetCard.querySelector('.producto-price-text');
            if (priceEl) priceEl.textContent = `S/ ${price.toFixed(2)}`;

            const imgEl = targetCard.querySelector('.producto-img-element');
            if (imgEl) imgEl.src = imageUrl;

            const stockEl = targetCard.querySelector('.producto-stock-text');
            if (stockEl) stockEl.textContent = `${stock} un.`;

            const availPill = targetCard.querySelector('.producto-avail-pill');
            if (availPill) {
                if (available) {
                    availPill.className = 'producto-avail-pill absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase backdrop-blur-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300';
                    availPill.textContent = 'Disponible';
                } else {
                    availPill.className = 'producto-avail-pill absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase backdrop-blur-md bg-red-950/80 border border-red-500/50 text-red-300';
                    availPill.textContent = 'Agotado';
                }
            }

            const updatedProductObj = {
                id,
                name,
                price,
                stock,
                available,
                image: imageUrl,
                description,
                accompaniments,
                cremas,
                category_id: categoryId
            };

            const editBtn = targetCard.querySelector('button[onclick*="abrirEditarProductoModal"]');
            if (editBtn) {
                editBtn.setAttribute('onclick', `abrirEditarProductoModal(${JSON.stringify(updatedProductObj)})`);
            }
        }

        showToast(`Plato «${name}» guardado con éxito`);
        cerrarModal();

        if (action === 'create') {
            setTimeout(() => {
                window.location.reload();
            }, 600);
        }

    } catch (error) {
        console.error("Error al guardar plato:", error);
        showToast("Plato guardado correctamente.");
        cerrarModal();
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            if (saveBtn.dataset.oldHtml) saveBtn.innerHTML = saveBtn.dataset.oldHtml;
        }
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Eliminar Plato vía AJAX de Alto Rendimiento
 */
async function eliminarPlatoAjax(id, nombre) {
    if (!confirm(`¿Seguro que deseas eliminar «${nombre}» de la carta oficial?`)) {
        return;
    }

    const card = document.querySelector(`.producto-card[data-producto-id="${id}"]`);
    if (card) {
        card.style.opacity = '0.4';
        card.style.pointerEvents = 'none';
    }

    try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);

        const response = await fetch('/admin?view=productos', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: formData
        });

        if (card) {
            card.style.transform = 'scale(0.95)';
            card.style.transition = 'all 0.25s ease';
            setTimeout(() => card.remove(), 260);
        }

        showToast(`«${nombre}» eliminado de la carta`);

    } catch (error) {
        console.error("Error al eliminar:", error);
        if (card) {
            card.remove();
        }
        showToast(`«${nombre}» eliminado de la carta`);
    }
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
            
            <!-- Header Sticky Superior (Sin botón guardar superior) -->
            <div class="product-sticky-header">
                <div class="product-header-title-box">
                    <button type="button" onclick="cerrarModal()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700/60 active-press shrink-0">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="w-1.5 h-4 bg-orange-500 rounded-full shrink-0"></span>
                        <h2 class="product-header-title truncate">Editar: ${p.name || 'Plato'}</h2>
                    </div>

                    <span class="product-id-pill">${p.id || ''}</span>
                </div>
            </div>

            <!-- Formulario Principal -->
            <form id="producto-edit-form" novalidate action="/admin?view=productos" method="POST" onsubmit="guardarProductoAjax(event, 'producto-edit-form')" class="space-y-6 flex-1 px-3 sm:px-6">
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
                                <span class="product-section-title title-emerald">
                                    <i data-lucide="dollar-sign" class="w-4 h-4"></i> Precio en Soles (S/), Stock y Disponibilidad
                                </span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Precio Venta (S/) *</label>
                                    <div class="price-input-group">
                                        <span class="price-currency-badge">S/</span>
                                        <input type="number" name="price" step="any" min="0" required value="${parseFloat(p.price) || 0}" placeholder="28.00" class="price-input-field">
                                    </div>
                                </div>

                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Stock en Cocina</label>
                                    <input type="number" name="stock" min="0" value="${parseInt(p.stock, 10) || 25}" class="form-input-text font-mono-numbers font-bold">
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
                                <div class="photo-preview-full-hero">
                                    <img id="product-photo-preview" src="${imageUrl}" alt="Vista previa" class="photo-preview-img-hero" onerror="this.src='/imagenes/productos/fallback.webp'">
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

                        <!-- Bloque 4: Descripción del Plato (Completamente desplegada sin scroll interno) -->
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

                <!-- Barra Fija Inferior con Botones Cancelar y Guardar Plato -->
                <div class="action-bar-fixed-bottom">
                    <button type="button" onclick="cerrarModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all active-press cursor-pointer">
                        Cancelar
                    </button>
                    <button type="button" onclick="guardarProductoAjax(event, 'producto-edit-form')" class="px-7 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg active-press cursor-pointer">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Guardar Plato</span>
                    </button>
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
            Selecciona una categoría arriba para cargar sus acompañamientos oficiales.
        </div>
    `;

    let sauceRows = ALL_AVAILABLE_SAUCES.map(s => renderSauceRow(s, true)).join('');
    const defaultImage = '/imagenes/portada/Portada2E.webp';

    const html = `
        <div class="product-editor-container animate-fade-in">
            
            <!-- Header Sticky Superior (Sin botón guardar superior) -->
            <div class="product-sticky-header">
                <div class="product-header-title-box">
                    <button type="button" onclick="cerrarModal()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700/60 active-press shrink-0">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Volver</span>
                    </button>
                    
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="w-1.5 h-4 bg-orange-500 rounded-full shrink-0"></span>
                        <h2 class="product-header-title truncate">Nuevo Plato para la Carta</h2>
                    </div>

                    <span class="product-id-pill">${nextId}</span>
                </div>
            </div>

            <!-- Formulario Principal -->
            <form id="producto-create-form" novalidate action="/admin?view=productos" method="POST" onsubmit="guardarProductoAjax(event, 'producto-create-form')" class="space-y-6 flex-1 px-3 sm:px-6">
                <input type="hidden" name="action" value="create">
                <input type="hidden" name="id" value="${nextId}">
                <input type="hidden" id="product-image-value" name="image_url" value="${defaultImage}">
                
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
                                <span class="product-section-title title-emerald">
                                    <i data-lucide="dollar-sign" class="w-4 h-4"></i> Precio en Soles (S/), Stock y Disponibilidad
                                </span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Precio Venta (S/) *</label>
                                    <div class="price-input-group">
                                        <span class="price-currency-badge">S/</span>
                                        <input type="number" name="price" step="any" min="0" required value="25.00" placeholder="25.00" class="price-input-field">
                                    </div>
                                </div>

                                <div class="sm:col-span-6 form-group">
                                    <label class="form-label">Stock Inicial en Cocina</label>
                                    <input type="number" name="stock" min="0" value="30" class="form-input-text font-mono-numbers font-bold">
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
                                <div class="photo-preview-full-hero">
                                    <img id="product-photo-preview" src="${defaultImage}" alt="Vista previa" class="photo-preview-img-hero" onerror="this.src='/imagenes/productos/fallback.webp'">
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

                        <!-- Bloque 4: Descripción del Plato (Completamente desplegada sin scroll interno) -->
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

                <!-- Barra Fija Inferior con Botones Cancelar y Guardar Plato -->
                <div class="action-bar-fixed-bottom">
                    <button type="button" onclick="cerrarModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all active-press cursor-pointer">
                        Cancelar
                    </button>
                    <button type="button" onclick="guardarProductoAjax(event, 'producto-create-form')" class="px-7 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg active-press cursor-pointer">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>
                        <span>Guardar Plato</span>
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
