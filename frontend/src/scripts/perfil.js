/**
 * BUCHISAPA POLLOS & PARRILLAS - CONTROLADOR DE PERFIL DE CLIENTE (perfil.js)
 */

(function () {
  'use strict';

  // Verificar sesión al cargar
  function checkSession() {
    const userStr = localStorage.getItem('buchisapa_user');
    if (!userStr) {
      window.location.href = '/';
      return null;
    }
    try {
      const user = JSON.parse(userStr);
      if (!user || !user.email) {
        window.location.href = '/';
        return null;
      }
      return user;
    } catch (e) {
      window.location.href = '/';
      return null;
    }
  }

  // Renderizar datos del perfil
  function renderUserData(user) {
    if (!user) return;
    const nameEl = document.getElementById('profile-user-fullname');
    const emailEl = document.getElementById('profile-user-email');
    const initialEl = document.getElementById('profile-avatar-initial');
    const adminBtn = document.getElementById('profile-admin-redirect-btn');

    const fullName = user.nombre || (user.nombres ? `${user.nombres} ${user.apellidos || ''}` : '') || 'Cliente BuchiSapa';
    if (nameEl) nameEl.textContent = fullName.trim();
    if (emailEl) emailEl.textContent = user.email || '';
    if (initialEl) initialEl.textContent = (fullName[0] || user.email[0] || 'U').toUpperCase();

    if (user.isAdmin) {
      if (adminBtn) adminBtn.classList.remove('is-hidden');
    } else {
      if (adminBtn) adminBtn.classList.add('is-hidden');
    }

    // Llenar formulario de editar datos
    const fNameInput = document.getElementById('prof-edit-firstname');
    const lNameInput = document.getElementById('prof-edit-lastname');
    const emailInput = document.getElementById('prof-edit-email');
    const phoneInput = document.getElementById('prof-edit-phone');
    const docInput = document.getElementById('prof-edit-doc');

    if (fNameInput) fNameInput.value = user.nombres || user.nombre || '';
    if (lNameInput) lNameInput.value = user.apellidos || user.apellido || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.telefono || '';
    if (docInput) docInput.value = user.numeroDoc ? `${user.tipoDoc || 'DNI'}: ${user.numeroDoc}` : (user.dni ? `DNI: ${user.dni}` : 'No registrado');
  }

  // Cambiar entre la vista principal de perfil y las subvistas (addresses, cards, edit_data, settings)
  window.switchProfileScreen = function (screenName) {
    const screens = ['main', 'addresses', 'cards', 'edit_data', 'settings'];
    const titles = {
      addresses: 'Mis Direcciones',
      cards: 'Mis Tarjetas',
      edit_data: 'Editar mis datos',
      settings: 'Configuraciones'
    };

    screens.forEach(name => {
      const el = document.getElementById(`profile-screen-${name}`);
      if (el) el.style.display = name === screenName ? 'block' : 'none';
    });

    const subTopbar = document.getElementById('profile-sub-topbar');
    const screenTitle = document.getElementById('profile-sub-screen-title');

    if (subTopbar && screenTitle) {
      if (screenName === 'main') {
        subTopbar.style.display = 'none';
      } else {
        subTopbar.style.display = 'flex';
        screenTitle.textContent = titles[screenName] || 'Mi sección';
      }
    }

    if (screenName === 'addresses') {
      loadCustomerAddresses();
    }
  };

  // Pestañas de direcciones
  window.switchAddressTab = function (tabName) {
    const favTab = document.getElementById('addr-tab-favorites');
    const allTab = document.getElementById('addr-tab-all');
    const favBox = document.getElementById('addr-empty-favorites');
    const allBox = document.getElementById('addr-empty-all');
    const listContainer = document.getElementById('addr-list-container');

    if (tabName === 'favorites') {
      if (favTab) favTab.classList.add('active');
      if (allTab) allTab.classList.remove('active');
    } else {
      if (allTab) allTab.classList.add('active');
      if (favTab) favTab.classList.remove('active');
    }

    loadCustomerAddresses(tabName);
  };

  // Formulario de agregar dirección
  window.toggleAddAddressForm = function (show) {
    const formBox = document.getElementById('add-address-form-box');
    const bottomBtn = document.getElementById('addr-bottom-add-btn-wrap');
    if (formBox) formBox.style.display = show ? 'block' : 'none';
    if (bottomBtn) bottomBtn.style.display = show ? 'none' : 'block';
  };

  // Guardar nueva dirección en localStorage
  window.saveNewCustomerAddress = function () {
    const street = (document.getElementById('new-addr-street')?.value || '').trim();
    const district = (document.getElementById('new-addr-district')?.value || '').trim();
    const ref = (document.getElementById('new-addr-reference')?.value || '').trim();
    const isFav = document.getElementById('new-addr-is-fav')?.checked ?? true;

    if (!street || !district) {
      alert('Por favor ingresa la dirección y el distrito.');
      return;
    }

    const addresses = JSON.parse(localStorage.getItem('buchisapa_user_addresses') || '[]');
    addresses.push({
      id: `addr-${Date.now()}`,
      direccion: street,
      distrito: district,
      referencia: ref,
      esFavorita: isFav
    });
    localStorage.setItem('buchisapa_user_addresses', JSON.stringify(addresses));

    // Resetear formulario
    if (document.getElementById('new-addr-street')) document.getElementById('new-addr-street').value = '';
    if (document.getElementById('new-addr-district')) document.getElementById('new-addr-district').value = '';
    if (document.getElementById('new-addr-reference')) document.getElementById('new-addr-reference').value = '';
    toggleAddAddressForm(false);
    loadCustomerAddresses();
  };

  // Cargar direcciones
  function loadCustomerAddresses(activeTab = 'favorites') {
    const addresses = JSON.parse(localStorage.getItem('buchisapa_user_addresses') || '[]');
    const favBox = document.getElementById('addr-empty-favorites');
    const allBox = document.getElementById('addr-empty-all');
    const listContainer = document.getElementById('addr-list-container');

    const filtered = activeTab === 'favorites' 
      ? addresses.filter(a => a.esFavorita) 
      : addresses;

    if (filtered.length === 0) {
      if (favBox) favBox.style.display = activeTab === 'favorites' ? 'flex' : 'none';
      if (allBox) allBox.style.display = activeTab === 'all' ? 'flex' : 'none';
      if (listContainer) listContainer.innerHTML = '';
      return;
    }

    if (favBox) favBox.style.display = 'none';
    if (allBox) allBox.style.display = 'none';

    if (listContainer) {
      listContainer.innerHTML = filtered.map(addr => `
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${addr.direccion}</div>
            <div style="font-size: 12.5px; color: #64748b;">${addr.distrito} ${addr.referencia ? `(${addr.referencia})` : ''}</div>
          </div>
          <button type="button" style="background: transparent; border: none; color: #ef4444; font-size: 12px; font-weight: 700; cursor: pointer;" onclick="deleteCustomerAddress('${addr.id}')">
            Eliminar
          </button>
        </div>
      `).join('');
    }
  }

  window.deleteCustomerAddress = function (id) {
    let addresses = JSON.parse(localStorage.getItem('buchisapa_user_addresses') || '[]');
    addresses = addresses.filter(a => a.id !== id);
    localStorage.setItem('buchisapa_user_addresses', JSON.stringify(addresses));
    loadCustomerAddresses();
  };

  // Guardar datos modificados
  window.handleSaveProfileData = async function (e) {
    if (e) e.preventDefault();
    const alertEl = document.getElementById('profile-edit-alert');
    const fName = document.getElementById('prof-edit-firstname')?.value;
    const lName = document.getElementById('prof-edit-lastname')?.value;
    const phone = document.getElementById('prof-edit-phone')?.value;

    const userStr = localStorage.getItem('buchisapa_user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    user.nombres = fName;
    user.nombre = `${fName} ${lName}`.trim();
    user.apellidos = lName;
    user.telefono = phone;
    localStorage.setItem('buchisapa_user', JSON.stringify(user));

    if (alertEl) {
      alertEl.textContent = '¡Datos actualizados correctamente!';
      alertEl.className = 'auth-status-alert success';
      alertEl.style.display = 'block';
    }
    renderUserData(user);
  };

  // Eliminar cuenta
  window.handleDeleteCustomerAccount = function () {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente tu cuenta? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('buchisapa_token');
      localStorage.removeItem('buchisapa_user');
      localStorage.removeItem('buchisapa_user_addresses');
      fetch('/api/logout', { method: 'POST' }).finally(() => {
        window.location.href = '/';
      });
    }
  };

  // Cerrar sesión
  window.handleLogoutCustomer = function () {
    localStorage.removeItem('buchisapa_token');
    localStorage.removeItem('buchisapa_user');
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      window.location.href = '/';
    });
  };

  // Inicializar
  document.addEventListener('DOMContentLoaded', () => {
    const user = checkSession();
    if (user) {
      renderUserData(user);
    }
  });

})();
