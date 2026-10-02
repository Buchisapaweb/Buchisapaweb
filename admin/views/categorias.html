<!-- ====================================================================
     VISTA DE GESTIÓN DE CATEGORÍAS (EXECUTIVE LUXURY THEME)
     ==================================================================== -->
<section class="admin-view" id="view-categorias">
  
  <!-- CABECERA PRINCIPAL Y NAVEGACIÓN DE VISTA -->
  <div class="category-page-header">
    <div class="category-page-nav-row">
      <button type="button" class="btn-back-pill" onclick="window.switchAdminView('productos')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        <span>Volver al Catálogo</span>
      </button>
      <div class="form-page-badge">
        <span class="pulse-dot"></span>
        <span>GESTOR DE CARTA DIGITAL</span>
      </div>
    </div>

    <div class="category-page-title-box">
      <h2 class="category-page-main-title">📁 Crear y Gestionar Categorías</h2>
      <p class="category-page-sub-title">Agrega nuevas categorías con código ID, imagen oficial y frase promocional para tus platos. Se sincronizarán en tiempo real con la tienda.</p>
    </div>
  </div>

  <!-- DISPOSICIÓN PRINCIPAL DE PÁGINA EN 2 COLUMNAS AMPLIAS -->
  <div class="category-page-body-grid">
    
    <!-- SECCIÓN IZQUIERDA: CREAR / EDITAR CATEGORÍA CON LIVE PREVIEW -->
    <div class="category-form-section">
      <div class="section-title-wrap">
        <div class="squircle-icon-badge" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.5); color: #ef4444;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </div>
        <div>
          <h3 class="section-title-text" id="cat-form-title">Crear Nueva Categoría</h3>
          <p class="section-subtitle-text" id="cat-form-subtitle">Completa los datos e imagen para publicar la nueva categoría en la carta</p>
        </div>
      </div>

      <form id="new-category-page-form" onsubmit="window.handleCreateCategorySubmit(event)" class="category-flat-form">
        <input type="hidden" id="form-cat-page-edit-id" value="">
        
        <div class="cat-form-grid">
          <!-- 1. CÓDIGO ID ÚNICO -->
          <div class="form-group form-group-code">
            <label class="form-label" for="form-cat-page-code">Código ID *</label>
            <input type="text" class="form-input form-input-lg form-input-code" id="form-cat-page-code" readonly placeholder="1011" style="background: rgba(239, 68, 68, 0.1); color: #f87171; font-weight: 800; text-align: center; letter-spacing: 2px; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px;" oninput="window.updateCategoryFormLivePreview()">
          </div>
          
          <!-- 2. NOMBRE DE LA CATEGORÍA -->
          <div class="form-group form-group-name">
            <label class="form-label" for="form-cat-page-name">Nombre de la Categoría *</label>
            <input type="text" class="form-input form-input-lg" id="form-cat-page-name" required placeholder="Ej. PARRILLAS & CARNES, SOPAS, POSTRES" autocomplete="off" oninput="window.updateCategoryFormLivePreview()">
          </div>
        </div>

        <!-- 3. FRASE PROMOCIONAL PARA PRODUCTOS / CATEGORÍA -->
        <div class="form-group" style="margin-top: 14px;">
          <label class="form-label" for="form-cat-page-desc">
            <span>Frase Promocional / Eslogan de la Categoría *</span>
            <span class="field-optional" style="font-size: 0.72rem; color: #94a3b8; margin-left: 6px;">(Aparecerá en los productos y tienda)</span>
          </label>
          <input type="text" class="form-input" id="form-cat-page-desc" placeholder="Ej. ¡El auténtico sabor criollo y reconfortante de nuestra casa!" autocomplete="off" oninput="window.updateCategoryFormLivePreview()">
        </div>

        <!-- 4. IMAGEN DE LA CATEGORÍA CON SUBIDA Y URL -->
        <div class="form-group" style="margin-top: 14px;">
          <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Foto / Imagen de la Categoría</span>
            <span class="field-optional" style="font-size: 0.72rem; color: #94a3b8;">(Recomendado: 600x400 JPG/PNG/WebP)</span>
          </label>
          
          <div style="display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
            <!-- Controles de Carga -->
            <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <label for="form-cat-page-image-file" class="btn btn-secondary" style="height: 42px; padding: 0 16px; font-size: 0.82rem; font-weight: 700; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Subir Foto (.webp / .png / .jpg)</span>
                </label>
                <input type="file" id="form-cat-page-image-file" accept="image/webp, image/jpeg, image/png" style="display: none;" onchange="window.handleCategoryImageFileUpload(event)">
                <button type="button" id="btn-remove-cat-img" onclick="window.removeCategoryImage()" class="btn btn-xs" style="display: none; height: 42px; padding: 0 14px; font-size: 0.8rem; font-weight: 700; border-radius: 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;">
                  <span>✕ Quitar Foto</span>
                </button>
              </div>
              <input type="text" class="form-input" id="form-cat-page-image" placeholder="O pega el enlace directo URL de la imagen..." oninput="window.handleCategoryImageUrlInput(this.value)" autocomplete="off" style="font-size: 0.82rem; height: 40px;">
            </div>
          </div>
        </div>

        <!-- 5. TARJETA VISTA PREVIA EN VIVO DE LA CATEGORÍA -->
        <div style="margin-top: 18px; padding: 14px; background: rgba(15, 23, 42, 0.8); border: 1px dashed rgba(239, 68, 68, 0.35); border-radius: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.75rem; font-weight: 800; color: #fca5a5; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
              Vista Previa de la Categoría
            </span>
            <span style="font-size: 0.7rem; color: #94a3b8;">En tiempo real</span>
          </div>

          <div id="cat-live-banner-preview" style="position: relative; width: 100%; height: 120px; border-radius: 14px; overflow: hidden; background: #1e1b4b; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: flex-end; padding: 14px; box-sizing: border-box;">
            <!-- Fondo de imagen -->
            <img id="cat-preview-banner-img" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80" alt="Preview" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55; filter: brightness(0.7);">
            
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; gap: 4px; width: 100%;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="cat-preview-badge-id" style="font-family: monospace; font-weight: 800; font-size: 0.72rem; color: #ffffff; background: #dc2626; padding: 2px 8px; border-radius: 6px;">ID: 1011</span>
                <h4 id="cat-preview-title-text" style="margin: 0; font-size: 1.1rem; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">NOMBRE DE LA CATEGORÍA</h4>
              </div>
              <p id="cat-preview-phrase-text" style="margin: 0; font-size: 0.78rem; color: #fef08a; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.9); line-height: 1.2;">¡Frase promocional y eslogan de los productos de esta categoría!</p>
            </div>
          </div>
        </div>

        <!-- 6. BOTÓN DE GUARDAR CATEGORÍA -->
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="button" id="btn-cancel-edit-category" class="btn btn-secondary" style="display: none; height: 50px; border-radius: 14px; font-weight: 700; padding: 0 20px;" onclick="window.cancelEditCategory()">
            <span>Cancelar</span>
          </button>
          <button type="submit" class="btn-save-category-hero" id="btn-save-category-hero" style="flex: 1; height: 52px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-weight: 900; font-size: 1rem; cursor: pointer; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #ffffff; border: none; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45); transition: all 0.22s ease;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <span id="btn-save-category-text">Guardar Categoría</span>
          </button>
        </div>
      </form>
    </div>

    <!-- SECCIÓN DERECHA: LISTADO OFICIAL DE CATEGORÍAS -->
    <div class="category-list-section">
      <div class="section-title-wrap" style="justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="squircle-icon-badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
          </div>
          <div>
            <h3 class="section-title-text">Categorías Oficiales</h3>
            <p class="section-subtitle-text">Edita los nombres, frases e imágenes o elimina categorías</p>
          </div>
        </div>
        <span class="badge badge-gray" id="categories-total-count" style="font-weight: 800; font-size: 0.8rem; padding: 6px 14px;">10 Categorías</span>
      </div>

      <div class="categories-list-container" id="categories-full-list-container">
        <!-- Carga dinámica vía JavaScript -->
      </div>
    </div>

  </div>

</section>
