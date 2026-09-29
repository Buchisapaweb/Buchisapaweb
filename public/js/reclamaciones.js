/**
 * RESTAURANTE BUCHISAPA - LIBRO DE RECLAMACIONES VIRTUAL (JS)
 * (public/js/reclamaciones.js)
 * Conforme al Código de Protección y Defensa del Consumidor - Ley N° 29571
 */

// Estado del archivo adjunto
let currentAttachedFile = null;
let lastSubmittedClaim = null;

// Inicialización de la fecha actual y eventos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  initRegistrationDate();
  initDateLimits();
});

function initRegistrationDate() {
  const dateEl = document.getElementById('claim-current-date');
  if (dateEl) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    dateEl.textContent = `${day}-${month}-${year}`;
  }
}

function initDateLimits() {
  const orderDateInput = document.getElementById('claim-order-date');
  if (orderDateInput) {
    const today = new Date().toISOString().split('T')[0];
    orderDateInput.max = today;
  }
}

// Contador en tiempo real para el pedido del reclamante
function handleTextareaCounter(textarea) {
  const counterEl = document.getElementById('claim-char-count');
  if (counterEl) {
    const count = (textarea.value || '').length;
    counterEl.textContent = `${count}/4000`;
    if (count > 3800) {
      counterEl.style.color = '#dc2626';
    } else {
      counterEl.style.color = '#94a3b8';
    }
  }
}

// Cambio de tipo de documento
function onDocTypeChange(docType) {
  const docNumInput = document.getElementById('claim-doc-num');
  if (!docNumInput) return;

  if (docType === 'DNI') {
    docNumInput.maxLength = 8;
    docNumInput.placeholder = '8 dígitos';
  } else if (docType === 'RUC') {
    docNumInput.maxLength = 11;
    docNumInput.placeholder = '11 dígitos';
  } else {
    docNumInput.maxLength = 12;
    docNumInput.placeholder = 'Hasta 12 caracteres';
  }
}

// Manejo condicional de Apoderado / Tutor para menores de edad
function toggleTutorFields(isMinor) {
  const tutorBox = document.getElementById('claim-tutor-container');
  const tutorName = document.getElementById('claim-tutor-name');
  const tutorDoc = document.getElementById('claim-tutor-doc');

  if (tutorBox) {
    tutorBox.style.display = isMinor ? 'block' : 'none';
  }
  if (tutorName) tutorName.required = isMinor;
  if (tutorDoc) tutorDoc.required = isMinor;
}

// Ubicación geográfica: Provincias según Departamento
const PROVINCIAS_MAP = {
  Lima: ['Lima', 'Barranca', 'Cajatambo', 'Canta', 'Cañete', 'Huaral', 'Huarochirí', 'Huaura', 'Oyón', 'Yauyos'],
  Callao: ['Callao'],
  Arequipa: ['Arequipa', 'Camaná', 'Caravelí', 'Castilla', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión'],
  Cusco: ['Cusco', 'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Espinar', 'La Convención', 'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba'],
  Ucayali: ['Coronel Portillo (Pucallpa)', 'Atalaya', 'Padre Abad', 'Purús'],
  Loreto: ['Maynas (Iquitos)', 'Alto Amazonas', 'Datem del Marañón', 'Loreto', 'Mariscal Ramón Castilla', 'Requena', 'Ucayali'],
  'San Martín': ['Moyobamba', 'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Picota', 'Rioja', 'San Martín (Tarapoto)', 'Tocache'],
  'La Libertad': ['Trujillo', 'Ascope', 'Bolívar', 'Chepén', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz', 'Sánchez Carrión', 'Santiago de Chuco', 'Virú'],
  Piura: ['Piura', 'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Sullana', 'Talara', 'Sechura'],
  Lambayeque: ['Chiclayo', 'Ferreñafe', 'Lambayeque'],
  Junín: ['Huancayo', 'Chanchamayo', 'Chupaca', 'Concepción', 'Jauja', 'Junín', 'Satipo', 'Tarma', 'Yauli'],
  Ica: ['Ica', 'Chincha', 'Nazca', 'Palpa', 'Pisco'],
  Ancash: ['Huaraz', 'Santa (Chimbote)', 'Carhuaz', 'Huari', 'Huaylas', 'Yungay'],
  Tacna: ['Tacna', 'Candarave', 'Jorge Basadre', 'Tarata']
};

const DISTRITOS_LIMA = [
  'Ate (Santa Clara / Vitarte)',
  'Santa Anita',
  'La Molina',
  'Chosica (Lurigancho)',
  'Chaclacayo',
  'San Juan de Lurigancho',
  'El Agustino',
  'Santiago de Surco',
  'San Borja',
  'San Isidro',
  'Miraflores',
  'Lima Cercado',
  'Breña',
  'Jesús María',
  'Lince',
  'Magdalena del Mar',
  'Pueblo Libre',
  'San Miguel',
  'Surquillo',
  'Barranco',
  'Chorrillos',
  'San Juan de Miraflores',
  'Villa María del Triunfo',
  'Villa El Salvador',
  'Comas',
  'Los Olivos',
  'Independencia',
  'San Martín de Porres',
  'Rímac',
  'Carabayllo',
  'Puente Piedra',
  'Ancón',
  'Santa Rosa',
  'Otro distrito'
];

function onDepartmentChanged(dept) {
  const provSelect = document.getElementById('claim-province');
  if (!provSelect) return;

  const provList = PROVINCIAS_MAP[dept] || ['Capital'];
  provSelect.innerHTML = provList.map((p, idx) => `<option value="${p}" ${idx === 0 ? 'selected' : ''}>${p}</option>`).join('');

  onProvinceChanged(provList[0]);
}

function onProvinceChanged(prov) {
  const distSelect = document.getElementById('claim-district');
  if (!distSelect) return;

  if (prov === 'Lima') {
    distSelect.innerHTML = DISTRITOS_LIMA.map((d, idx) => `<option value="${d}" ${idx === 0 ? 'selected' : ''}>${d}</option>`).join('');
  } else {
    distSelect.innerHTML = `
      <option value="${prov} (Centro)" selected>${prov} (Centro)</option>
      <option value="${prov} (Distrito 1)">${prov} (Distrito 1)</option>
      <option value="Otro">Otro distrito</option>
    `;
  }
}

// Manejo de Dropzone y Carga de Archivo Adjunto
function triggerFileInput() {
  const fileInput = document.getElementById('claim-file-input');
  if (fileInput) fileInput.click();
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('claim-dropzone');
  if (dropzone) dropzone.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('claim-dropzone');
  if (dropzone) dropzone.classList.remove('dragover');
}

function handleFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('claim-dropzone');
  if (dropzone) dropzone.classList.remove('dragover');

  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    processFile(e.dataTransfer.files[0]);
  }
}

function handleFileChange(e) {
  if (e.target && e.target.files && e.target.files.length > 0) {
    processFile(e.target.files[0]);
  }
}

function processFile(file) {
  if (!file) return;

  // Validar formato (PNG, JPG, PDF)
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowed.includes(file.type) && !['png', 'jpg', 'jpeg', 'pdf'].includes(ext)) {
    alert('Formato no permitido. Solo se aceptan archivos PNG, JPG o PDF.');
    return;
  }

  // Validar tamaño máx: 2 MB
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    alert('El archivo supera el tamaño máximo permitido de 2 MB.');
    return;
  }

  currentAttachedFile = file;

  // Mostrar preview
  const previewBox = document.getElementById('claim-file-preview');
  const filenameEl = document.getElementById('claim-preview-filename');
  const filesizeEl = document.getElementById('claim-preview-filesize');

  if (previewBox && filenameEl && filesizeEl) {
    filenameEl.textContent = file.name;
    const kb = (file.size / 1024).toFixed(1);
    filesizeEl.textContent = `(${kb} KB)`;
    previewBox.style.display = 'flex';
  }
}

function removeAttachedFile(e) {
  if (e) e.stopPropagation();
  currentAttachedFile = null;
  const fileInput = document.getElementById('claim-file-input');
  if (fileInput) fileInput.value = '';

  const previewBox = document.getElementById('claim-file-preview');
  if (previewBox) previewBox.style.display = 'none';
}

// Envío del formulario oficial
async function handleClaimSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('claim-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>ENVIANDO...</span>
    `;
  }

  // Recopilar datos
  const branch = document.getElementById('claim-local')?.value || 'BuchiSapa - Sede Central (Santa Clara, Ate)';
  const firstName = document.getElementById('claim-firstname')?.value?.trim() || '';
  const lastname1 = document.getElementById('claim-lastname1')?.value?.trim() || '';
  const lastname2 = document.getElementById('claim-lastname2')?.value?.trim() || '';
  const fullName = [firstName, lastname1, lastname2].filter(Boolean).join(' ');

  const docType = document.getElementById('claim-doc-type')?.value || 'DNI';
  const docNumber = document.getElementById('claim-doc-num')?.value?.trim() || '';
  const email = document.getElementById('claim-email')?.value?.trim() || '';
  const phone = document.getElementById('claim-phone')?.value?.trim() || '';

  const department = document.getElementById('claim-department')?.value || 'Lima';
  const province = document.getElementById('claim-province')?.value || 'Lima';
  const district = document.getElementById('claim-district')?.value || 'Ate';
  const address = document.getElementById('claim-address')?.value?.trim() || '';

  const ageOption = document.querySelector('input[name="claim-age"]:checked')?.value || 'mayor';
  const isMinor = ageOption === 'menor';
  const tutorName = isMinor ? (document.getElementById('claim-tutor-name')?.value?.trim() || '') : '';
  const tutorDoc = isMinor ? (document.getElementById('claim-tutor-doc')?.value?.trim() || '') : '';

  const orderNumber = document.getElementById('claim-order-num')?.value?.trim() || '';
  const orderDate = document.getElementById('claim-order-date')?.value || '';

  const claimTypeOption = document.querySelector('input[name="claim-type-option"]:checked')?.value || 'Reclamo';
  const consumerRequest = document.getElementById('claim-user-request')?.value?.trim() || '';

  // Generar código oficial de Hoja de Reclamación
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const currentYear = new Date().getFullYear();
  const claimCode = `REC-${currentYear}-${randomNum}`;

  const payload = {
    claimCode,
    branch,
    fullName,
    firstName,
    paternalSurname: lastname1,
    maternalSurname: lastname2,
    docType,
    docNumber,
    phone,
    email,
    department,
    province,
    district,
    address,
    isMinor,
    tutorName,
    tutorDoc,
    orderNumber,
    orderDate,
    claimType: claimTypeOption.toLowerCase().includes('queja') ? 'queja' : 'reclamo',
    consumerRequest,
    detail: consumerRequest,
    attachmentName: currentAttachedFile ? currentAttachedFile.name : ''
  };

  try {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!result.success && result.error) {
      console.warn('Backend aviso:', result.error);
    }
  } catch (err) {
    console.warn('Error al guardar en backend, respaldando localmente:', err);
  }

  // Guardar en localStorage para historial del cliente
  try {
    const localStore = JSON.parse(localStorage.getItem('buchisapa_reclamaciones') || '[]');
    localStore.unshift({ ...payload, createdAt: new Date().toISOString() });
    localStorage.setItem('buchisapa_reclamaciones', JSON.stringify(localStore));
  } catch (err) {}

  lastSubmittedClaim = payload;

  // Mostrar modal de éxito
  showClaimSuccessModal(payload);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg class="claim-send-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      <span>ENVIAR</span>
    `;
  }
}

// Modal de éxito y resumen
function showClaimSuccessModal(data) {
  const modal = document.getElementById('claim-success-modal');
  const codeEl = document.getElementById('modal-claim-code');
  const summaryEl = document.getElementById('modal-claim-summary');

  if (codeEl) codeEl.textContent = data.claimCode;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div><strong>Reclamante:</strong> ${escapeHtml(data.fullName)} (${data.docType}: ${escapeHtml(data.docNumber)})</div>
      <div><strong>Local:</strong> ${escapeHtml(data.branch)}</div>
      <div><strong>Tipo:</strong> ${data.claimType === 'queja' ? 'Queja' : 'Reclamo'}</div>
      <div><strong>Contacto:</strong> ${escapeHtml(data.email)} | ${escapeHtml(data.phone)}</div>
      <div><strong>Plazo legal de respuesta:</strong> Hasta 15 días hábiles conforme a ley.</div>
    `;
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeClaimSuccessModal() {
  const modal = document.getElementById('claim-success-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
  window.location.href = '/';
}

// Descarga en PDF oficial con jsPDF
function downloadClaimSheetPDF() {
  if (!lastSubmittedClaim) return;
  const d = lastSubmittedClaim;

  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert('La librería PDF se está cargando, intente nuevamente en unos segundos.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Encabezado
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BUCHISAPA - LIBRO DE RECLAMACIONES VIRTUAL', 105, 12, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Conforme al Código de Protección y Defensa del Consumidor - Ley N° 29571 (INDECOPI)', 105, 26, { align: 'center' });

    // Código y Fecha
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 30, 180, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(`HOJA DE RECLAMACIÓN N°: ${d.claimCode}`, 20, 38);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Registro: ${new Date().toLocaleDateString('es-PE')}`, 20, 43);

    // 1. Local
    let y = 54;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text('1. LOCAL DEL RESTAURANTE', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    y += 6;
    doc.text(d.branch, 15, y);

    // 2. Consumidor
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text('2. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    y += 6;
    doc.text(`Nombre Completo: ${d.fullName}`, 15, y);
    y += 5;
    doc.text(`Documento: ${d.docType} ${d.docNumber}    |    Teléfono: ${d.phone}    |    Email: ${d.email}`, 15, y);
    y += 5;
    doc.text(`Dirección: ${d.address} (${d.district}, ${d.province}, ${d.department})`, 15, y);
    if (d.isMinor && d.tutorName) {
      y += 5;
      doc.text(`Tutor / Apoderado: ${d.tutorName} (Doc: ${d.tutorDoc})`, 15, y);
    }

    // 3. Detalle
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text('3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    y += 6;
    doc.text(`Tipo: ${d.claimType.toUpperCase()}    |    N° Pedido: ${d.orderNumber || 'No especificado'}    |    Fecha Pedido: ${d.orderDate || 'No especificada'}`, 15, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Pedido / Solución Solicitada:', 15, y);
    doc.setFont('helvetica', 'normal');
    y += 5;

    const splitText = doc.splitTextToSize(d.consumerRequest, 180);
    doc.text(splitText, 15, y);
    y += splitText.length * 5 + 6;

    // Disclaimers legales
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('* La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.', 15, y);
    y += 4;
    doc.text('* El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince(15) días hábiles, el cual es improrrogable.', 15, y);

    // Guardar
    doc.save(`Hoja_Reclamacion_${d.claimCode}.pdf`);
  } catch (err) {
    console.error('Error al generar PDF:', err);
    window.print();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Exposición global para atributos onclick / onchange en HTML
window.handleTextareaCounter = handleTextareaCounter;
window.onDocTypeChange = onDocTypeChange;
window.toggleTutorFields = toggleTutorFields;
window.onDepartmentChanged = onDepartmentChanged;
window.onProvinceChanged = onProvinceChanged;
window.triggerFileInput = triggerFileInput;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleFileDrop = handleFileDrop;
window.handleFileChange = handleFileChange;
window.removeAttachedFile = removeAttachedFile;
window.handleClaimSubmit = handleClaimSubmit;
window.closeClaimSuccessModal = closeClaimSuccessModal;
window.downloadClaimSheetPDF = downloadClaimSheetPDF;
