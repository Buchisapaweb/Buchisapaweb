/**
 * BUCHISAPA BURGER & BROASTER - TICKET MODULE JS
 * admin/js/ticket.js
 */

console.log("🎫 Ticket Module Initialized");

var pedidoImpresionActivo = (typeof window !== 'undefined' && window.pedidoImpresionActivo) ? window.pedidoImpresionActivo : null;

document.addEventListener('DOMContentLoaded', () => {
    initTicketView();
});

async function initTicketView() {
    const tbody = document.getElementById('ticket-orders-tbody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/orders').then(r => r.json()).catch(() => ({ data: [] }));
        const orders = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-500 font-semibold select-none">No hay pedidos disponibles para emitir tickets.</td></tr>';
            return;
        }

        let html = '';
        orders.forEach(o => {
            const id = o.id;
            const orderNum = o.orderNumber || id;
            const name = o.customerName || 'Cliente';
            const phone = o.customerPhone || 'Sin teléfono';
            const total = Number(o.total || 0).toFixed(2);
            const type = o.orderType || 'Delivery';

            let items = [];
            if (typeof o.items === 'string') {
                try { items = JSON.parse(o.items); } catch(e) {}
            } else if (Array.isArray(o.items)) {
                items = o.items;
            }

            const itemsBrief = items.slice(0, 2).map(it => `${it.quantity || 1}x ${it.name || 'Plato'}`).join(', ') + (items.length > 2 ? '...' : '');
            const rawJson = JSON.stringify(o).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

            html += `
            <tr class="hover:bg-slate-800/20 transition-colors">
                <td class="p-4 font-mono font-black text-white">#${orderNum}</td>
                <td class="p-4">
                    <span class="block text-white font-extrabold">${name}</span>
                    <span class="block text-[10px] text-slate-500 font-mono mt-0.5">${phone}</span>
                </td>
                <td class="p-4 font-bold text-slate-400 max-w-xs truncate">${itemsBrief}</td>
                <td class="p-4 text-right font-black text-emerald-400 font-mono">S/ ${total}</td>
                <td class="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500 select-none">${type}</td>
                <td class="p-4 text-center">
                    <button onclick='abrirGeneradorTicket(${rawJson})' class="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto">
                        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                        <span>Ver Ticket POS</span>
                    </button>
                </td>
            </tr>`;
        });

        tbody.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch(e) {
        console.error('Error cargando pedidos para tickets:', e);
    }
}

function abrirGeneradorTicket(o) {
    pedidoImpresionActivo = o;
    let items = [];
    if (typeof o.items === 'string') {
        try { items = JSON.parse(o.items || '[]'); } catch(e) {}
    } else if (Array.isArray(o.items)) {
        items = o.items;
    }

    const orderNum = o.orderNumber || o.id || '';
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('es-PE', { hour12: true }) : new Date().toLocaleString('es-PE');
    
    let itemsRowsHtml = '';
    items.forEach(it => {
        const itemTotal = (it.quantity || 1) * parseFloat(it.price || 0);
        itemsRowsHtml += `
        <div class="flex justify-between items-start text-xs leading-tight mb-1">
            <span class="flex-1">${it.quantity || 1}x ${it.name}</span>
            <span class="ml-4 tabular-nums">S/ ${itemTotal.toFixed(2)}</span>
        </div>`;
    });

    const markup = `
        <div class="text-center pos-thermal-container">
            <h4 class="font-extrabold text-base tracking-wider uppercase">BUCHISAPA</h4>
            <p class="text-[10px] leading-tight uppercase mt-0.5">POLLERÍA & SABOR AMAZÓNICO</p>
            <p class="text-[9px] leading-tight mt-0.5">Av. La Estrella con Calle 28 de Julio</p>
            <p class="text-[9px] leading-tight">Santa Clara, Ate - Lima</p>
            <p class="text-[9px] leading-tight">Tlf: (01) 351-4829</p>
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div class="text-[10px] leading-snug space-y-0.5">
            <div><strong>TICKET DE COMPRA:</strong> #${orderNum}</div>
            <div><strong>FECHA:</strong> ${dateStr}</div>
            <div><strong>CLIENTE:</strong> ${o.customerName || 'Cliente General'}</div>
            <div><strong>TELÉFONO:</strong> ${o.customerPhone || 'Sin registrar'}</div>
            <div><strong>TIPO:</strong> ${o.orderType || 'Delivery'}</div>
            <div><strong>MÉTODO PAGO:</strong> ${o.paymentMethod || 'Yape'}</div>
            ${o.deliveryAddress || o.address ? `<div><strong>DIRECCIÓN:</strong> ${o.deliveryAddress || o.address}</div>` : ''}
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div>
            <div class="flex justify-between font-bold text-[10px] uppercase mb-1.5">
                <span>Platos / Combo</span>
                <span>Subtotal</span>
            </div>
            ${itemsRowsHtml}
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div class="text-xs space-y-1">
            <div class="flex justify-between font-extrabold text-sm">
                <span>TOTAL A PAGAR:</span>
                <span class="tabular-nums">S/ ${parseFloat(o.total || 0).toFixed(2)}</span>
            </div>
        </div>

        <div class="border-t border-dashed border-black/30 my-3"></div>

        <div class="text-center text-[10px] uppercase leading-tight space-y-0.5 select-none">
            <p class="font-bold">¡GRACIAS POR TU COMPRA!</p>
            <p class="text-[8px] text-black/60 italic">Sabor amazónico a la leña en tu mesa</p>
            <p class="text-[8px] text-black/40 mt-1.5">Buchisapa POS Printer v1.0</p>
        </div>
    `;

    const container = document.getElementById('pos-ticket-paper');
    if (container) {
        container.innerHTML = markup;
    }
    const modal = document.getElementById('ticket-modal-container');
    if (modal) {
        modal.classList.remove('hidden');
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function cerrarTicketModal() {
    const modal = document.getElementById('ticket-modal-container');
    if (modal) {
        modal.classList.add('hidden');
    }
}
