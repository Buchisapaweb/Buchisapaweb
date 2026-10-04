/**
 * BUCHISAPA BURGER & BROASTER - PORTADAS MODULE JS
 * admin/js/portadas.js
 */

console.log("🖼️ Portadas Module Initialized");

var activePortadasList = [];
var simulatorCurrentIdx = 0;
var simulatorTimer = null;
var simulatorMode = 'desktop'; // 'desktop' (16:9) | 'mobile' (4:5)
var currentEditorTargetType = 'general'; // 'general' | 'desktop' | 'mobile'

document.addEventListener('DOMContentLoaded', () => {
    initPortadasView();
});

/**
 * Carga inicial de portadas desde la API
 */
async function initPortadasView() {
    const grid = document.getElementById('portadas-grid-container');
    const counter = document.getElementById('portadas-counter-text');
    if (!grid) return;

    if (counter) counter.textContent = 'Cargando portadas...';

    try {
        const res = await fetch('/api/portadas?all=true').then(r => r.json()).catch(() => ({ data: [] }));
        const list = Array.isArray(res.data) ? res.data : [];

        // Ordenar por campo order ascendente
        list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        activePortadasList = list;

        actualizarMetricasPortadas(activePortadasList);
        renderPortadasGridDOM(activePortadasList);
        iniciarSimuladorCarrusel(activePortadasList);

        if (counter) counter.textContent = `${activePortadasList.length} portadas configuradas`;
    } catch (err) {
        console.error("Error al cargar portadas:", err);
        if (counter) counter.textContent = 'Error al cargar portadas';
    }
}

function getFormattedPortadaCode(p, idx) {
    if (p && p.id && /^(PT|PO)\d+$/i.test(p.id)) {
        return p.id.toUpperCase().replace('PO', 'PT');
    }
    const num = Number(p?.order) || (idx !== undefined ? idx + 1 : 1);
    return `PT${String(num).padStart(3, '0')}`;
}

function actualizarMetricasPortadas(list) {
    const totalEl = document.getElementById('stat-total-portadas');
    const activasEl = document.getElementById('stat-activas-portadas');

    const total = list.length;
    const activas = list.filter(p => p.active !== false).length;

    if (totalEl) totalEl.textContent = `${total} portadas`;
    if (activasEl) activasEl.textContent = `${activas} activas`;
}

/**
 * Renderizado de las Tarjetas de Portadas
 */
function renderPortadasGridDOM(list) {
    const container = document.getElementById('portadas-grid-container');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-10 text-center text-slate-500 font-semibold bg-[#111728] rounded-3xl border border-slate-800/90 shadow-lg">
                <i data-lucide="image" class="w-12 h-12 text-slate-600 mx-auto mb-3"></i>
                <p class="text-sm text-slate-300 font-bold">No hay portadas registradas en el carrusel aún.</p>
                <p class="text-xs text-slate-500 mt-1">Crea tu primera portada con imágenes en 1920x1080 y 1080x1350.</p>
                <button type="button" onclick="abrirCrearPortadaView()" class="mt-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/25 transition-all">
                    + Crear Primera Portada
                </button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let html = '';
    list.forEach((p, idx) => {
        const codeStr = getFormattedPortadaCode(p, idx);
        const id = p.id || codeStr;
        const title = p.title || `Portada ${codeStr}`;
        const desktopImg = p.image || `/imagenes/portada/Portada${idx + 1}E.webp`;
        const mobileImg = p.imageMobile || `/imagenes/portada/Portada${idx + 1}M.webp`;
        const active = p.active !== false;

        const pJsonStr = JSON.stringify(p).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

        html += `
        <div class="bg-[#111728] border ${active ? 'border-slate-800/90' : 'border-slate-800/40 opacity-70'} rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-xl relative overflow-hidden group">
            <div class="space-y-3.5">
                <!-- Header con Número de Slide (ID: PT001) y Switch de Activación -->
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-mono font-black px-3 py-1 rounded-xl ${active ? 'bg-orange-950/70 border border-orange-500/40 text-orange-400' : 'bg-slate-800 text-slate-400'}">
                        ID: ${codeStr}
                    </span>

                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black uppercase ${active ? 'text-emerald-400' : 'text-slate-500'}">
                            ${active ? 'Publicado' : 'Oculto'}
                        </span>
                        <label class="relative inline-flex items-center cursor-pointer select-none">
                            <input type="checkbox" onchange="togglePortadaActive('${id}', this.checked)" ${active ? 'checked' : ''} class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                </div>

                <!-- Doble Preview: Escritorio (16:9) y Móvil (4:5) sin textos sobrepuestos -->
                <div class="grid grid-cols-3 gap-2">
                    <!-- Preview Desktop 16:9 (Ocupa 2 columnas) -->
                    <div class="col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 bg-black group/img">
                        <img src="${desktopImg}" alt="Portada ${codeStr} Desktop" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" onerror="this.src='/imagenes/portada/Portada1E.webp'">
                        <span class="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[9px] font-mono text-amber-300 font-bold">
                            🖥️ 16:9
                        </span>
                    </div>

                    <!-- Preview Móvil 4:5 (Ocupa 1 columna) -->
                    <div class="col-span-1 relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-800 bg-black group/img">
                        <img src="${mobileImg}" alt="Portada ${codeStr} Mobile" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" onerror="this.src='/imagenes/portada/Portada1M.webp'">
                        <span class="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[9px] font-mono text-cyan-300 font-bold">
                            📱 4:5
                        </span>
                    </div>
                </div>
            </div>

            <!-- Acciones Inferiores -->
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                <div class="flex items-center gap-1.5">
                    <button type="button" onclick="moverOrdenPortada('${id}', -1)" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-all active-press" title="Subir orden">
                        <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
                    </button>
                    <button type="button" onclick="moverOrdenPortada('${id}', 1)" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-all active-press" title="Bajar orden">
                        <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <button type="button" onclick='abrirEditarPortadaView(${pJsonStr})' class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border border-slate-700/60 active-press">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5 text-orange-400"></i>
                        <span>Editar</span>
                    </button>
                    <button type="button" onclick="eliminarPortadaAjax('${id}')" class="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all active-press" title="Eliminar Portada">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Simulador de Carrusel en Vivo
 */
function iniciarSimuladorCarrusel(list) {
    if (simulatorTimer) clearInterval(simulatorTimer);
    const activeList = list.filter(p => p.active !== false);
    if (activeList.length === 0) return;

    const dotsContainer = document.getElementById('simulator-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = activeList.map((_, i) => `
            <span onclick="irASimuladorSlide(${i})" class="w-2 h-2 rounded-full cursor-pointer transition-all ${i === 0 ? 'bg-orange-500 w-5' : 'bg-white/40'}"></span>
        `).join('');
    }

    actualizarSimuladorSlide(0);

    if (activeList.length > 1) {
        simulatorTimer = setInterval(() => {
            const currentActiveList = activePortadasList.filter(p => p.active !== false);
            if (currentActiveList.length > 0) {
                simulatorCurrentIdx = (simulatorCurrentIdx + 1) % currentActiveList.length;
                actualizarSimuladorSlide(simulatorCurrentIdx);
            }
        }, 4500);
    }
}

function irASimuladorSlide(idx) {
    simulatorCurrentIdx = idx;
    actualizarSimuladorSlide(idx);
}

function cambiarModoSimulador(mode) {
    simulatorMode = mode;
    const btnDesk = document.getElementById('sim-toggle-desktop');
    const btnMob = document.getElementById('sim-toggle-mobile');
    const stage = document.getElementById('sim-stage-container');

    if (mode === 'desktop') {
        if (btnDesk) {
            btnDesk.className = 'h-9 px-3 rounded-xl text-[11px] sm:text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 w-full transition-all cursor-pointer';
        }
        if (btnMob) {
            btnMob.className = 'h-9 px-3 rounded-xl text-[11px] sm:text-xs font-extrabold text-slate-400 hover:text-white bg-transparent flex items-center justify-center gap-1.5 w-full transition-all cursor-pointer';
        }
        if (stage) {
            stage.className = 'relative transition-all duration-300 w-full max-w-[920px] aspect-[16/9] px-3 sm:px-4 py-2';
        }
    } else {
        if (btnDesk) {
            btnDesk.className = 'h-9 px-3 rounded-xl text-[11px] sm:text-xs font-extrabold text-slate-400 hover:text-white bg-transparent flex items-center justify-center gap-1.5 w-full transition-all cursor-pointer';
        }
        if (btnMob) {
            btnMob.className = 'h-9 px-3 rounded-xl text-[11px] sm:text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 w-full transition-all cursor-pointer';
        }
        if (stage) {
            stage.className = 'relative transition-all duration-300 w-full max-w-[340px] aspect-[4/5] px-3 py-2';
        }
    }

    actualizarSimuladorSlide(simulatorCurrentIdx);
}

function actualizarSimuladorSlide(idx) {
    const activeList = activePortadasList.filter(p => p.active !== false);
    if (activeList.length === 0 || !activeList[idx]) return;

    const item = activeList[idx];
    const imgEl = document.getElementById('simulator-preview-img');

    if (imgEl) {
        imgEl.style.opacity = '0.5';
        setTimeout(() => {
            if (simulatorMode === 'mobile') {
                imgEl.src = item.imageMobile || item.image || `/imagenes/portada/Portada1M.webp`;
            } else {
                imgEl.src = item.image || `/imagenes/portada/Portada1E.webp`;
            }
            imgEl.style.opacity = '1';
        }, 120);
    }

    const dots = document.querySelectorAll('#simulator-dots span');
    dots.forEach((dot, i) => {
        if (i === idx) {
            dot.className = 'w-5 h-2 rounded-full bg-orange-500 transition-all';
        } else {
            dot.className = 'w-2 h-2 rounded-full bg-white/40 transition-all';
        }
    });
}

/**
 * ============================================================================
 * CONTROL DEL FORMULARIO DEDICADO EN PÁGINA PROPIA (DESLIZAMIENTO NORMAL)
 * ============================================================================
 */
function abrirCrearPortadaView() {
    const listView = document.getElementById('portadas-list-view');
    const editorView = document.getElementById('portada-editor-view');
    if (!listView || !editorView) return;

    const nextOrder = activePortadasList.length + 1;
    const codeStr = getFormattedPortadaCode({ order: nextOrder });

    document.getElementById('editor-title-header').textContent = 'Crear Portada';
    document.getElementById('editor-portada-id').value = '';
    const codeInputCrear = document.getElementById('editor-portada-code-input');
    if (codeInputCrear) codeInputCrear.value = codeStr;
    document.getElementById('editor-title-input').value = `Portada ${codeStr}`;
    document.getElementById('editor-order-input').value = nextOrder;
    document.getElementById('editor-active-input').checked = true;

    const slideNum = (activePortadasList.length % 5) + 1;
    const defaultDesk = `/imagenes/portada/Portada${slideNum}E.webp`;
    const defaultMob = `/imagenes/portada/Portada${slideNum}M.webp`;

    setEditorDesktopPhoto(defaultDesk);
    setEditorMobilePhoto(defaultMob);

    // Configurar tipo de creación por defecto: General (ambas)
    cambiarTipoObjetivoPortada('general');
    const radGeneral = document.querySelector('input[name="portada-target-type"][value="general"]');
    if (radGeneral) radGeneral.checked = true;

    const btnDel = document.getElementById('btn-eliminar-editor-view');
    if (btnDel) btnDel.classList.add('hidden');

    listView.classList.add('hidden');
    editorView.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function abrirEditarPortadaView(p) {
    if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch(e){}
    }

    const listView = document.getElementById('portadas-list-view');
    const editorView = document.getElementById('portada-editor-view');
    if (!listView || !editorView) return;

    const codeStr = getFormattedPortadaCode(p);

    document.getElementById('editor-title-header').textContent = 'Editar Portada';
    document.getElementById('editor-portada-id').value = p.id || '';
    const codeInputEdit = document.getElementById('editor-portada-code-input');
    if (codeInputEdit) codeInputEdit.value = codeStr;
    document.getElementById('editor-title-input').value = p.title || `Portada ${codeStr}`;
    document.getElementById('editor-order-input').value = p.order || 1;
    document.getElementById('editor-active-input').checked = p.active !== false;

    const initialDesk = p.image || `/imagenes/portada/Portada1E.webp`;
    const initialMob = p.imageMobile || `/imagenes/portada/Portada1M.webp`;

    setEditorDesktopPhoto(initialDesk);
    setEditorMobilePhoto(initialMob);

    cambiarTipoObjetivoPortada('general');
    const radGeneral = document.querySelector('input[name="portada-target-type"][value="general"]');
    if (radGeneral) radGeneral.checked = true;

    const btnDel = document.getElementById('btn-eliminar-editor-view');
    if (btnDel) btnDel.classList.remove('hidden');

    listView.classList.add('hidden');
    editorView.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function cancelarEditorPortada() {
    const listView = document.getElementById('portadas-list-view');
    const editorView = document.getElementById('portada-editor-view');
    if (!listView || !editorView) return;

    editorView.classList.add('hidden');
    listView.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cambiarTipoObjetivoPortada(type) {
    currentEditorTargetType = type;

    const boxDesk = document.getElementById('box-upload-desktop');
    const boxMob = document.getElementById('box-upload-mobile');

    document.querySelectorAll('.portada-type-label').forEach(lbl => {
        lbl.classList.remove('border-orange-500', 'bg-orange-950/20');
    });

    const activeLbl = document.getElementById(`label-type-${type}`);
    if (activeLbl) {
        activeLbl.classList.add('border-orange-500', 'bg-orange-950/20');
    }

    if (type === 'general') {
        if (boxDesk) boxDesk.classList.remove('hidden');
        if (boxMob) boxMob.classList.remove('hidden');
    } else if (type === 'desktop') {
        if (boxDesk) boxDesk.classList.remove('hidden');
        if (boxMob) boxMob.classList.add('hidden');
    } else if (type === 'mobile') {
        if (boxDesk) boxDesk.classList.add('hidden');
        if (boxMob) boxMob.classList.remove('hidden');
    }
}

function setEditorDesktopPhoto(src) {
    const preview = document.getElementById('editor-preview-desktop-img');
    const val = document.getElementById('editor-image-desktop-val');
    if (preview) preview.src = src;
    if (val) val.value = src;
}

function setEditorMobilePhoto(src) {
    const preview = document.getElementById('editor-preview-mobile-img');
    const val = document.getElementById('editor-image-mobile-val');
    if (preview) preview.src = src;
    if (val) val.value = src;
}

async function handleDesktopFileInput(input) {
    if (!input.files || !input.files[0]) return;
    // Conversión cliente a WebP HD 1920x1080
    const webpBase64 = await convertImageFileToWebP(input.files[0], 1920, 1080, 0.88);
    if (webpBase64) {
        setEditorDesktopPhoto(webpBase64);
    }
}

async function handleMobileFileInput(input) {
    if (!input.files || !input.files[0]) return;
    // Conversión cliente a WebP Móvil 1080x1350
    const webpBase64 = await convertImageFileToWebP(input.files[0], 1080, 1350, 0.88);
    if (webpBase64) {
        setEditorMobilePhoto(webpBase64);
    }
}

function handleDesktopUrlInput(url) {
    const clean = (url || '').trim();
    if (clean) setEditorDesktopPhoto(clean);
}

function handleMobileUrlInput(url) {
    const clean = (url || '').trim();
    if (clean) setEditorMobilePhoto(clean);
}

/**
 * Convierte cualquier formato de imagen a Base64 WebP de alta fidelidad
 */
function convertImageFileToWebP(file, targetWidth = 1920, targetHeight = 1080, quality = 0.88) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let w = img.width;
                let h = img.height;

                // Escalar manteniendo proporción sin sobrepasar dimensiones máximas
                if (w > targetWidth || h > targetHeight) {
                    const ratio = Math.min(targetWidth / w, targetHeight / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, w, h);
                    const webpDataUrl = canvas.toDataURL('image/webp', quality);
                    resolve(webpDataUrl);
                } else {
                    resolve(e.target?.result);
                }
            };
            img.onerror = () => resolve(e.target?.result);
            img.src = e.target?.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

/**
 * Guardar o Actualizar Portada desde el Formulario Dedicado
 */
async function guardarPortadaFormulario() {
    const id = document.getElementById('editor-portada-id')?.value || '';
    const orderInputVal = document.getElementById('editor-order-input')?.value;
    const order = parseInt(orderInputVal || String(activePortadasList.length + 1), 10);
    const codeStr = id ? id.toUpperCase().replace('PO', 'PT') : `PT${String(order).padStart(3, '0')}`;
    const title = (document.getElementById('editor-title-input')?.value || '').trim() || `Portada ${codeStr}`;
    const active = document.getElementById('editor-active-input')?.checked !== false;

    let imageDesktop = document.getElementById('editor-image-desktop-val')?.value || `/imagenes/portada/Portada${order}E.webp`;
    let imageMobile = document.getElementById('editor-image-mobile-val')?.value || `/imagenes/portada/Portada${order}M.webp`;

    // Si se eligió solo escritorio o solo móvil, sincronizar la otra para fallback
    if (currentEditorTargetType === 'desktop') {
        if (!imageMobile) imageMobile = imageDesktop;
    } else if (currentEditorTargetType === 'mobile') {
        if (!imageDesktop) imageDesktop = imageMobile;
    }

    const payload = {
        id: codeStr,
        title,
        order,
        active,
        image: imageDesktop,
        imageMobile: imageMobile
    };

    try {
        if (id) {
            await fetch(`/api/portadas/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            await fetch('/api/portadas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        cancelarEditorPortada();
        await initPortadasView();

    } catch (err) {
        console.error("Error guardando portada:", err);
    }
}

/**
 * Toggle instantáneo de estado activo/inactivo
 */
async function togglePortadaActive(id, newState) {
    const item = activePortadasList.find(p => p.id === id);
    if (!item) return;

    item.active = newState;

    try {
        await fetch(`/api/portadas/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ active: newState })
        });
    } catch (err) {
        console.error("Error actualizando estado de portada:", err);
    }

    actualizarMetricasPortadas(activePortadasList);
    iniciarSimuladorCarrusel(activePortadasList);
}

/**
 * Mover orden / posición del banner
 */
async function moverOrdenPortada(id, delta) {
    const idx = activePortadasList.findIndex(p => p.id === id);
    if (idx === -1) return;

    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= activePortadasList.length) return;

    const itemA = activePortadasList[idx];
    const itemB = activePortadasList[targetIdx];

    const tempOrder = itemA.order;
    itemA.order = itemB.order;
    itemB.order = tempOrder;

    try {
        await Promise.all([
            fetch(`/api/portadas/${encodeURIComponent(itemA.id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: itemA.order })
            }),
            fetch(`/api/portadas/${encodeURIComponent(itemB.id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: itemB.order })
            })
        ]);
    } catch (err) {}

    await initPortadasView();
}

/**
 * Eliminar Portada
 */
async function eliminarPortadaAjax(id) {
    if (!id) return;

    activePortadasList = activePortadasList.filter(p => p.id !== id);

    try {
        await fetch(`/api/portadas/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });
    } catch (err) {
        console.error("Error eliminando portada:", err);
    }

    cancelarEditorPortada();
    await initPortadasView();
}

function eliminarPortadaDesdeEditor() {
    const id = document.getElementById('editor-portada-id')?.value;
    if (id) eliminarPortadaAjax(id);
}
