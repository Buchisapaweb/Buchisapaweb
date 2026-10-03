/**
 * BUCHISAPA BURGER & BROASTER - PEDIDOS MODULE JS
 * admin/js/pedidos.js
 */

console.log("📦 Pedidos & KDS Module Initialized");

// Mantener estado del modo de vista actual en localStorage para recordar preferencia
var activeDesktopView = (typeof window !== 'undefined' && window.activeDesktopView) ? window.activeDesktopView : (localStorage.getItem('buchisapa_desktop_view') || 'table');

document.addEventListener('DOMContentLoaded', () => {
    applyDesktopView(activeDesktopView);
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
    } else {
        btns.forEach(b => {
            const clickAttr = b.getAttribute('onclick') || '';
            if (clickAttr.includes(`'${status}'`) || clickAttr.includes(`"${status}"`)) {
                b.classList.add('active');
            }
        });
    }

    // Filtrar filas de tabla (Desktop)
    const rows = document.querySelectorAll('.order-row');
    rows.forEach(r => {
        r.classList.toggle('hidden', status !== 'all' && r.getAttribute('data-status') !== status);
    });

    // Filtrar tarjetas comanda en móviles
    const mobileRows = document.querySelectorAll('.order-row-mobile');
    mobileRows.forEach(r => {
        r.classList.toggle('hidden', status !== 'all' && r.getAttribute('data-status') !== status);
    });
}

/**
 * Filter orders list by status client-side (for standard listing fallback)
 */
function filterOrdersByStatus(status) {
    const rows = document.querySelectorAll('.desktop-pedido-row');
    rows.forEach(row => {
        row.style.display = (status === 'all' || row.dataset.status === status) ? '' : 'none';
    });
}
