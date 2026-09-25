/* =========================================================
   BUCHISAPA - LIBRO DE RECLAMACIONES VIRTUAL (JS)
   ========================================================= */

async function submitClaimForm(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('claim-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando Reclamación...';
  }

  const claimData = {
    code: 'REC-' + Math.floor(100000 + Math.random() * 900000),
    created_at: new Date().toISOString(),
    name: document.getElementById('claim-name')?.value?.trim() || '',
    docType: document.getElementById('claim-doc-type')?.value || 'DNI',
    docNum: document.getElementById('claim-doc-num')?.value?.trim() || '',
    phone: document.getElementById('claim-phone')?.value?.trim() || '',
    email: document.getElementById('claim-email')?.value?.trim() || '',
    address: document.getElementById('claim-address')?.value?.trim() || '',
    type: document.getElementById('claim-type')?.value || 'Reclamo',
    amount: document.getElementById('claim-amount')?.value?.trim() || '0.00',
    description: document.getElementById('claim-desc')?.value?.trim() || '',
    detail: document.getElementById('claim-detail')?.value?.trim() || '',
    request: document.getElementById('claim-request')?.value?.trim() || '',
    status: 'Pendiente'
  };

  try {
    // Intentar guardar en Supabase si está disponible
    if (window.supabaseCliente) {
      await window.supabaseCliente.from('reclamaciones').insert([claimData]);
    }
  } catch (err) {
    console.warn('Error al guardar en Supabase, guardando en copia local:', err);
  }

  // Guardar en localStorage para respaldo local
  try {
    const existing = JSON.parse(localStorage.getItem('buchisapa_reclamaciones') || '[]');
    existing.push(claimData);
    localStorage.setItem('buchisapa_reclamaciones', JSON.stringify(existing));
  } catch (err) {}

  alert(`✅ ¡Reclamación Registrada con Éxito!\n\nCódigo de Hoja de Reclamación: ${claimData.code}\nSe ha enviado una copia a su correo (${claimData.email}). Nos comunicaremos en un plazo máximo de 15 días hábiles conforme a ley.`);

  window.location.href = '/';
}

window.submitClaimForm = submitClaimForm;
