/**
 * BUCHISAPA BURGER & BROASTER - CLIENTES MODULE JS
 * admin/js/clientes.js
 */

console.log("👥 Clientes Module Initialized");

/**
 * Filter customers table rows in real-time (Desktop & Mobile)
 */
function filterClientesTable() {
    const input = document.getElementById('clientes-search');
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    
    // Filter desktop rows
    const desktopRows = document.querySelectorAll('.desktop-cliente-row');
    desktopRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });

    // Filter mobile cards
    const mobileCards = document.querySelectorAll('.mobile-cliente-card');
    mobileCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(filter) ? '' : 'none';
    });
}
