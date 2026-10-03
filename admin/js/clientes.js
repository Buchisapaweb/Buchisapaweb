/**
 * BUCHISAPA BURGER & BROASTER - CLIENTES MODULE JS
 * admin/js/clientes.js
 */

console.log("👥 Clientes Module Initialized");

document.addEventListener('DOMContentLoaded', () => {
    initClientesView();
});

async function initClientesView() {
    const tbody = document.getElementById('clientes-tbody');
    const mobileList = document.getElementById('clientes-mobile-list');
    const badge = document.getElementById('total-clientes-badge');

    if (!tbody) return;

    try {
        const res = await fetch('/api/profiles').then(r => r.json()).catch(() => ({ data: [] }));
        const clients = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (badge) badge.textContent = `${clients.length} perfiles`;

        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500 font-semibold">No se encontraron clientes registrados.</td></tr>';
            if (mobileList) mobileList.innerHTML = '<div class="p-8 text-center text-slate-500 font-semibold bg-[#121829] rounded-2xl border border-slate-800">No hay clientes.</div>';
            return;
        }

        let html = '';
        let mobHtml = '';

        clients.forEach(c => {
            const name = c.name || 'Usuario Sin Nombre';
            const phone = c.phone || 'Sin teléfono';
            const email = c.email || 'Sin correo';
            const docType = c.docType || 'DNI';
            const docNum = c.docNumber || 'No especificado';
            const rawDate = c.created_at || c.createdAt || new Date().toISOString();
            const dateStr = new Date(rawDate).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

            html += `
            <tr class="desktop-cliente-row hover:bg-slate-800/20 transition-colors">
                <td class="p-4 font-mono font-bold text-slate-400">${docType} : ${docNum}</td>
                <td class="p-4"><span class="font-extrabold text-sm text-white block">${name}</span></td>
                <td class="p-4 font-mono text-slate-300">${phone}</td>
                <td class="p-4 font-mono text-slate-400 font-medium">${email}</td>
                <td class="p-4 text-slate-500 font-mono">${dateStr}</td>
            </tr>`;

            mobHtml += `
            <div class="mobile-cliente-card bg-[#121829] p-4 rounded-xl border border-slate-800 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-mono font-bold text-orange-400">${docType}: ${docNum}</span>
                    <span class="text-[10px] text-slate-500">${dateStr}</span>
                </div>
                <p class="font-bold text-white text-sm">${name}</p>
                <p class="text-xs text-slate-400">${phone} • ${email}</p>
            </div>`;
        });

        tbody.innerHTML = html;
        if (mobileList) mobileList.innerHTML = mobHtml;

    } catch(e) {
        console.error('Error cargando clientes:', e);
    }
}

function filterClientesTable() {
    const input = document.getElementById('clientes-search');
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    
    const desktopRows = document.querySelectorAll('.desktop-cliente-row');
    desktopRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });

    const mobileCards = document.querySelectorAll('.mobile-cliente-card');
    mobileCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(filter) ? '' : 'none';
    });
}
