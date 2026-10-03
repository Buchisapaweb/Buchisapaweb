/**
 * BUCHISAPAWEB - Admin JS Controller for Configuracion View
 * admin/js/configuracion.js
 */

let selectedPhotoUrl = "";

document.addEventListener('DOMContentLoaded', () => {
    initConfiguracionView();
});

function initConfiguracionView() {
    const savedName = localStorage.getItem('admin_name') || 'Administrador';
    const savedPhoto = localStorage.getItem('admin_photo') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop';
    
    // Set initial values
    selectedPhotoUrl = savedPhoto;
    
    const nameInput = document.getElementById('admin-name-input');
    const urlInput = document.getElementById('admin-photo-url');
    const previewImg = document.getElementById('config-preview-img');
    const previewName = document.getElementById('config-preview-name');
    
    if (nameInput) {
        nameInput.value = savedName;
        // Listen to changes for live preview updating
        nameInput.addEventListener('input', (e) => {
            const val = e.target.value.trim() || 'Administrador';
            if (previewName) previewName.textContent = val;
        });
    }
    
    if (urlInput) {
        urlInput.value = savedPhoto.startsWith('data:image/') ? '' : savedPhoto;
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                selectedPhotoUrl = url;
                if (previewImg) previewImg.src = url;
            }
        });
    }
    
    if (previewImg) {
        previewImg.src = savedPhoto;
    }
    
    if (previewName) {
        previewName.textContent = savedName;
    }
    
    // Listen to local file uploads
    const fileInput = document.getElementById('admin-photo-file');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Ensure size is under 2MB
                if (file.size > 2 * 1024 * 1024) {
                    alert('El archivo seleccionado supera el límite de 2MB. Por favor, selecciona una imagen más liviana.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Str = event.target.result;
                    selectedPhotoUrl = base64Str;
                    if (previewImg) previewImg.src = base64Str;
                    if (urlInput) urlInput.value = ''; // clear url input since file is loaded
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Handle preset avatar selection clicked in gallery
 */
function selectPresetAvatar(url) {
    selectedPhotoUrl = url;
    
    const urlInput = document.getElementById('admin-photo-url');
    const previewImg = document.getElementById('config-preview-img');
    
    if (urlInput) urlInput.value = url;
    if (previewImg) {
        previewImg.src = url;
        // smooth entrance animation
        previewImg.classList.add('scale-95');
        setTimeout(() => previewImg.classList.remove('scale-95'), 150);
    }
}

/**
 * Reset configurations back to original defaults
 */
function resetAdminConfig() {
    if (confirm('¿Estás seguro de que deseas restablecer los valores del administrador al estado por defecto?')) {
        localStorage.removeItem('admin_name');
        localStorage.removeItem('admin_photo');
        
        // Re-initialize elements
        initConfiguracionView();
        
        // Instantly sync the header bar
        const topbarPhoto = document.getElementById('topbar-admin-img');
        const topbarName = document.getElementById('topbar-admin-name');
        if (topbarPhoto) topbarPhoto.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop';
        if (topbarName) topbarName.textContent = 'Administrador';
        
        // Play alert audio and show brief alert
        if (typeof playSoftAlert === 'function') playSoftAlert();
        alert('Configuración restablecida con éxito.');
    }
}

/**
 * Save configurations to localStorage and update topbar immediately
 */
function saveAdminConfig() {
    const nameInput = document.getElementById('admin-name-input');
    const finalName = nameInput ? nameInput.value.trim() : 'Administrador';
    
    if (!finalName) {
        alert('Por favor, ingresa un nombre válido para el administrador.');
        return;
    }
    
    // Store in localStorage
    localStorage.setItem('admin_name', finalName);
    localStorage.setItem('admin_photo', selectedPhotoUrl);
    
    // Sync the topbar header view instantly with no page reload required!
    const topbarPhoto = document.getElementById('topbar-admin-img');
    const topbarName = document.getElementById('topbar-admin-name');
    
    if (topbarPhoto && selectedPhotoUrl) {
        topbarPhoto.src = selectedPhotoUrl;
    }
    if (topbarName) {
        topbarName.textContent = finalName;
    }
    
    // Play professional soft cue tone
    if (typeof playSoftAlert === 'function') {
        playSoftAlert();
    }
    
    // Display beautiful temporary success toast inside view
    const toast = document.getElementById('config-success-toast');
    if (toast) {
        toast.classList.remove('hidden');
        // Scroll to top of panel smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            toast.classList.add('opacity-0');
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(() => {
                toast.classList.add('hidden');
                toast.classList.remove('opacity-0');
            }, 400);
        }, 5000);
    }
}
