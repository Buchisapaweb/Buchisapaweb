        <!-- ====================================================================
             14. VISTA CONFIGURACIÓN (HORARIOS LIMA UTC-5, WHATSAPP, PARÁMETROS & CULQI REAL)
             ==================================================================== -->
        <section class="admin-view" id="view-configuracion">
          
          <!-- PANEL 1: PASARELA DE PAGO CULQI OFICIAL (COBROS REALES Y SANDBOX) -->
          <div class="section-panel" style="margin-bottom: 24px; border: 1.5px solid rgba(220, 38, 38, 0.4);">
            <div class="panel-header" style="border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 14px; margin-bottom: 20px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 24px;">💳</span>
                  <h3 class="panel-title" style="color: #f87171;">Pasarela de Pagos Culqi (Cobros Reales en Vivo)</h3>
                </div>
                <p class="panel-description">Configura tus credenciales oficiales de Culqi obtenidas desde <a href="https://panel.culqi.com" target="_blank" style="color: #60a5fa; text-decoration: underline;">panel.culqi.com</a> para procesar cobros reales con Tarjetas de Débito, Crédito y Yape.</p>
              </div>
              <button class="btn btn-primary" style="background: #dc2626; border-color: #ef4444;" onclick="saveCulqiPaymentSettings()">
                💾 Guardar Llaves de Culqi
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; max-width: 680px;">
              
              <div class="form-group">
                <label class="form-label" style="display: flex; justify-content: space-between;">
                  <span>Llave Pública Oficial (Public Key)</span>
                  <span style="font-size: 11px; color: #94a3b8;">Formato: pk_live_... o pk_test_...</span>
                </label>
                <input type="text" id="admin-culqi-public-key" class="form-input" placeholder="pk_live_xxxxxxxxxxxxxxxx o pk_test_xxxxxxxxxxxxxxxx" style="font-family: monospace;">
              </div>

              <div class="form-group">
                <label class="form-label" style="display: flex; justify-content: space-between;">
                  <span>Llave Privada / Secreta (Secret Key)</span>
                  <span style="font-size: 11px; color: #94a3b8;">Formato: sk_live_... o sk_test_...</span>
                </label>
                <input type="password" id="admin-culqi-secret-key" class="form-input" placeholder="sk_live_xxxxxxxxxxxxxxxx o sk_test_xxxxxxxxxxxxxxxx" style="font-family: monospace;">
                <span id="admin-culqi-secret-status" style="font-size: 12px; color: #4ade80; margin-top: 4px; display: block;"></span>
              </div>

              <div class="form-group" style="background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <label class="form-label" style="margin-bottom: 8px;">Modo de Transacciones</label>
                <div style="display: flex; gap: 20px; align-items: center;">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #f8fafc; font-size: 14px;">
                    <input type="radio" name="admin-culqi-mode" id="admin-culqi-mode-live" value="live">
                    <span style="font-weight: 800; color: #22c55e;">🟢 Producción en Vivo (Cobros Reales)</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1; font-size: 14px;">
                    <input type="radio" name="admin-culqi-mode" id="admin-culqi-mode-test" value="test" checked>
                    <span style="font-weight: 800; color: #f59e0b;">🟡 Sandbox / Pruebas</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          <!-- PANEL 2: PARÁMETROS GENERALES DEL RESTAURANTE -->
          <div class="section-panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Parámetros del Sistema BuchiSapa</h3>
                <p class="panel-description">Configuración de horarios de atención (Oficial Lima UTC-5: 6:00 PM a 5:00 AM), costo de delivery y WhatsApp de despacho.</p>
              </div>
              <button class="btn btn-primary" onclick="showToast('Configuraciones guardadas con éxito', 'success')">
                Guardar Cambios
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px;">
              <div class="form-group">
                <label class="form-label">Nombre Comercial</label>
                <input type="text" class="form-input" value="BuchiSapa - Pollería &amp; Sabor Amazónico" readonly>
              </div>
              <div class="form-group">
                <label class="form-label">Sede Principal</label>
                <input type="text" class="form-input" value="Av. La Estrella con Calle 28 de Julio (Santa Clara, Ate - Lima)" readonly>
              </div>
              <div class="form-group">
                <label class="form-label">Tarifa de Delivery Base (S/)</label>
                <input type="number" class="form-input" value="4.00" step="0.5">
              </div>
              <div class="form-group">
                <label class="form-label">Horario Oficial de Atención (Lima UTC-5)</label>
                <input type="text" class="form-input" value="Lunes a Domingo de 6:00 PM a 5:00 AM">
              </div>
              <div class="form-group">
                <label class="form-label">Número Oficial de WhatsApp (+51)</label>
                <input type="text" class="form-input" value="+51 943 312 024">
              </div>
            </div>
          </div>
        </section>

        <script>
          async function loadCulqiPaymentSettings() {
            try {
              const res = await fetch('/api/settings/payments');
              if (res.ok) {
                const data = await res.json();
                if (data.settings) {
                  const pkInput = document.getElementById('admin-culqi-public-key');
                  const skStatus = document.getElementById('admin-culqi-secret-status');
                  const liveRadio = document.getElementById('admin-culqi-mode-live');
                  const testRadio = document.getElementById('admin-culqi-mode-test');

                  if (pkInput && data.settings.culqiPublicKey) pkInput.value = data.settings.culqiPublicKey;
                  if (skStatus) {
                    if (data.settings.hasSecretKey) {
                      skStatus.textContent = `✓ Llave secreta configurada (${data.settings.culqiSecretKeyMasked})`;
                    } else {
                      skStatus.textContent = '⚠️ Sin llave secreta guardada';
                      skStatus.style.color = '#f59e0b';
                    }
                  }
                  if (data.settings.liveMode) {
                    if (liveRadio) liveRadio.checked = true;
                  } else {
                    if (testRadio) testRadio.checked = true;
                  }
                }
              }
            } catch (e) {
              console.warn('Error loading payment settings:', e);
            }
          }

          async function saveCulqiPaymentSettings() {
            const pk = document.getElementById('admin-culqi-public-key')?.value.trim();
            const sk = document.getElementById('admin-culqi-secret-key')?.value.trim();
            const isLive = document.getElementById('admin-culqi-mode-live')?.checked;

            try {
              const res = await fetch('/api/settings/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  culqiPublicKey: pk,
                  culqiSecretKey: sk,
                  liveMode: isLive
                })
              });

              const data = await res.json();
              if (res.ok && data.success) {
                if (typeof showToast === 'function') {
                  showToast('¡Configuración de Culqi guardada con éxito!', 'success');
                } else {
                  alert('¡Configuración de Culqi guardada con éxito!');
                }
                loadCulqiPaymentSettings();
              } else {
                alert('Error al guardar: ' + (data.error || 'Intenta de nuevo'));
              }
            } catch (err) {
              alert('Error al comunicarse con el servidor: ' + err.message);
            }
          }

          document.addEventListener('DOMContentLoaded', () => {
            loadCulqiPaymentSettings();
          });
        </script>
