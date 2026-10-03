/**
 * BUCHISAPA BURGER & BROASTER - PEDIDOS MODULE JS
 * admin/js/pedidos.js
 */

console.log("📦 Pedidos & KDS Module Initialized");

// Mantener estado del modo de vista actual en localStorage para recordar preferencia
let activeDesktopView = localStorage.getItem('buchisapa_desktop_view') || 'table';

document.addEventListener('DOMContentLoaded', () => {
    // Restaurar preferencia guardada
    applyDesktopView(activeDesktopView);
});

function toggleDesktopView(mode) {
    activeDesktopView = mode;
    localStorage.setItem('buchisapa_desktop_view', mode);
    applyDesktopView(mode);
}

function applyDesktopView(mode) {
    const tableDiv = document.getElementById('desktop-table-card');
    const kanbanDiv = document.getElementById('desktop-kanban-board');
    const btnTable = document.getElementById('btn-view-table');
    const btnKanban = document.getElementById('btn-view-kanban');
    
    if (!tableDiv || !kanbanDiv) return;
    
    if (mode === 'table') {
        tableDiv.classList.remove('hidden');
        kanbanDiv.classList.add('hidden');
        
        // Actualizar estados visuales de los botones con diseño Premium
        if (btnTable) btnTable.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-white bg-slate-800 flex items-center gap-1.5 active-press shadow-sm";
        if (btnKanban) btnKanban.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5 active-press";
    } else {
        tableDiv.classList.add('hidden');
        kanbanDiv.classList.remove('hidden');
        
        if (btnTable) btnTable.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-slate-400 hover:text-white flex items-center gap-1.5 active-press";
        if (btnKanban) btnKanban.className = "px-3.5 py-1.5 rounded-lg font-bold transition-all text-white bg-slate-800 flex items-center gap-1.5 active-press shadow-sm";
    }
}

function filterPHPOrders(status, btnElement) {
    const btns = document.querySelectorAll('.order-php-btn');
    btns.forEach(b => {
        b.className = "order-php-btn px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active-press";
    });
    
    const clickedBtn = btnElement || (window.event ? window.event.currentTarget || window.event.target : null);
    if (clickedBtn && clickedBtn.classList && clickedBtn.classList.contains('order-php-btn')) {
        clickedBtn.className = "order-php-btn px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow shrink-0 active-press";
    } else {
        // Fallback: Highlight button based on attribute content matching the status
        btns.forEach(b => {
            const clickAttr = b.getAttribute('onclick') || '';
            if (clickAttr.includes(`'${status}'`) || clickAttr.includes(`"${status}"`)) {
                b.className = "order-php-btn px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow shrink-0 active-press";
            }
        });
    }

    // Filtrar filas de tabla (Desktop)
    const rows = document.querySelectorAll('.order-row');
    rows.forEach(r => {
        if (status === 'all' || r.getAttribute('data-status') === status) {
            r.classList.remove('hidden');
        } else {
            r.classList.add('hidden');
        }
    });

    // Filtrar tarjetas comanda en móviles
    const mobileRows = document.querySelectorAll('.order-row-mobile');
    mobileRows.forEach(r => {
        if (status === 'all' || r.getAttribute('data-status') === status) {
            r.classList.remove('hidden');
        } else {
            r.classList.add('hidden');
        }
    });
}

/**
 * Filter orders list by status client-side (for standard listing fallback)
 */
function filterOrdersByStatus(status) {
    const rows = document.querySelectorAll('.desktop-pedido-row');
    rows.forEach(row => {
        if (status === 'all' || row.dataset.status === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
