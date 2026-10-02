        <!-- ====================================================================
             7. VISTA PORTADA (CONTROL DIRECTO Y GESTOR DE HERO BANNERS)
             ==================================================================== -->
        <section class="admin-view" id="view-portada">

          <!-- ================================================================
               PÁGINA PRINCIPAL: MÉTRICAS + LISTADO DE PORTADAS CON ACTIVACIÓN DIRECTA
               ================================================================ -->
          <div id="portada-list-section">
            <div class="portada-dashboard-clean">
              
              <!-- CABECERA PRINCIPAL CENTRADA Y ELEGANTE -->
              <div class="portada-top-header-centered">
                <div class="portada-badge-live">
                  <span class="live-dot-pulse"></span>
                  <span id="portada-banner-status-badge">CARRUSEL ACTIVO EN TIENDA</span>
                </div>
                <h3 class="portada-main-title">Banners de Portada</h3>
                <p class="portada-main-subtitle">Control de visibilidad y gestión de diapositivas para la portada principal de BuchiSapa.</p>
                
                <div class="portada-top-buttons-centered">
                  <button type="button" class="btn-clean-primary" onclick="window.openCreatePortadaPage()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Agregar Nueva Portada</span>
                  </button>
                </div>
              </div>

              <!-- 4 CUADROS DE MÉTRICAS (TOTALMENTE CENTRADOS) -->
              <div class="portada-metrics-grid">
                
                <!-- 1. TOTAL PORTADAS -->
                <div class="portada-stat-card card-orange stat-non-clickable">
                  <div class="portada-stat-icon orange">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                  <span class="portada-stat-title">TOTAL PORTADAS</span>
                  <span class="portada-stat-num" id="portada-metric-total">4</span>
                  <span class="portada-stat-desc">Diapositivas registradas</span>
                </div>

                <!-- 2. ACTIVAS EN WEB -->
                <div class="portada-stat-card card-green stat-non-clickable">
                  <div class="portada-stat-icon green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <span class="portada-stat-title">ACTIVAS EN WEB</span>
                  <span class="portada-stat-num" id="portada-metric-active">4 activas</span>
                  <span class="portada-stat-desc">Visibles para los clientes</span>
                </div>

                <!-- 3. TOTAL ESCRITORIO -->
                <div class="portada-stat-card card-cyan stat-non-clickable">
                  <div class="portada-stat-icon cyan">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                  </div>
                  <span class="portada-stat-title">TOTAL ESCRITORIO</span>
                  <span class="portada-stat-num" id="portada-metric-desktop">4</span>
                  <span class="portada-stat-desc">Formato 1920 × 1080 px</span>
                </div>

                <!-- 4. TOTAL MÓVILES -->
                <div class="portada-stat-card card-purple stat-non-clickable">
                  <div class="portada-stat-icon purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                  </div>
                  <span class="portada-stat-title">TOTAL MÓVILES</span>
                  <span class="portada-stat-num" id="portada-metric-mobile">4</span>
                  <span class="portada-stat-desc">Formato Smartphone Vertical</span>
                </div>

              </div>

              <!-- SECCIÓN DE DIAPOSITIVAS EN VIVO CON BOTONES DE ACTIVACIÓN DIRECTA -->
              <div class="portada-list-direct-section">
                <div class="portada-section-bar-centered">
                  <h4 class="portada-section-bar-title">
                    <span>🖼️ Diapositivas de la Tienda</span>
                  </h4>
                  <p class="portada-section-bar-sub">
                    Usa <strong style="color: #6ee7b7;">"Activar"</strong> o <strong style="color: #fde047;">"Pausar"</strong> para cambiar la visibilidad de cada diapositiva en la web.
                  </p>
                </div>

                <!-- LISTADO CENTRADO DE PORTADAS -->
                <div class="portada-manage-container-centered" id="portadas-status-grid">
                  <!-- Renderizado dinámicamente en portada.js -->
                </div>
              </div>

            </div>
          </div>

          <!-- ================================================================
               PÁGINA DEDICADA: AGREGAR / EDITAR PORTADA (DISEÑO PREMIUM FLUIDO)
               ================================================================ -->
          <div id="portada-form-page-section" class="portada-dedicated-page" style="display: none;">
            
            <div class="portada-form-inner-container">
              
              <!-- BOTÓN VOLVER CON ESPACIADO GENEROSO -->
              <div class="portada-top-back-row">
                <button type="button" class="btn-return-link-prominent" onclick="window.closePortadaPages()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  <span>Volver al Listado de Portadas</span>
                </button>
              </div>

              <!-- ENCABEZADO DE CONFIGURACIÓN -->
              <div class="portada-form-header-card">
                <h3 id="portada-form-page-title" class="portada-form-hero-title">Agregar Nueva Portada</h3>
                <p class="portada-form-hero-desc">Sube imágenes en alta resolución para escritorio (1920 × 1080 px) y móviles verticales.</p>
              </div>

              <!-- SELECTOR DE VERSIÓN RESPONSIVE -->
              <div class="portada-version-selector-card">
                <span class="version-selector-label">¿Qué versión deseas configurar?</span>
                <div class="version-pills-grid">
                  <button type="button" id="btn-device-target-both" class="version-pill-btn active" onclick="window.setPortadaDeviceTarget('both')">
                    <span class="pill-icon">⚡</span>
                    <span class="pill-text">Ambas</span>
                  </button>
                  <button type="button" id="btn-device-target-desktop" class="version-pill-btn" onclick="window.setPortadaDeviceTarget('desktop')">
                    <span class="pill-icon">🖥️</span>
                    <span class="pill-text">Escritorio (1920×1080)</span>
                  </button>
                  <button type="button" id="btn-device-target-mobile" class="version-pill-btn" onclick="window.setPortadaDeviceTarget('mobile')">
                    <span class="pill-icon">📱</span>
                    <span class="pill-text">Móvil (Vertical)</span>
                  </button>
                </div>
              </div>

              <!-- FORMULARIO PRINCIPAL -->
              <form id="portada-form" onsubmit="window.handlePortadaFormSubmit(event)" class="portada-fluid-form">
                <input type="hidden" id="portada-form-id">

                <!-- DATOS GENERALES -->
                <div class="portada-form-meta-card">
                  <div class="form-field-group field-title-group">
                    <label for="portada-form-title" class="field-label">
                      <span>🏷️ Nombre de la Portada *</span>
                    </label>
                    <input type="text" id="portada-form-title" required class="field-text-input" placeholder="Ej. Portada 1, Especial Burger Amazónica...">
                  </div>

                  <div class="form-field-group field-switch-group">
                    <label class="field-label">
                      <span>👁️ Visibilidad en Tienda</span>
                    </label>
                    <div class="field-toggle-row">
                      <label class="switch">
                        <input type="checkbox" id="portada-form-active" checked>
                        <span class="slider round"></span>
                      </label>
                      <span class="toggle-status-text" id="portada-active-label">🟢 Visible en la tienda</span>
                    </div>
                  </div>
                </div>

                <!-- ZONAS DE IMÁGENES APILADAS VERTICALMENTE -->
                <div class="portada-images-stacked-layout">

                  <!-- 1. ESCRITORIO (1920 × 1080) -->
                  <div class="portada-image-block" id="portada-card-desktop-box">
                    <div class="image-block-header">
                      <div class="block-title-tag cyan">
                        <span>🖥️</span>
                        <strong>Versión Escritorio / PC (1920 × 1080)</strong>
                      </div>
                      <span class="block-hint badge-res cyan-border">16:9 Panorámica</span>
                    </div>

                    <!-- Dropzone / Preview 1920x1080 interactiva -->
                    <div class="portada-unified-uploader desktop-uploader-1080" onclick="document.getElementById('file-input-desktop').click()">
                      <input type="file" id="file-input-desktop" accept="image/*" style="display: none;" onchange="window.handleDesktopImageFileSelect(event)">
                      <img id="preview-img-desktop" src="/imagenes/portada/Portada1E.webp" alt="Vista previa escritorio 1920x1080" onerror="this.src='/imagenes/portada/Portada1E.webp'">
                      <div class="uploader-overlay">
                        <div class="uploader-overlay-content">
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          <span>Haz clic para subir o cambiar imagen (1920 × 1080)</span>
                        </div>
                      </div>
                    </div>

                    <!-- Entrada de URL alternativa directa -->
                    <div class="portada-url-inline-row">
                      <span class="url-inline-icon">🔗</span>
                      <input type="text" id="portada-form-image" class="url-inline-input" placeholder="Ruta o URL: /imagenes/portada/Portada1E.webp">
                    </div>
                  </div>

                  <!-- 2. MÓVIL (VERTICAL SMARTPHONE) -->
                  <div class="portada-image-block" id="portada-card-mobile-box">
                    <div class="image-block-header">
                      <div class="block-title-tag purple">
                        <span>📱</span>
                        <strong>Versión Móvil (Vertical Smartphone)</strong>
                      </div>
                      <span class="block-hint badge-res purple-border">9:16 Vertical</span>
                    </div>

                    <!-- Dropzone / Preview Móvil Vertical Centrada -->
                    <div class="mobile-uploader-centered-container">
                      <div class="portada-unified-uploader mobile-uploader-vertical" onclick="document.getElementById('file-input-mobile').click()">
                        <input type="file" id="file-input-mobile" accept="image/*" style="display: none;" onchange="window.handleMobileImageFileSelect(event)">
                        <img id="preview-img-mobile" src="/imagenes/portada/Portada1M.webp" alt="Vista previa móvil vertical" onerror="this.src='/imagenes/portada/Portada1M.webp'">
                        <div class="uploader-overlay">
                          <div class="uploader-overlay-content">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            <span>Haz clic para subir imagen móvil vertical</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Entrada de URL alternativa directa -->
                    <div class="portada-url-inline-row">
                      <span class="url-inline-icon">🔗</span>
                      <input type="text" id="portada-form-image-mobile" class="url-inline-input" placeholder="Ruta o URL: /imagenes/portada/Portada1M.webp">
                    </div>
                  </div>

                </div>

                <!-- BARRA INFERIOR DE ACCIONES MODERNA Y BALANCEADA -->
                <div class="portada-form-footer-bar">
                  <div class="portada-footer-secondary-actions">
                    <button type="button" class="btn-clean-cancel" onclick="window.closePortadaPages()">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      <span>Cancelar</span>
                    </button>
                    <button type="button" id="btn-portada-form-delete" class="btn-clean-danger" onclick="window.deleteCurrentEditingPortada()" style="display: none;">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                  <button type="submit" class="btn-clean-primary btn-save-portada-main">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    <span>Guardar Portada</span>
                  </button>
                </div>

              </form>
            </div>
          </div>

        </section>
