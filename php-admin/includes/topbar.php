      <!-- TOPBAR SUPERIOR (STICKY Y ELEGANTE) -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" id="btn-mobile-menu" title="Abrir menú lateral">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
          <div class="topbar-title-block">
            <h2 id="topbar-title">Dashboard Principal</h2>
            <p id="topbar-desc">Métricas operativas, comensales y cocina en tiempo real</p>
          </div>
        </div>

        <div class="topbar-right" style="display: flex; align-items: center; gap: 10px;">
          <!-- BOTÓN DIRECTO VER TIENDA / CARTA -->
          <a href="/" target="_blank" class="topbar-store-btn" title="Abrir Tienda y Carta de Clientes" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(220, 38, 38, 0.18); border: 1px solid rgba(220, 38, 38, 0.45); color: #fca5a5; font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; text-decoration: none; transition: all 0.2s;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Ver Tienda</span>
          </a>

          <!-- PERFIL ADMINISTRADOR EN TOPBAR -->
          <div class="admin-user-pill" title="Administrador BuchiSapa">
            <div class="user-avatar-wrap">
              <img src="/imagenes/logo/logo-buchisapa.webp" alt="Admin" class="user-avatar-img">
              <span class="user-online-dot"></span>
            </div>
            <div class="user-info-text">
              <span class="user-name">Admin</span>
              <span class="user-role">BuchiSapa</span>
            </div>
          </div>
        </div>
      </header>
