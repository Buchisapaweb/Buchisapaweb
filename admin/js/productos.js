let activeCategories = [];

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
});

console.log("🍔 Productos Module Initialized");

/**
 * Filter products table rows in real-time (Desktop & Mobile)
 */
function filterProductosTable() {
    const input = document.getElementById('productos-search');
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    
    // Filter desktop rows
    const desktopRows = document.querySelectorAll('.desktop-producto-row');
    desktopRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });

    // Filter mobile cards
    const mobileCards = document.querySelectorAll('.mobile-producto-card');
    mobileCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Open create product modal dialog with dynamic category selections
 */
function abrirCrearProductoModal() {
    if (typeof activeCategories === 'undefined') {
        console.error("Categories data is not defined.");
        return;
    }

    let catOptions = '';
    activeCategories.forEach(c => {
        catOptions += `<option value="${c.id}">${c.name}</option>`;
    });

    const html = `
        <h3 class="text-sm font-black uppercase text-slate-400 tracking-wider mb-5 flex items-center gap-2">
            <span class="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
            Nuevo Plato / Combo
        </h3>
        <form action="/admin/index.php?view=productos" method="POST" class="space-y-4 text-xs">
            <input type="hidden" name="action" value="create">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">ID Clave Único</label>
                    <input type="text" name="id_form" required placeholder="broaster-4" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none premium-input">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Nombre de Plato</label>
                    <input type="text" name="name" required placeholder="1/4 Pollo Broaster Clásico" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none premium-input">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Precio Venta (S/)</label>
                    <input type="number" step="0.1" name="price" required placeholder="18.50" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none premium-input">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Stock Cocina Inicial</label>
                    <input type="number" name="stock" required placeholder="20" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none premium-input">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Categoría del Menú</label>
                    <select name="category" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none premium-input">
                        ${catOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Disponibilidad</label>
                    <select name="available" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none premium-input">
                        <option value="true" selected>Disponible Inmediato</option>
                        <option value="false">Desactivado / Agotado</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-[10px] text-slate-500 font-extrabold mb-1 uppercase tracking-wider">Descripción y Guarniciones</label>
                <textarea name="description" rows="2" placeholder="Crujiente pollo con papas fritas..." class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg p-3 text-white focus:outline-none premium-input"></textarea>
            </div>
            <div>
                <label class="block text-[10px] text-slate-500 font-extrabold mb-1 uppercase tracking-wider">Ruta de Imagen (URL)</label>
                <input type="text" name="image_url" value="/imagenes/productos/fallback.webp" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none premium-input">
            </div>
            <button type="submit" class="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg active-press">Crear Producto</button>
        </form>
    `;
    abrirModalHtml(html);
}

/**
 * Open edit product modal dialog with pre-filled product variables
 */
function abrirEditarProductoModal(p) {
    if (typeof activeCategories === 'undefined') {
        console.error("Categories data is not defined.");
        return;
    }

    let catOptions = '';
    activeCategories.forEach(c => {
        const isSel = c.id === p.category ? 'selected' : '';
        catOptions += `<option value="${c.id}" ${isSel}>${c.name}</option>`;
    });

    const isAvailable = p.available === undefined || p.available === true || p.available === 'true';

    const html = `
        <h3 class="text-sm font-black uppercase text-slate-400 tracking-wider mb-5 flex items-center gap-2">
            <span class="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
            Editar Plato / Combo
        </h3>
        <form action="/admin/index.php?view=productos" method="POST" class="space-y-4 text-xs">
            <input type="hidden" name="action" value="edit">
            <input type="hidden" name="id" value="${p.id}">
            <div>
                <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Nombre de Plato</label>
                <input type="text" name="name" value="${p.name || ''}" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none premium-input">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Precio (S/)</label>
                    <input type="number" step="0.1" name="price" value="${p.price || 0}" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none premium-input">
                </div>
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Stock Físico</label>
                    <input type="number" name="stock" value="${p.stock || 0}" required class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none premium-input">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Categoría del Menú</label>
                    <select name="category" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none premium-input">
                        ${catOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">Disponibilidad</label>
                    <select name="available" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none premium-input">
                        <option value="true" ${isAvailable ? 'selected' : ''}>Disponible Inmediato</option>
                        <option value="false" ${!isAvailable ? 'selected' : ''}>Desactivado / Agotado</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-[10px] text-slate-500 font-extrabold mb-1 uppercase tracking-wider">Descripción y Guarniciones</label>
                <textarea name="description" rows="2" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg p-3 text-white focus:outline-none premium-input">${p.description || ''}</textarea>
            </div>
            <div>
                <label class="block text-[10px] text-slate-500 font-extrabold mb-1 uppercase tracking-wider">Ruta de Imagen (URL)</label>
                <input type="text" name="image_url" value="${p.image || '/imagenes/productos/fallback.webp'}" class="w-full bg-[#0a0d16] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none premium-input">
            </div>
            <button type="submit" class="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg active-press">Guardar Cambios</button>
        </form>
    `;
    abrirModalHtml(html);
}
