import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MapPin, Menu, X, User as UserIcon, Shield, Clock, Phone } from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  const { totalItems, setIsCartOpen, orderType, deliveryLocation, setIsLocationModalOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Notice Bar */}
      <div className="bg-[#0b0f19] text-gray-300 text-xs py-1.5 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" /> {STORE_INFO.schedule}
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> Santa Clara, Ate (Av. La Estrella)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href={`tel:${STORE_INFO.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-green-500" /> {STORE_INFO.phone}
            </a>
            <button
              onClick={() => handleNavClick('reclamaciones')}
              className="text-gray-400 hover:text-amber-400 underline decoration-dotted transition-colors"
            >
              Libro de Reclamaciones
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#111827] text-white border-b border-gray-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <img
              src="/imagenes/logo/logo-buchisapa.webp"
              alt="Logo BuchiSapa"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border border-amber-500/40 shadow-sm transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-['Playfair_Display'] text-xl sm:text-2xl font-black tracking-tight text-amber-400 block leading-tight">
                BuchiSapa
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 tracking-wider uppercase font-semibold block">
                Pollería & Sabor Amazónico
              </span>
            </div>
          </button>

          {/* Delivery / Pickup Address Selector Chip */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden lg:flex items-center gap-2.5 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-left transition-all text-sm group"
          >
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              {orderType === 'delivery' ? '🛵' : '🏪'}
            </div>
            <div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>{orderType === 'delivery' ? 'Delivery en' : 'Recojo en'}</span>
                <span className="text-amber-400 font-bold">{deliveryLocation.tag}</span>
              </div>
              <div className="text-xs font-semibold text-gray-200 max-w-[190px] truncate">
                {orderType === 'delivery' ? deliveryLocation.address : 'Sede Santa Clara'}
              </div>
            </div>
            <span className="text-xs text-amber-500 font-bold group-hover:translate-x-0.5 transition-transform">
              Cambiar
            </span>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 font-semibold text-sm">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'home' ? 'text-amber-400 bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Carta Digital
            </button>
            <button
              onClick={() => handleNavClick('servicios')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'servicios' ? 'text-amber-400 bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => handleNavClick('nosotros')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'nosotros' ? 'text-amber-400 bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Nosotros
            </button>
            <button
              onClick={() => handleNavClick('contacto')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'contacto' ? 'text-amber-400 bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Ubicación
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-950/40 border border-red-900/60 font-bold ${
                  currentTab === 'admin' ? 'bg-red-900/50 text-white' : ''
                }`}
              >
                <Shield className="w-4 h-4" /> Panel Admin
              </button>
            )}
          </div>

          {/* Right Action Icons: Auth & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Login / Profile */}
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 bg-gray-800/70 hover:bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-200"
                >
                  <img
                    src={user.avatarUrl || '/imagenes/logo/logo-buchisapa.webp'}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-[#1f2937] border border-gray-700 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-1 text-xs text-gray-400 border-b border-gray-700 pb-2 mb-1">
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="truncate">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full text-left px-4 py-1.5 text-xs text-amber-400 hover:bg-gray-700 flex items-center gap-2 font-bold"
                    >
                      <Shield className="w-3.5 h-3.5" /> Administrar
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-1.5 text-xs text-red-400 hover:bg-gray-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-700 transition-colors"
                title="Iniciar sesión"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Ingresar</span>
              </button>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-3.5 sm:px-4 py-2 rounded-full shadow-lg shadow-red-600/30 transition-all text-sm"
              aria-label="Abrir Carrito"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Pedido</span>
              {totalItems > 0 && (
                <span className="bg-amber-400 text-gray-950 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Location Selector Bar */}
        <div className="lg:hidden mt-2 pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 text-gray-300 font-medium truncate"
          >
            <span>{orderType === 'delivery' ? '🛵 Delivery:' : '🏪 Recojo:'}</span>
            <span className="text-amber-400 font-bold truncate">{deliveryLocation.tag} - {deliveryLocation.address}</span>
          </button>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs text-amber-500 font-bold ml-2 underline"
          >
            Cambiar
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-800 space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'home' ? 'text-amber-400 bg-gray-800' : 'text-gray-300'
              }`}
            >
              Carta Digital & Promociones
            </button>
            <button
              onClick={() => handleNavClick('servicios')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'servicios' ? 'text-amber-400 bg-gray-800' : 'text-gray-300'
              }`}
            >
              Servicios (Catering & Reservas)
            </button>
            <button
              onClick={() => handleNavClick('nosotros')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'nosotros' ? 'text-amber-400 bg-gray-800' : 'text-gray-300'
              }`}
            >
              Nuestra Historia & Valores
            </button>
            <button
              onClick={() => handleNavClick('contacto')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'contacto' ? 'text-amber-400 bg-gray-800' : 'text-gray-300'
              }`}
            >
              Ubicación & Horarios Nocturnos
            </button>
            <button
              onClick={() => handleNavClick('reclamaciones')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400"
            >
              Libro de Reclamaciones
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-red-400 bg-red-950/30 border border-red-900/50 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" /> Panel Administrativo
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
