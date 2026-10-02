        <!-- ====================================================================
             2. VISTA PRODUCTOS (CATÁLOGO OFICIAL Y FORMULARIO EN PÁGINA)
             ==================================================================== -->
        <section class="admin-view" id="view-productos">

          <!-- CONTENEDOR 1: LISTADO DEL CATÁLOGO DE PRODUCTOS -->
          <div id="products-list-section">
            <!-- BARRA DE FILTROS POR CATEGORÍA, BÚSQUEDA Y ACCIONES -->
            <div class="catalog-toolbar">
              <!-- 1. BOTÓN DE SELECCIÓN DE CATEGORÍA PROFESIONAL Y COMPLETO -->
              <div class="admin-cat-select-container" id="admin-cat-select-wrapper">
                <button type="button" class="admin-cat-select-btn" id="admin-cat-select-trigger" onclick="window.toggleAdminCategoryFilterDropdown(event)" title="Seleccionar categoría para filtrar catálogo">
                  <div class="admin-cat-select-left">
                    <div class="admin-cat-select-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div class="admin-cat-select-labels">
                      <span class="admin-cat-select-sub">CATEGORÍA SELECCIONADA:</span>
                      <span class="admin-cat-select-main" id="admin-cat-selected-title">Todos los Platos</span>
                    </div>
                  </div>
                  <div class="admin-cat-select-right">
                    <span class="admin-cat-select-count" id="admin-cat-count-badge">54 Platos</span>
                    <svg class="admin-cat-select-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                <!-- MENÚ DESPLEGABLE CON BÚSQUEDA Y TODAS LAS CATEGORÍAS (DEFAULT Y CREADAS) -->
                <div class="admin-cat-dropdown-panel" id="admin-cat-filter-dropdown" style="display: none;">
                  <div class="admin-cat-dropdown-header">
                    <div class="admin-cat-search-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                      </svg>
                      <input type="text" id="admin-cat-filter-search-input" placeholder="Buscar categoría por nombre o ID..." oninput="window.filterAdminCategoryDropdownList(this.value)" autocomplete="off">
                    </div>
                  </div>

                  <div class="admin-cat-dropdown-list" id="admin-cat-dropdown-items-list">
                    <!-- Renderizado dinámico de todas las categorías disponibles y creadas -->
                  </div>

                  <div class="admin-cat-dropdown-footer">
                    <button type="button" class="btn-create-cat-quick" onclick="window.openCategoryManagerView('add')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                      <span>+ Crear Nueva Categoría</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 2. FILA DE BÚSQUEDA Y ACCIÓN AGREGAR PRODUCTO ELEGANTE -->
              <div class="catalog-action-row">
                <div class="product-search-wrapper">
                  <svg class="product-search-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                  <input type="text" id="catalog-search-input" class="admin-search-input catalog-search-field" placeholder="Buscar plato por nombre, código o categoría..." autocomplete="off">
                  <button type="button" class="btn-clear-catalog-search" id="btn-clear-catalog-search" title="Limpiar búsqueda" style="display: none;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <!-- BOTÓN AGREGAR ELEGANTE -->
                <button type="button" class="btn-add-product-elegant" onclick="window.openProductModal()" title="Agregar nuevo producto al catálogo">
                  <div class="btn-add-icon-glow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  </div>
                  <span class="btn-add-label">Nuevo Producto</span>
                </button>
              </div>

              <!-- BOTONES DE ACCIONES RÁPIDAS: CATEGORÍA, ACOMPAÑAMIENTO, CREMA DE LA CASA -->
              <div class="catalog-quick-actions-row">
                <button type="button" class="btn-quick-action btn-quick-cat" onclick="window.openCategoryManagerView('add')" title="Crear nueva categoría">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  <span>Nueva Categoría</span>
                </button>

                <button type="button" class="btn-quick-action btn-quick-side" onclick="window.openAccompanimentModal()" title="Crear nuevo acompañamiento o guarnición">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  <span>Nuevo Acompañamiento</span>
                </button>

                <button type="button" class="btn-quick-action btn-quick-sauce" onclick="window.openSauceModal()" title="Crear nueva crema o salsa de la casa">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  <span>Nueva Crema de la Casa</span>
                </button>
              </div>

              <!-- 3. CONTROLES DE ORDENAMIENTO Y MODO DE VISTA -->
              <div class="toolbar-controls">
                <div class="sort-select-wrapper">
                  <select class="sort-select" id="product-sort-select" title="Ordenar lista de productos">
                    <option value="recent">⚡ Más recientes</option>
                    <option value="price-asc">💲 Precio: menor a mayor</option>
                    <option value="price-desc">💰 Precio: mayor a menor</option>
                    <option value="stock-desc">📦 Mayor stock disponible</option>
                    <option value="name-asc">🔤 Nombre (A - Z)</option>
                  </select>
                  <svg class="sort-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>

                <div class="view-mode-toggle">
                  <button class="view-btn active" id="btn-view-grid" title="Vista en tarjetas cuadrícula">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </button>
                  <button class="view-btn" id="btn-view-table" title="Vista en tabla detallada">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- GRID DE PRODUCTOS -->
            <div class="products-grid" id="products-grid-container">
              <!-- Renderizado dinámico vía scripts -->
            </div>

            <!-- TABLA DE PRODUCTOS (MODO COMPACTO) -->
            <div class="table-container" id="products-table-container" style="display: none;">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Código ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="products-table-body">
                  <!-- Renderizado dinámico vía scripts -->
                </tbody>
              </table>
            </div>

            <!-- PAGINACIÓN -->
            <div id="catalog-pagination"></div>
          </div>

            <!-- CONTENEDOR 2: FORMULARIO EN PÁGINA PROPIA DE CREAR / EDITAR PRODUCTO -->
          <div id="product-form-page-section" class="admin-form-page-container" style="display: none;">
            <!-- Header de Página Centrado con Navegación y Título Profesional -->
            <div class="form-page-header centered-header">
              <div class="form-page-top-nav">
                <button type="button" class="btn-back-pill" onclick="window.closeProductFormView()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  <span>Volver al Catálogo</span>
                </button>
                <div class="form-page-badge">
                  <span class="pulse-dot"></span>
                  <span>GESTOR DE CARTA</span>
                </div>
              </div>

              <div class="form-page-title-group">
                <h3 id="product-form-page-title" class="form-page-title">Nuevo Producto</h3>
                <p class="form-page-subtitle">Completa la información del plato para publicarlo inmediatamente en la carta digital.</p>
              </div>
            </div>

            <!-- Formulario y Módulo de Vista Previa -->
            <form id="product-form" onsubmit="window.handleProductFormSubmit(event)">
              <input type="hidden" id="form-product-id">

              <div class="form-page-grid">
                <!-- Panel Principal de Campos -->
                <div class="form-card-panel">
                  <h4 class="form-card-section-title">📄 Información del Producto</h4>

                  <div class="product-form-fields-grid">
                    <!-- Fila 1: Código ID + Nombre del Plato -->
                    <div class="product-form-row-2col">
                      <div class="form-group" style="width: 140px; flex-shrink: 0;">
                        <label class="form-label" for="form-product-code">Código ID *</label>
                        <input type="text" class="form-input" id="form-product-code" readonly placeholder="100001" style="background: rgba(239, 68, 68, 0.08); color: #f87171; font-weight: 800; text-align: center; letter-spacing: 1.5px; border-color: rgba(239, 68, 68, 0.3);">
                      </div>
                      <div class="form-group" style="flex: 1; min-width: 220px;">
                        <label class="form-label" for="form-product-name">Nombre del Producto *</label>
                        <input type="text" class="form-input" id="form-product-name" required placeholder="Ej. BuchiBurger Super Especial" oninput="window.updateProductFormLivePreview()">
                      </div>
                    </div>

                    <!-- Fila 2: Categoría + Precio + Stock Inicial -->
                    <div class="product-form-row-3col">
                      <div class="form-group custom-select-group" style="flex: 1.6; min-width: 180px;">
                        <label class="form-label" for="form-product-category">Categoría *</label>
                        <input type="hidden" id="form-product-category" name="category_id" value="1001">
                        <div class="custom-category-picker" id="custom-category-picker">
                          <button type="button" class="custom-category-trigger" id="custom-category-trigger" onclick="window.toggleCategoryDropdown(event)">
                            <div class="category-selected-info" id="category-selected-info">
                              <span class="cat-code-badge" id="cat-badge-preview">ID: 1001</span>
                              <span class="cat-name-preview" id="cat-name-preview">Alitas</span>
                            </div>
                            <svg class="cat-picker-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                          <div class="custom-category-dropdown" id="custom-category-dropdown" style="display: none;">
                            <div class="cat-dropdown-header">
                              <span class="cat-dropdown-title">Seleccionar Categoría</span>
                              <span class="cat-dropdown-count" id="cat-dropdown-count">8 activas</span>
                            </div>
                            <div class="cat-dropdown-list" id="cat-dropdown-list"></div>
                          </div>
                        </div>
                      </div>

                      <div class="form-group" style="flex: 1; min-width: 120px;">
                        <label class="form-label" for="form-product-price">Precio (S/) *</label>
                        <input type="number" step="0.5" class="form-input" id="form-product-price" required placeholder="18.00" oninput="window.updateProductFormLivePreview()">
                      </div>

                      <div class="form-group" style="flex: 1; min-width: 120px;">
                        <label class="form-label" for="form-product-stock">Stock Inicial (unidades)</label>
                        <input type="number" class="form-input" id="form-product-stock" value="25" min="0">
                      </div>
                    </div>

                    <!-- Fila 3: Descripción del Plato -->
                    <div class="form-group">
                      <label class="form-label" for="form-product-description">Descripción del Plato</label>
                      <textarea class="form-textarea" id="form-product-description" rows="3" placeholder="Ingredientes, preparación y detalles para el cliente..." oninput="window.updateProductFormLivePreview()"></textarea>
                    </div>

                    <!-- Fila 4: Imagen del Plato con Soporte WebP -->
                    <div class="form-group">
                      <label class="form-label">Imagen del Plato (Soporta formato .webp, .jpg, .png)</label>
                      <div class="webp-upload-box">
                        <input type="file" id="form-product-image-file" accept="image/webp, image/jpeg, image/png, image/svg+xml" style="display: none;" onchange="window.handleProductImageFileUpload(event)">
                        
                        <div class="webp-upload-dropzone" onclick="document.getElementById('form-product-image-file').click()">
                          <div class="webp-icon-circle">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          </div>
                          <div class="webp-upload-text">
                            <span class="upload-dropzone-title">Subir Imagen en Formato <strong>.webp</strong> / Local</span>
                            <span class="upload-dropzone-subtitle">Haz clic para seleccionar desde tu dispositivo (WebP recomendado)</span>
                          </div>
                          <span class="btn-upload-browse">Examinar</span>
                        </div>

                        <div class="webp-divider">
                          <span>O pega un enlace de imagen directa (URL)</span>
                        </div>

                        <input type="text" class="form-input" id="form-product-image" placeholder="Ej. /imagenes/portada/Portada1E.webp o https://.../plato.webp" oninput="window.updateProductFormLivePreview()">
                      </div>
                      <p class="form-help-text" style="font-size: 0.74rem; color: #64748b; margin-top: 4px;">⚡ Optimizado para imágenes <strong>.webp</strong> con encuadre cuadrado 1:1 perfecto.</p>
                    </div>

                    <!-- Fila 5: Disponible en la Carta -->
                    <div class="modal-switch-box" style="margin-top: 4px;">
                      <div>
                        <p class="modal-title-white" style="font-weight: 700;">Disponible en la Carta</p>
                        <p class="modal-subtitle-text">Los clientes podrán ordenarlo inmediatamente en la web</p>
                      </div>
                      <label class="switch">
                        <input type="checkbox" id="form-product-available" checked>
                        <span class="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div class="form-page-actions">
                    <button type="button" class="btn btn-cancel-elegant" onclick="window.closeProductFormView()">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      <span>Cancelar</span>
                    </button>
                    <button type="submit" class="btn btn-submit-elegant">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      <span>Guardar Producto</span>
                    </button>
                  </div>
                </div>

                <!-- Módulo de Vista Previa en Vivo con Imagen 100% Cuadrada -->
                <div class="form-card-preview-col">
                  <h4 class="form-card-section-title">👀 Vista Previa en Vivo</h4>
                  
                  <div class="product-preview-card">
                    <div class="product-preview-img-wrap">
                      <img id="product-preview-img" src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" alt="Preview" class="product-preview-img">
                      <span id="product-preview-badge" class="product-badge-pill" style="display: none;">NUEVO</span>
                    </div>

                    <div class="product-preview-body">
                      <span id="product-preview-category" class="product-card-category">Platos Amazónicos</span>
                      <h4 id="product-preview-name" class="product-card-title">Ej. BuchiBurger Super Especial</h4>
                      <p id="product-preview-desc" class="product-card-desc">Ingredientes, preparación y detalles para el cliente...</p>
                      
                      <div class="product-card-footer">
                        <div>
                          <span id="product-preview-price" class="product-price-tag">S/ 18.00</span>
                        </div>
                        <span class="preview-avail-tag">🟢 Disponible</span>
                      </div>
                    </div>
                  </div>

                  <p class="preview-note-text">✨ La imagen se ajustará en formato <strong>cuadrado 1:1 perfecto</strong> sin franjas laterales.</p>
                </div>

              </div>
            </form>
          </div>

          </div>
        </section>
