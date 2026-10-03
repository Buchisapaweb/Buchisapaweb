/**
 * BUCHISAPAWEB - Admin JS Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Setup Topbar Clock with smooth local tick rate
    const clock = document.getElementById('topbar-clock');
    if (clock) {
        setInterval(() => {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString('es-PE', { hour12: false });
        }, 1000);
    }

    // Auto-dismiss alert notifications after 4 seconds with slide/fade animation
    const flashMessages = document.querySelectorAll('.animate-fade-in');
    flashMessages.forEach(msg => {
        if (msg.id !== 'desktop-kanban-board') {
            setTimeout(() => {
                msg.style.opacity = '0';
                msg.style.transform = 'translateY(-10px)';
                msg.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => msg.remove(), 350);
            }, 4000);
        }
    });
});

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
 * Dynamic Audio Alert Cue
 * Plays a discrete, futuristic soft chime for positive interactions
 */
function playSoftAlert() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 Note
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 Note
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        // Fallback silently if audio context is blocked
    }
}

/**
 * HTML Modals Manager
 */
function openModalHtml(html) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (container && content) {
        content.innerHTML = `
            <button onclick="cerrarModalHtml()" class="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors active-press">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            ${html}
        `;
        container.classList.remove('hidden');
        playSoftAlert();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function cerrarModalHtml() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.classList.add('hidden');
    }
}

/**
 * Responsive Sidebar Drawer Controls
 */
function toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        const isHidden = sidebar.classList.contains('-translate-x-full');
        if (isHidden) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }
}
