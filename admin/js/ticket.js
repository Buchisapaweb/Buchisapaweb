/**
 * BUCHISAPA BURGER & BROASTER - TICKET MODULE JS
 * admin/js/ticket.js
 */

console.log("🎫 Ticket Module Initialized");

var allTicketsData = [];
var currentTicketFilter = 'all';
var pedidoImpresionActivo = null;
var ticketDisplayMode = 'boleta'; // 'boleta' | 'comanda'
var ticketPaperWidth = '80mm'; // '58mm' | '80mm'
var quickTicketSelectedItems = {}; // { [productId]: { product, quantity } }
var availableProductsCache = [];

document.addEventListener('DOMContentLoaded', () => {
    initTicketView();
});

async function initTicketView() {
    const tbody = document.getElementById('ticket-orders-tbody');
    if (!tbody) return;

    try {
        const [ordersRes, ticketsRes] = await Promise.all([
            fetch('/api/orders').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/tickets').then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (Array.isArray(ordersRes) ? ordersRes : []);
        const rawTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : (Array.isArray(ticketsRes) ? ticketsRes : []);

        // Combinar órdenes y tickets evitando duplicados por ID
        const seenIds = new Set();
        const combined = [];

        [...rawTickets, ...rawOrders].forEach(item => {
            const id = item.id || `tk-${item.orderNumber}`;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push(item);
            }
        });

        // Ordenar por fecha descendente
        combined.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || Date.now()).getTime();
            const dateB = new Date(b.createdAt || b.created_at || Date.now()).getTime();
            return dateB - dateA;
        });

        allTicketsData = combined;
        actualizarMetricasTickets(allTicketsData);
        renderTicketsTable();

    } catch (e) {
        console.error('Error cargando pedidos para tickets:', e);
    }
}

function actualizarMetricasTickets(tickets) {
    const totalEl = document.getElementById('stat-total-tickets');
    const salonEl = document.getElementById('stat-salon-tickets');
    const deliveryEl = document.getElementById('stat-delivery-tickets');
    const llevarEl = document.getElementById('stat-llevar-tickets');

    if (totalEl) totalEl.textContent = `${tickets.length} tickets`;
    if (salonEl) salonEl.textContent = `${tickets.filter(t => (t.orderType || '').toLowerCase() === 'salon').length} órdenes`;
    if (deliveryEl) deliveryEl.textContent = `${tickets.filter(t => (t.orderType || '').toLowerCase() === 'delivery').length} órdenes`;
    if (llevarEl) llevarEl.textContent = `${tickets.filter(t => (t.orderType || '').toLowerCase() === 'llevar').length} órdenes`;
}

function getFormattedTicketCode(o) {
    if (o && o.ticketNumber && /^TK\d{6}$/i.test(o.ticketNumber)) {
        return o.ticketNumber.toUpperCase();
    }
    const rawNum = typeof o?.orderNumber === 'number' ? o.orderNumber : (parseInt(String(o?.orderNumber || o?.id || '1').replace(/\D/g, ''), 10) || 1);
    return `TK${String(rawNum).padStart(6, '0')}`;
}

function renderTicketsTable() {
    const tbody = document.getElementById('ticket-orders-tbody');
    if (!tbody) return;

    const query = (document.getElementById('tickets-search-input')?.value || '').toLowerCase().trim();

    let filtered = allTicketsData.filter(o => {
        // Filtro por tipo
        if (currentTicketFilter !== 'all') {
            const type = (o.orderType || 'delivery').toLowerCase();
            if (type !== currentTicketFilter) return false;
        }
        // Filtro por búsqueda
        if (query) {
            const ticketCode = getFormattedTicketCode(o).toLowerCase();
            const num = String(o.orderNumber || o.id || '').toLowerCase();
            const name = String(o.customerName || '').toLowerCase();
            const phone = String(o.customerPhone || '').toLowerCase();
            if (!ticketCode.includes(query) && !num.includes(query) && !name.includes(query) && !phone.includes(query)) {
                return false;
            }
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-slate-500 font-semibold select-none">
                    <div class="flex flex-col items-center justify-center gap-2">
                        <i data-lucide="receipt" class="w-8 h-8 text-slate-600"></i>
                        <span>No se encontraron tickets con los filtros aplicados.</span>
                    </div>
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let html = '';
    filtered.forEach(o => {
        const id = o.id;
        const ticketCode = getFormattedTicketCode(o);
        const rawNum = typeof o.orderNumber === 'number' ? o.orderNumber : (parseInt(String(o.orderNumber || id).replace(/\D/g, ''), 10) || 1);
        const name = o.customerName || 'Cliente Mostrador';
        const phone = o.customerPhone || 'Sin teléfono';
        const address = o.deliveryAddress || o.address || (o.orderType === 'salon' ? 'Salón' : 'Mostrador');
        const total = Number(o.total || 0).toFixed(2);
        const type = (o.orderType || 'delivery').toLowerCase();
        const payment = o.paymentMethod || 'Efectivo';

        let typeBadge = '';
        if (type === 'salon') {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-950/60 border border-amber-500/40 text-amber-300">🍽️ Salón</span>';
        } else if (type === 'delivery') {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">🛵 Delivery</span>';
        } else {
            typeBadge = '<span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">🛍️ Llevar</span>';
        }

        let items = [];
        if (typeof o.items === 'string') {
            try { items = JSON.parse(o.items); } catch(e) {}
        } else if (Array.isArray(o.items)) {
            items = o.items;
        }

        const itemsBrief = items.map(it => `${it.quantity || it.cant || 1}x ${it.name || it.nombre || 'Plato'}`).join(', ');
        const rawJson = JSON.stringify(o).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

        html += `
        <tr class="hover:bg-slate-800/30 transition-colors">
            <td class="p-4 font-mono select-none">
                <span class="block text-white font-black text-sm tracking-wide text-orange-400 font-mono-numbers">${ticketCode}</span>
                <span class="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orden #${rawNum}</span>
            </td>
            <td class="p-4">
                <span class="block text-white font-extrabold text-xs">${name}</span>
                <span class="block text-[10px] text-slate-400 font-mono mt-0.5">${phone}</span>
                <span class="block text-[10px] text-slate-500 truncate max-w-[180px]">${address}</span>
            </td>
            <td class="p-4 font-medium text-slate-300 max-w-xs truncate text-xs" title="${itemsBrief}">
                ${itemsBrief || 'Detalle no disponible'}
            </td>
            <td class="p-4 text-right select-none">
                <span class="block font-black text-emerald-400 font-mono text-sm">S/ ${total}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-semibold">${payment}</span>
            </td>
            <td class="p-4 select-none">
                ${typeBadge}
            </td>
            <td class="p-4">
                <div class="flex items-center justify-center gap-1.5">
                    <button type="button" onclick='abrirGeneradorTicket(${rawJson}, "boleta")' class="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm active-press" title="Ver Boleta de Cliente">
                        <i data-lucide="receipt" class="w-3.5 h-3.5"></i>
                        <span>Boleta</span>
                    </button>
                    <button type="button" onclick='abrirGeneradorTicket(${rawJson}, "comanda")' class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-slate-700/60 active-press" title="Ver Comanda Cocina">
                        <i data-lucide="chef-hat" class="w-3.5 h-3.5 text-amber-400"></i>
                        <span>Cocina</span>
                    </button>
                    <button type="button" onclick='eliminarTicketAjax("${id}")' class="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all active-press" title="Eliminar Ticket">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filtrarTicketsTabla() {
    renderTicketsTable();
}

function seleccionarFiltroTipoTicket(type) {
    currentTicketFilter = type;
    const tabs = document.querySelectorAll('.ticket-filter-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-type') === type) {
            tab.className = 'ticket-filter-tab active px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 bg-orange-600 text-white';
        } else {
            tab.className = 'ticket-filter-tab px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 text-slate-400 hover:text-white bg-[#0f1424] border border-slate-800';
        }
    });
    renderTicketsTable();
}

function cambiarModoTicket(mode) {
    ticketDisplayMode = mode;
    const btnBoleta = document.getElementById('btn-mode-boleta');
    const btnComanda = document.getElementById('btn-mode-comanda');

    if (mode === 'boleta') {
        if (btnBoleta) btnBoleta.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-orange-600 text-white transition-all';
        if (btnComanda) btnComanda.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-slate-800 text-slate-300 hover:text-white transition-all';
    } else {
        if (btnBoleta) btnBoleta.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-slate-800 text-slate-300 hover:text-white transition-all';
        if (btnComanda) btnComanda.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-amber-600 text-white transition-all';
    }

    if (pedidoImpresionActivo) {
        renderTicketPaperContent(pedidoImpresionActivo);
    }
}

function cambiarAnchoPapel(width) {
    ticketPaperWidth = width;
    const btn80 = document.getElementById('btn-paper-80mm');
    const btn58 = document.getElementById('btn-paper-58mm');
    const paper = document.getElementById('pos-ticket-paper');

    if (width === '80mm') {
        if (btn80) btn80.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-orange-600 text-white transition-all';
        if (btn58) btn58.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-slate-800 text-slate-300 hover:text-white transition-all';
        if (paper) paper.style.maxWidth = '340px';
    } else {
        if (btn80) btn80.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-slate-800 text-slate-300 hover:text-white transition-all';
        if (btn58) btn58.className = 'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-orange-600 text-white transition-all';
        if (paper) paper.style.maxWidth = '260px';
    }
}

function abrirGeneradorTicket(o, mode = 'boleta') {
    pedidoImpresionActivo = o;
    ticketDisplayMode = mode;
    cambiarModoTicket(mode);
    cambiarAnchoPapel(ticketPaperWidth);

    renderTicketPaperContent(o);

    const modal = document.getElementById('ticket-modal-container');
    if (modal) modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderTicketPaperContent(o) {
    let items = [];
    if (typeof o.items === 'string') {
        try { items = JSON.parse(o.items || '[]'); } catch(e) {}
    } else if (Array.isArray(o.items)) {
        items = o.items;
    }

    const ticketCode = getFormattedTicketCode(o);
    const rawNum = typeof o.orderNumber === 'number' ? o.orderNumber : (parseInt(String(o.orderNumber || o.id).replace(/\D/g, ''), 10) || 1);
    const dateStr = o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleString('es-PE', { hour12: true }) : new Date().toLocaleString('es-PE');
    const orderType = (o.orderType || 'Delivery').toUpperCase();
    const address = o.deliveryAddress || o.address || (o.orderType === 'salon' ? 'Mesa en Salón' : 'Recojo en Mostrador');

    let markup = '';

    if (ticketDisplayMode === 'comanda') {
        // FORMATO ESPECIAL PARA COCINA (Sin precios, texto destacado, cremas y notas)
        let itemsHtml = '';
        items.forEach(it => {
            const qty = it.quantity || it.cant || 1;
            const name = it.name || it.nombre || 'Plato';
            const notes = it.customization?.notes || it.notes || '';
            const accs = Array.isArray(it.customization?.accompaniments) ? it.customization.accompaniments.join(', ') : '';
            const cremas = Array.isArray(it.customization?.cremas) ? it.customization.cremas.join(', ') : '';

            itemsHtml += `
            <div class="border-b border-dashed border-black/40 pb-2 mb-2">
                <div class="flex justify-between items-start font-black text-sm">
                    <span class="text-base">${qty}x ${name}</span>
                </div>
                ${accs ? `<div class="text-[10px] text-black/80 font-bold ml-3 mt-0.5">🔹 Acomp: ${accs}</div>` : ''}
                ${cremas ? `<div class="text-[10px] text-black/80 font-bold ml-3 mt-0.5">🥫 Cremas: ${cremas}</div>` : ''}
                ${notes ? `<div class="text-[10px] font-black text-black bg-black/10 px-1.5 py-0.5 rounded mt-1 ml-3">⚠️ NOTA: ${notes}</div>` : ''}
            </div>`;
        });

        markup = `
            <div class="text-center font-black leading-tight">
                <div class="text-xs uppercase bg-black text-white py-1 tracking-wider mb-1">*** COMANDA DE COCINA ***</div>
                <div class="text-xl font-mono">${ticketCode}</div>
                <div class="text-xs text-black/70">ORDEN #${rawNum}</div>
                <div class="text-xs uppercase font-extrabold mt-0.5">[ ${orderType} - ${address} ]</div>
                <div class="text-[9px] text-black/70 font-mono mt-0.5">${dateStr}</div>
            </div>

            <div class="border-t-2 border-black my-2"></div>

            <div class="space-y-1">
                ${itemsHtml}
            </div>

            <div class="border-t-2 border-black my-2"></div>

            <div class="text-center text-[10px] font-black">
                <div>CLIENTE: ${(o.customerName || 'Cliente').toUpperCase()}</div>
                ${o.customerPhone ? `<div>TEL: ${o.customerPhone}</div>` : ''}
                <div class="text-[8px] text-black/60 mt-1">BUCHISAPA COCINA POS</div>
            </div>
        `;

    } else {
        // FORMATO BOLETA / RECIBO DE VENTA (CLIENTE)
        let itemsRowsHtml = '';
        let calcSubtotal = 0;

        items.forEach(it => {
            const qty = it.quantity || it.cant || 1;
            const price = parseFloat(it.price || it.precio || 0);
            const itemTotal = qty * price;
            calcSubtotal += itemTotal;
            const notes = it.customization?.notes || it.notes || '';

            itemsRowsHtml += `
            <div class="mb-1.5">
                <div class="flex justify-between items-start text-xs leading-tight">
                    <span class="flex-1 font-bold">${qty}x ${it.name || it.nombre}</span>
                    <span class="ml-4 tabular-nums font-bold">S/ ${itemTotal.toFixed(2)}</span>
                </div>
                ${notes ? `<div class="text-[9px] text-black/70 italic ml-2">(${notes})</div>` : ''}
            </div>`;
        });

        const subtotal = o.subtotal !== undefined ? parseFloat(o.subtotal) : calcSubtotal;
        const deliveryFee = parseFloat(o.deliveryFee || 0);
        const total = parseFloat(o.total || (subtotal + deliveryFee));

        markup = `
            <div class="text-center leading-tight">
                <h4 class="font-extrabold text-base tracking-wider uppercase">BUCHISAPA BURGER & BROASTER</h4>
                <p class="text-[10px] leading-tight uppercase font-bold mt-0.5">Sabor Amazónico a la Leña</p>
                <p class="text-[9px] leading-tight text-black/80 mt-0.5">RUC: 20608945123</p>
                <p class="text-[9px] leading-tight text-black/80">Av. La Estrella con Calle 28 de Julio</p>
                <p class="text-[9px] leading-tight text-black/80">Santa Clara, Ate - Lima</p>
                <p class="text-[9px] leading-tight text-black/80">WhatsApp / Pedidos: 987 654 321</p>
            </div>

            <div class="border-t border-dashed border-black/40 my-2.5"></div>

            <div class="text-[10px] leading-snug space-y-0.5">
                <div><strong>BOLETA DE VENTA:</strong> <span class="font-mono font-bold">${ticketCode}</span></div>
                <div><strong>N° DE ORDEN:</strong> #${rawNum}</div>
                <div><strong>FECHA / HORA:</strong> ${dateStr}</div>
                <div><strong>CLIENTE:</strong> ${o.customerName || 'Cliente Mostrador'}</div>
                ${o.customerPhone ? `<div><strong>TELÉFONO:</strong> ${o.customerPhone}</div>` : ''}
                <div><strong>ATENCIÓN:</strong> ${orderType}</div>
                <div><strong>MÉTODO PAGO:</strong> ${o.paymentMethod || 'Yape'}</div>
                ${address ? `<div><strong>UBICACIÓN:</strong> ${address}</div>` : ''}
            </div>

            <div class="border-t border-dashed border-black/40 my-2.5"></div>

            <div>
                <div class="flex justify-between font-extrabold text-[10px] uppercase border-b border-black/20 pb-1 mb-1.5">
                    <span>CANT / DESCRIPCIÓN</span>
                    <span>IMPORTE</span>
                </div>
                ${itemsRowsHtml}
            </div>

            <div class="border-t border-dashed border-black/40 my-2.5"></div>

            <div class="text-xs space-y-1">
                <div class="flex justify-between text-[10px]">
                    <span>SUBTOTAL:</span>
                    <span class="tabular-nums">S/ ${subtotal.toFixed(2)}</span>
                </div>
                ${deliveryFee > 0 ? `
                <div class="flex justify-between text-[10px]">
                    <span>DELIVERY:</span>
                    <span class="tabular-nums">S/ ${deliveryFee.toFixed(2)}</span>
                </div>` : ''}
                <div class="flex justify-between font-extrabold text-sm border-t border-black/30 pt-1 mt-1">
                    <span>TOTAL A PAGAR:</span>
                    <span class="tabular-nums">S/ ${total.toFixed(2)}</span>
                </div>
            </div>

            <div class="border-t border-dashed border-black/40 my-3"></div>

            <div class="text-center text-[10px] uppercase leading-tight space-y-0.5 select-none">
                <p class="font-extrabold">¡MUCHAS GRACIAS POR SU PREFERENCIA!</p>
                <p class="text-[8px] text-black/70 italic">Conserve su comprobante para cualquier reclamo</p>
                <p class="text-[8px] text-black/40 mt-1">Buchisapa POS Printer Thermal v2.0</p>
            </div>
        `;
    }

    const container = document.getElementById('pos-ticket-paper');
    if (container) {
        container.innerHTML = markup;
    }
}

function cerrarTicketModal() {
    const modal = document.getElementById('ticket-modal-container');
    if (modal) modal.classList.add('hidden');
}

function imprimirTicketDirecto() {
    window.print();
}

function compartirTicketWhatsApp() {
    if (!pedidoImpresionActivo) return;
    const o = pedidoImpresionActivo;
    const ticketCode = getFormattedTicketCode(o);
    const rawNum = typeof o.orderNumber === 'number' ? o.orderNumber : (parseInt(String(o.orderNumber || o.id).replace(/\D/g, ''), 10) || 1);

    let items = [];
    if (typeof o.items === 'string') {
        try { items = JSON.parse(o.items || '[]'); } catch(e) {}
    } else if (Array.isArray(o.items)) {
        items = o.items;
    }

    let itemsText = items.map(it => `• ${it.quantity || it.cant || 1}x ${it.name || it.nombre} - S/ ${( (it.quantity || 1) * parseFloat(it.price || 0) ).toFixed(2)}`).join('\n');

    const msg = `🧾 *COMPROBANTE DE COMPRA - BUCHISAPA*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🔖 *Ticket:* ${ticketCode} (Orden #${rawNum})\n` +
        `👤 *Cliente:* ${o.customerName || 'Cliente'}\n` +
        `📍 *Tipo:* ${(o.orderType || 'Delivery').toUpperCase()}\n` +
        `💳 *Método de Pago:* ${o.paymentMethod || 'Yape'}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 *Detalle del Pedido:*\n${itemsText}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *TOTAL A PAGAR:* S/ ${parseFloat(o.total || 0).toFixed(2)}\n\n` +
        `¡Gracias por tu compra en Buchisapa! 🔥🍗`;

    const phone = (o.customerPhone || '').replace(/\D/g, '');
    const cleanPhone = phone ? (phone.startsWith('51') ? phone : `51${phone}`) : '';
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

async function eliminarTicketAjax(id) {
    if (!id) return;

    try {
        await fetch(`/api/tickets/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });
    } catch (err) {
        console.error("Error al eliminar ticket:", err);
    }

    allTicketsData = allTicketsData.filter(t => t.id !== id && String(t.orderNumber) !== id);
    actualizarMetricasTickets(allTicketsData);
    renderTicketsTable();
}

/**
 * ============================================================================
 * MODAL DE EMISIÓN RÁPIDA DE TICKET POS
 * ============================================================================
 */
async function abrirModalEmitirTicketRapido() {
    quickTicketSelectedItems = {};

    try {
        if (availableProductsCache.length === 0) {
            const res = await fetch('/api/products').then(r => r.json()).catch(() => ({ data: [] }));
            availableProductsCache = res.data || [];
        }
    } catch (e) {
        console.error("Error cargando productos para ticket rápido:", e);
    }

    renderQuickTicketProductsList();
    actualizarQuickTicketTotal();

    const modal = document.getElementById('quick-ticket-modal');
    if (modal) modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function cerrarModalEmitirTicketRapido() {
    const modal = document.getElementById('quick-ticket-modal');
    if (modal) modal.classList.add('hidden');
}

function actualizarCamposTipoAtencion(type) {
    const label = document.getElementById('quick-address-label');
    const input = document.getElementById('quick-customer-address');
    if (!label || !input) return;

    if (type === 'salon') {
        label.textContent = 'N° de Mesa / Salón';
        input.placeholder = 'Ej: Mesa 3';
        input.value = 'Mesa 1';
    } else if (type === 'delivery') {
        label.textContent = 'Dirección de Entrega';
        input.placeholder = 'Ej: Av. Gran Chimú 450, Santa Clara';
        input.value = '';
    } else {
        label.textContent = 'Referencia / Mostrador';
        input.placeholder = 'Ej: Recojo en caja';
        input.value = 'Mostrador';
    }
}

function renderQuickTicketProductsList() {
    const container = document.getElementById('quick-ticket-products-list');
    if (!container) return;

    if (availableProductsCache.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-xs text-slate-500 py-4">No hay platos en carta.</div>';
        return;
    }

    let html = '';
    availableProductsCache.forEach(p => {
        const id = p.id || '';
        const name = p.name || 'Plato';
        const price = parseFloat(p.price || 0);
        const qty = quickTicketSelectedItems[id] ? quickTicketSelectedItems[id].quantity : 0;

        html += `
        <div class="flex items-center justify-between p-2 rounded-lg bg-[#111728] border border-slate-800/80 hover:border-slate-700 transition-all">
            <div class="min-w-0 pr-2">
                <span class="block text-xs font-bold text-white truncate">${name}</span>
                <span class="block text-[10px] text-emerald-400 font-mono font-black">S/ ${price.toFixed(2)}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <button type="button" onclick="ajustarCantidadPlatoTicketRapido('${id}', -1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center transition-all">
                    -
                </button>
                <span class="w-5 text-center text-xs font-mono font-black text-orange-400" id="quick-qty-${id}">${qty}</span>
                <button type="button" onclick="ajustarCantidadPlatoTicketRapido('${id}', 1)" class="w-6 h-6 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center transition-all">
                    +
                </button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function ajustarCantidadPlatoTicketRapido(productId, delta) {
    const product = availableProductsCache.find(p => p.id === productId);
    if (!product) return;

    const current = quickTicketSelectedItems[productId] ? quickTicketSelectedItems[productId].quantity : 0;
    const next = Math.max(0, current + delta);

    if (next > 0) {
        quickTicketSelectedItems[productId] = {
            product,
            quantity: next
        };
    } else {
        delete quickTicketSelectedItems[productId];
    }

    const qtySpan = document.getElementById(`quick-qty-${productId}`);
    if (qtySpan) qtySpan.textContent = next;

    actualizarQuickTicketTotal();
}

function actualizarQuickTicketTotal() {
    let total = 0;
    Object.values(quickTicketSelectedItems).forEach(item => {
        const price = parseFloat(item.product.price || 0);
        total += item.quantity * price;
    });

    const display = document.getElementById('quick-ticket-total-display');
    if (display) display.textContent = `S/ ${total.toFixed(2)}`;
}

async function guardarEmitirTicketRapido() {
    const customerName = (document.getElementById('quick-customer-name')?.value || '').trim() || 'Cliente Mostrador';
    const customerPhone = (document.getElementById('quick-customer-phone')?.value || '').trim();
    const orderType = document.getElementById('quick-order-type')?.value || 'salon';
    const deliveryAddress = (document.getElementById('quick-customer-address')?.value || '').trim();
    const paymentMethod = document.getElementById('quick-payment-method')?.value || 'Yape';
    const notes = (document.getElementById('quick-order-notes')?.value || '').trim();

    const selectedKeys = Object.keys(quickTicketSelectedItems);
    if (selectedKeys.length === 0) {
        alert('Por favor selecciona al menos 1 plato para emitir el ticket.');
        return;
    }

    const items = selectedKeys.map(k => {
        const entry = quickTicketSelectedItems[k];
        return {
            name: entry.product.name,
            quantity: entry.quantity,
            price: parseFloat(entry.product.price || 0),
            customization: {
                notes: notes
            }
        };
    });

    let total = 0;
    items.forEach(it => total += it.quantity * it.price);

    const ticketPayload = {
        customerName,
        customerPhone,
        orderType,
        deliveryAddress,
        paymentMethod,
        items,
        subtotal: total,
        total,
        status: 'pagado'
    };

    try {
        const res = await fetch('/api/admin/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(ticketPayload)
        }).then(r => r.json());

        const createdTicket = res.data || { 
            ...ticketPayload, 
            id: `tk-${Date.now()}`, 
            orderNumber: allTicketsData.length + 1,
            ticketNumber: `TK${String(allTicketsData.length + 1).padStart(6, '0')}`
        };

        cerrarModalEmitirTicketRapido();
        await initTicketView();

        // Abrir inmediatamente la previsualización del ticket emitido
        abrirGeneradorTicket(createdTicket, 'boleta');

    } catch (err) {
        console.error("Error guardando ticket rápido:", err);
    }
}
