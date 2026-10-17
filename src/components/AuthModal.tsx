import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Shield, Mail, Phone, Lock, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAsCustomer, loginAsAdmin } = useAuth();
  const [mode, setMode] = useState<'customer' | 'admin'>('customer');

  // Customer fields
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Admin fields
  const [adminEmail, setAdminEmail] = useState('buchisapaweb@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) return;
    loginAsCustomer(customerEmail, customerName, customerPhone);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setIsLoading(true);

    if (adminEmail.trim().toLowerCase() !== 'buchisapaweb@gmail.com') {
      setAdminError('Acceso denegado. Solo la cuenta buchisapaweb@gmail.com tiene permisos de administración.');
      setIsLoading(false);
      return;
    }

    try {
      const ok = await loginAsAdmin(adminPassword);
      if (!ok) {
        setAdminError('Credenciales incorrectas o sesión no autorizada.');
      }
    } catch {
      setAdminError('Error al contactar con el servidor de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              {mode === 'customer' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5 text-red-500" />}
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] font-black text-lg text-white">
                {mode === 'customer' ? 'Acceso de Clientes' : 'Acceso Administrativo'}
              </h3>
              <p className="text-xs text-gray-400">
                {mode === 'customer' ? 'Guarda tus direcciones y pedidos' : 'Gestión de restaurante y cocina'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar modal de autenticación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('customer'); setAdminError(''); }}
            className={`flex-1 py-3 text-center transition-all ${
              mode === 'customer'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-800/60'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            👤 Soy Cliente
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setAdminError(''); }}
            className={`flex-1 py-3 text-center transition-all ${
              mode === 'admin'
                ? 'text-red-400 border-b-2 border-red-500 bg-gray-800/60'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🛡️ Administración
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {mode === 'customer' ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Nombre completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Carlos Mendoza"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Correo electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="carlos@correo.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">WhatsApp / Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="987654321"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black text-xs rounded-full shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Ingresar a Mi Cuenta</span>
                </button>
              </div>

              {/* Quick Google Sign In Mock */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => loginAsCustomer('cliente.google@gmail.com', 'Cliente Google', '924955869')}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-xl text-xs text-red-300">
                🔒 Área restringida. Exclusivo para administradores y cocina de BuchiSapa.
              </div>

              {adminError && (
                <div className="bg-red-900/80 border border-red-700 p-2.5 rounded-xl text-xs text-white">
                  {adminError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Correo de Administrador</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Contraseña o Código de Acceso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 active:scale-95 text-white font-black text-xs rounded-full shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isLoading ? 'Verificando...' : 'Acceder al Panel Admin'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
