<?php
/**
 * BUCHISAPAWEB - Vista Configuración de Perfil Administrativo
 * admin/views/configuracion.php
 */
?>
<div class="space-y-6 max-w-5xl mx-auto">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span class="w-2 h-4 bg-orange-500 rounded-sm"></span>
                Configuración del Panel (Perfil de Administrador)
            </h2>
            <p class="text-xs text-slate-400">Personaliza la visualización de tu sesión, foto de perfil, nombre de administrador y preferencias locales.</p>
        </div>
        <div class="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800/60">
            <i data-lucide="shield" class="w-3.5 h-3.5 text-orange-500"></i>
            <span>Rol: Administrador Principal</span>
        </div>
    </div>

    <!-- Alert Success Toast -->
    <div id="config-success-toast" class="hidden p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-lg">
        <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
        <span>¡Configuración guardada correctamente con éxito! Se han actualizado las vistas en tiempo real.</span>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Form Section (Left Column) -->
        <div class="lg:col-span-7 space-y-6">
            <div class="config-card space-y-5">
                <h3 class="text-xs font-black uppercase text-orange-500 tracking-widest flex items-center gap-2 select-none">
                    <i data-lucide="user-cog" class="w-4 h-4"></i>
                    Información de Cuenta
                </h3>

                <!-- Name Input -->
                <div class="space-y-2">
                    <label for="admin-name-input" class="block text-xs font-bold text-slate-300">Nombre de Visualización del Administrador</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                            <i data-lucide="user" class="w-4 h-4"></i>
                        </span>
                        <input type="text" id="admin-name-input" placeholder="Ej. Administrador Principal / Carlos Pérez" class="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/10 transition-all">
                    </div>
                    <p class="text-[10px] text-slate-500">Este nombre aparecerá en la barra superior del panel junto a tu foto.</p>
                </div>

                <!-- File/Local Photo Input -->
                <div class="space-y-2 pt-2">
                    <label class="block text-xs font-bold text-slate-300">Cargar tu propia Foto de Perfil</label>
                    <div class="flex items-center gap-4">
                        <label class="config-upload-dropzone group">
                            <div class="flex flex-col items-center justify-center pt-4 pb-4">
                                <i data-lucide="upload" class="w-6 h-6 text-slate-500 group-hover:text-orange-500 transition-colors mb-2"></i>
                                <p class="text-xs text-slate-400 font-bold group-hover:text-slate-300">Examinar Archivos</p>
                                <p class="text-[9px] text-slate-500 mt-1">PNG, JPG o WEBP (Máx 2MB)</p>
                            </div>
                            <input type="file" id="admin-photo-file" accept="image/*" class="hidden">
                        </label>
                    </div>
                </div>

                <!-- Dynamic Photo URL Input -->
                <div class="space-y-2 pt-2">
                    <label for="admin-photo-url" class="block text-xs font-bold text-slate-300">O ingresa un enlace (URL) de Imagen</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                            <i data-lucide="link" class="w-4 h-4"></i>
                        </span>
                        <input type="url" id="admin-photo-url" placeholder="https://ejemplo.com/tu-foto.jpg" class="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/10 transition-all">
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/60">
                    <button onclick="resetAdminConfig()" class="config-btn-reset active-press">
                        Restablecer por Defecto
                    </button>
                    <button onclick="saveAdminConfig()" class="config-btn-save active-press">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        <span>Guardar Configuración</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Preview and Presets (Right Column) -->
        <div class="lg:col-span-5 space-y-6">
            <!-- Real-Time Interactive Live Preview Card -->
            <div class="config-card flex flex-col items-center text-center space-y-4">
                <h3 class="text-xs font-black uppercase text-orange-500 tracking-widest self-start select-none">
                    Vista Previa en Vivo
                </h3>

                <!-- Premium Square Avatar Preview Box -->
                <div class="config-preview-frame">
                    <img id="config-preview-img" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" class="w-full h-full object-cover transition-transform duration-300" alt="Foto Vista Previa">
                </div>

                <div>
                    <h4 id="config-preview-name" class="font-black text-white text-base">Administrador</h4>
                    <p class="text-xs text-orange-500 font-bold uppercase tracking-wider mt-0.5">Admin Principal</p>
                    <p class="text-[10px] text-slate-400 mt-2 font-medium">BuchiSapa Burger & Broaster</p>
                </div>
            </div>

            <!-- Preset Professional Avatars Gallery Card -->
            <div class="config-card space-y-4 select-none">
                <h3 class="text-xs font-black uppercase text-orange-500 tracking-widest flex items-center gap-2">
                    <i data-lucide="images" class="w-4 h-4"></i>
                    Avatares Recomendados
                </h3>
                <p class="text-[11px] text-slate-400 leading-normal">Elige uno de nuestros avatares diseñados profesionalmente para el equipo BuchiSapa:</p>

                <!-- Grid of Preset Images -->
                <div class="grid grid-cols-4 gap-3 pt-2">
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Chef Principal">
                        <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Chef">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Gerente General">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Gerente">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Gerente Operaciones">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Operaciones">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Chef Repostería">
                        <img src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Repostería">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Cajera POS">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Cajero">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Administrador Logística">
                        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Logística">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Atención Mesas">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Atención">
                    </button>
                    <button onclick="selectPresetAvatar('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop')" class="config-avatar-button group" title="Chef Soporte">
                        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Chef de Cocina">
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
