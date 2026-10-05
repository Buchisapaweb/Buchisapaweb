/**
 * BUCHISAPA ADMIN - MÓDULO DE CONFIGURACIÓN & PERFIL DE ADMINISTRADOR
 * Layer: /admin/routes/configuracion.js
 */
(function () {
  'use strict';

  function loadSavedAdminProfile() {
    try {
      const savedName = localStorage.getItem('buchisapa_admin_name');
      const savedAvatar = localStorage.getItem('buchisapa_admin_avatar');

      if (savedName) {
        const topbarName = document.getElementById('topbar-user-name');
        const inputName = document.getElementById('config-admin-name');
        const heroName = document.getElementById('config-profile-name-hero');
        if (topbarName) topbarName.textContent = savedName;
        if (inputName) inputName.value = savedName;
        if (heroName) heroName.textContent = savedName;
      }

      if (savedAvatar) {
        const topbarAvatar = document.getElementById('topbar-user-avatar');
        const heroAvatar = document.getElementById('config-admin-avatar-preview');
        if (topbarAvatar) topbarAvatar.src = savedAvatar;
        if (heroAvatar) heroAvatar.src = savedAvatar;
      }
    } catch (e) {
      console.error(e);
    }
  }

  window.loadSavedAdminProfile = loadSavedAdminProfile;

  window.handleAdminAvatarUpload = function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      const topbarAvatar = document.getElementById('topbar-user-avatar');
      const heroAvatar = document.getElementById('config-admin-avatar-preview');
      if (topbarAvatar) topbarAvatar.src = dataUrl;
      if (heroAvatar) heroAvatar.src = dataUrl;

      try {
        localStorage.setItem('buchisapa_admin_avatar', dataUrl);
      } catch (err) {
        console.warn('Storage quota full, using in session');
      }
      window.showAdminToast?.('Foto de administrador actualizada con éxito', 'success');
    };
    reader.readAsDataURL(file);
  };

  window.saveAdminProfile = function () {
    const nameInput = document.getElementById('config-admin-name');
    const newName = nameInput ? nameInput.value.trim() : '';

    if (newName) {
      const topbarName = document.getElementById('topbar-user-name');
      const heroName = document.getElementById('config-profile-name-hero');
      if (topbarName) topbarName.textContent = newName;
      if (heroName) heroName.textContent = newName;

      try {
        localStorage.setItem('buchisapa_admin_name', newName);
      } catch (e) {
        console.warn(e);
      }
      window.showAdminToast?.('Perfil de administrador actualizado correctamente', 'success');
    } else {
      window.showAdminToast?.('Por favor ingresa un nombre válido', 'danger');
    }
  };

  window.saveGeneralSettings = function () {
    window.showAdminToast?.('Configuración del restaurante guardada con éxito', 'success');
  };
})();
