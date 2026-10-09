import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Flame, 
  Menu as MenuIcon, 
  X,
  PhoneCall
} from 'lucide-react';
import { StoreConfig } from '../types';

interface HeaderProps {
  storeConfig: StoreConfig;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenInfo: (tab: 'nosotros' | 'ubicacion' | 'reclamaciones' | 'horario') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  storeConfig,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
  onOpenInfo,
  searchQuery,
  setSearchQuery,
  isAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Check if store is open based on current Lima time (approx 6:00 PM to 5:00 AM)
  const isOperatingHours = () => {
    // Also respect manual storeConfig.isOpen
    if (!storeConfig.isOpen) return false;
    return true; // Store open by default per prompt
  };

  const storeOpen = isOperatingHours();

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      {/* Top emergency / schedule bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-stone-950 px-4 py-1.5 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${storeOpen ? 'bg-emerald-300' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${storeOpen ? 'bg-emerald-950' : 'bg-red-950'}`}></span>
            </span>
            <span>{storeOpen ? '¡ESTAMOS ABIERTOS Y ATENDIENDO!' : 'TIENDA EN RECESO'}</span>
            <span className="hidden sm:inline text-stone-900">•</span>
            <span className="hidden sm:inline text-stone-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Lunes a Domingo: 6:00 PM a 5:00 AM
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="hidden md:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Santa Clara, Ate - Lima
            </span>
            <a 
              href={`https://wa.me/${storeConfig.whatsapp}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 bg-stone-950/20 hover:bg-stone-950/30 px-2 py-0.5 rounded transition"
            >
              <PhoneCall className="w-3 h-3" /> Pedidos WhatsApp: 987 654 321
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  BUCHI<span className="text-amber-500">SAPA</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-amber-500/20 text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">
                  Selva & Brasa
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                Pollería, Broaster & Auténtico Sabor Amazónico
              </p>
            </div>
          </a>
        </div>

        {/* Search bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar alitas, broaster, tacacho, hamburguesas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-sm rounded-full pl-10 pr-9 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onOpenInfo('nosotros')}
            className="text-stone-300 hover:text-white px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-stone-900 transition"
          >
            Nosotros
          </button>
          <button
            onClick={() => onOpenInfo('ubicacion')}
            className="text-stone-300 hover:text-white px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-stone-900 transition"
          >
            Ubicación
          </button>
          <button
            onClick={() => onOpenInfo('reclamaciones')}
            className="text-stone-400 hover:text-stone-200 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-stone-900 transition"
            title="Libro de Reclamaciones"
          >
            Reclamaciones
          </button>

          {/* Admin Toggle */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isAdmin 
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20' 
                : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-500 hover:text-amber-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAdmin ? 'Modo Admin' : 'Admin'}
          </button>

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-stone-950 text-amber-400 text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-amber-500">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <span className="text-[10px] block leading-none opacity-80 uppercase tracking-wider font-extrabold">Mi Pedido</span>
              <span className="text-sm font-black leading-none">S/ {cartTotal.toFixed(2)}</span>
            </div>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 bg-amber-500 text-stone-950 font-bold px-3 py-2 rounded-xl text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>S/ {cartTotal.toFixed(2)}</span>
            {cartCount > 0 && (
              <span className="bg-stone-950 text-amber-400 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-300 hover:text-white rounded-lg bg-stone-900 border border-stone-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en la carta de BuchiSapa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer / dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { onOpenInfo('nosotros'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-stone-200 hover:bg-stone-800 rounded-lg text-sm font-medium"
            >
              Conoce BuchiSapa (Nosotros)
            </button>
            <button
              onClick={() => { onOpenInfo('ubicacion'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-stone-200 hover:bg-stone-800 rounded-lg text-sm font-medium"
            >
              Ubicación & Cobertura en Santa Clara
            </button>
            <button
              onClick={() => { onOpenInfo('horario'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-stone-200 hover:bg-stone-800 rounded-lg text-sm font-medium"
            >
              Horario de Atención (6 PM - 5 AM)
            </button>
            <button
              onClick={() => { onOpenInfo('reclamaciones'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-stone-200 hover:bg-stone-800 rounded-lg text-sm font-medium"
            >
              Libro de Reclamaciones
            </button>
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm font-bold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isAdmin ? 'Volver a Tienda / Salir Admin' : 'Ingresar a Panel de Administración'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
