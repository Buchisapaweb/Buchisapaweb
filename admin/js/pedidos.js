/**
 * BUCHISAPA BURGER & BROASTER - PEDIDOS MODULE JS
 * admin/js/pedidos.js
 */

console.log("📦 Pedidos & KDS Module Initialized");

var activeDesktopView = (typeof window !== 'undefined' && window.activeDesktopView) ? window.activeDesktopView : (localStorage.getItem('buchisapa_desktop_view') || 'table');

document.addEventListener('DOMContentLoaded', () => {
    applyDesktopView(activeDesktopView);
    initPedidosView();
});

function toggleDesktopView(mode) {
    activeDesktopView = mode;
    try {
        localStorage.setItem('buchisapa_desktop_view', mode);
    } catch (e) {}
    applyDesktopView(mode);
}

function applyDesktopView(mode) {
    const tableDiv = document.getElementById('desktop-table-card');
    const kanbanDiv = document.getElementById('desktop-kanban-board');
    const btnTable = document.getElementById('btn-view-table');
    const btnKanban = document.getElementById('btn-view-kanban');
    
    if (!tableDiv || !kanbanDiv) return;
    
    const isTable = mode === 'table';
    tableDiv.classList.toggle('hidden', !isTable);
    kanbanDiv.classList.toggle('hidden', isTable);
    
    if (btnTable) btnTable.classList.toggle('active', isTable);
    if (btnKanban) btnKanban.classList.toggle('active', !isTable);
}

function filterPHPOrders(status, btnElement) {
    const btns = document.querySelectorAll('.order-tab-btn');
    btns.forEach(b => b.classList.remove('active'));
    
    const clickedBtn = btnElement || (window.event ? window.event.currentTarget || window.event.target : null);
    if (clickedBtn && clickedBtn.classList && clickedBtn.classList.contains('order-tab-btn')) {
        clickedBtn.classList.add('active');
    }

    const rows = document.querySelectorAll('.order-row');
    rows.forEach(r => {
        r.classList.toggle('hidden', status !== 'all' && r.getAttribute('data-status') !== status);
    });
}

async function updateOrderStatus(id, newStatus) {
    try {
        const res = await fetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        }).then(r => r.json());

        if (res.success || res.order) {
            initPedidosView();
        } else {
            alert('No se pudo actualizar el estado de la orden');
        }
    } catch(e) {
        console.error('Error al actualizar estado:', e);
    }
}

async function initPedidosView() {
    const tbody = document.getElementById('php-orders-tbody');
    const kanRecibido = document.getElementById('kanban-recibido');
    const kanPreparando = document.getElementById('kanban-preparando');
    const kanCamino = document.getElementById('kanban-en_camino');
    const kanEntregado = document.getElementById('kanban-entregado');

    if (!tbody) return;

    try {
        const res = await fetch('/api/orders').then(r => r.json()).catch(() => ({ data: [] }));
        const orders = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-slate-500 font-semibold">No hay órdenes registradas.</td></tr>';
            if (kanRecibido) kanRecibido.innerHTML = '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
            if (kanPreparando) kanPreparando.innerHTML = '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
            if (kanCamino) kanCamino.innerHTML = '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
            if (kanEntregado) kanEntregado.innerHTML = '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
            return;
        }

        let tableHtml = '';
        let htmlRec = '', htmlPrep = '', htmlCam = '', htmlEnt = '';

        orders.forEach(o => {
            const st = (o.status || 'recibido').toLowerCase();
            const id = o.id;
            const orderNum = o.orderNumber || id;
            const name = o.customerName || 'Cliente';
            const phone = o.customerPhone || 'Sin teléfono';
            const total = Number(o.total || 0).toFixed(2);
            const type = o.orderType || 'Delivery';
            const pay = o.paymentMethod || 'Yape';

            let itemsArr = [];
            if (typeof o.items === 'string') {
                try { itemsArr = JSON.parse(o.items); } catch(e) {}
            } else if (Array.isArray(o.items)) {
                itemsArr = o.items;
            }

            const itemsBrief = itemsArr.map(it => `${it.quantity || 1}x ${it.name || 'Plato'}`).join(', ');

            let actionBtn = '';
            if (st === 'recibido') {
                actionBtn = `<button onclick="updateOrderStatus('${id}', 'preparando')" class="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white rounded text-[10px] font-bold">Cocinar</button>`;
            } else if (st === 'preparando') {
                actionBtn = `<button onclick="updateOrderStatus('${id}', 'en_camino')" class="px-2 py-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white rounded text-[10px] font-bold">Despachar</button>`;
            } else if (st === 'en_camino') {
                actionBtn = `<button onclick="updateOrderStatus('${id}', 'entregado')" class="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold">Entregar</button>`;
            } else {
                actionBtn = `<span class="text-[10px] text-slate-500 font-bold">Entregado</span>`;
            }

            tableHtml += `
            <tr class="hover:bg-slate-800/20 transition-colors order-row" data-status="${st}">
                <td class="p-4 font-mono font-black text-white">#${orderNum}</td>
                <td class="p-4">
                    <span class="block text-white font-extrabold">${name}</span>
                    <span class="block text-[10px] text-slate-500 font-medium">${phone}</span>
                </td>
                <td class="p-4 text-xs text-slate-300 max-w-xs truncate">${itemsBrief}</td>
                <td class="p-4 text-right font-bold text-emerald-400 font-mono">S/ ${total}</td>
                <td class="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">${type}</td>
                <td class="p-4 text-[10px] font-medium text-slate-500 font-mono">${pay}</td>
                <td class="p-4"><span class="font-black text-[10px] uppercase tracking-wider text-orange-400">${st}</span></td>
                <td class="p-4 text-center">${actionBtn}</td>
            </tr>`;

            const kanbanCard = `
            <div class="bg-[#182035] p-3 rounded-xl border border-slate-800 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="font-mono font-bold text-xs text-white">#${orderNum}</span>
                    <span class="text-[10px] text-emerald-400 font-mono font-bold">S/ ${total}</span>
                </div>
                <p class="text-xs font-bold text-slate-200">${name}</p>
                <p class="text-[10px] text-slate-400 truncate">${itemsBrief}</p>
                <div class="pt-2 border-t border-slate-800 flex justify-end">
                    ${actionBtn}
                </div>
            </div>`;

            if (st === 'recibido') htmlRec += kanbanCard;
            else if (st === 'preparando') htmlPrep += kanbanCard;
            else if (st === 'en_camino') htmlCam += kanbanCard;
            else htmlEnt += kanbanCard;
        });

        tbody.innerHTML = tableHtml;
        if (kanRecibido) kanRecibido.innerHTML = htmlRec || '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
        if (kanPreparando) kanPreparando.innerHTML = htmlPrep || '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
        if (kanCamino) kanCamino.innerHTML = htmlCam || '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';
        if (kanEntregado) kanEntregado.innerHTML = htmlEnt || '<div class="text-xs text-slate-500 p-2">Sin pedidos</div>';

    } catch(e) {
        console.error('Error cargando pedidos:', e);
    }
}
