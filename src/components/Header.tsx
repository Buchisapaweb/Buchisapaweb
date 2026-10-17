import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MapPin, Menu, X, Search, ChevronDown, User as UserIcon, Shield, Phone, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  searchQuery = '',
  onSearchChange,
}) => {
  const { totalItems, setIsCartOpen, deliveryLocation, setIsLocationModalOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const locationLabel = deliveryLocation.type === 'pickup'
    ? 'Recojo en Sede'
    : deliveryLocation.tag || 'Entrega en Santa Clara';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.4]" />
          </button>

          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 focus:outline-none group"
          >
            <img
              src="/imagenes/logo/logo-buchisapa.webp"
              alt="Logo BuchiSapa"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full shadow-sm group-hover:scale-105 transition-transform"
            />
          </button>
        </div>

        {/* Center: Location Button ("Entrega en Santa Clara ⌵") */}
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-center focus:outline-none max-w-[200px] sm:max-w-xs md:max-w-sm truncate"
        >
          <MapPin className="w-4 h-4 text-red-600 fill-red-600 shrink-0" />
          <span className="text-xs sm:text-sm font-black text-red-600 tracking-tight truncate">
            {locationLabel.startsWith('Entrega') ? locationLabel : `Entrega en ${locationLabel}`}
          </span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 stroke-[2.8] shrink-0" />
        </button>

        {/* Right Side: Search & Shopping Bag with Red Counter Badge */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (currentTab !== 'home') onNavigate('home');
            }}
            className="p-2 text-gray-900 hover:text-red-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
            aria-label="Buscar platos"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </button>

          {/* Cart Icon with Red Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-900 hover:text-red-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.9]" />
            <span className="absolute top-1 right-0.5 bg-red-600 text-white text-[10px] sm:text-xs font-black rounded-full min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] px-1 flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 animate-in slide-in-from-top duration-200">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar alitas, hamburguesa, broaster, refrescos..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 shadow-sm"
            />
            <button
              onClick={() => {
                onSearchChange?.('');
                setIsSearchOpen(false);
              }}
              className="text-gray-400 hover:text-gray-700 text-xs font-bold px-2 py-1"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-start">
          <div className="w-full max-w-xs bg-white text-gray-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/imagenes/logo/logo-buchisapa.webp"
                  alt="Logo BuchiSapa"
                  className="w-9 h-9 rounded-full object-contain"
                />
                <div>
                  <h3 className="font-['Playfair_Display'] font-black text-base text-gray-900 leading-tight">
                    BuchiSapa
                  </h3>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">
                    Pollería & Sabor Amazónico
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1 text-sm font-semibold">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  currentTab === 'home' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                🍗 Nuestra Carta Digital
              </button>
              <button
                onClick={() => handleNavClick('servicios')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  currentTab === 'servicios' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                🎉 Catering & Eventos
              </button>
              <button
                onClick={() => handleNavClick('nosotros')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  currentTab === 'nosotros' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                ✨ Nuestra Historia
              </button>
              <button
                onClick={() => handleNavClick('contacto')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  currentTab === 'contacto' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                📍 Ubicación & Horario (6 PM - 5 AM)
              </button>
              <button
                onClick={() => handleNavClick('reclamaciones')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-xs"
              >
                📋 Libro de Reclamaciones
              </button>

              <div className="pt-3 border-t border-gray-100">
                {isAdmin ? (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> Panel Administrativo
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-red-600" /> Iniciar Sesión / Admin
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer with Delivery Hotline */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs space-y-1">
              <span className="text-gray-500 block">Pedidos nocturnos:</span>
              <a href="tel:924955869" className="font-bold text-gray-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-green-600" /> 924 955 869
              </a>
              <span className="text-[11px] text-gray-400 block">Lunes a Domingo: 6:00 PM a 5:00 AM</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
