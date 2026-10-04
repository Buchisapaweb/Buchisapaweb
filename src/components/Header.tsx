import React from 'react';
import { Flame, ShoppingCart, Truck, ShieldAlert, Store, Settings, ChevronLeft } from 'lucide-react';
import { useBuchisapa } from '../context/BuchisapaContext';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { cartCount, businessConfig } = useBuchisapa();

  const isSubPage = currentTab !== 'home';

  return (
    <header className="sticky top-0 z-40 bg-[#0F1424]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand or Back Button */}
        <div className="flex items-center gap-3">
          {isSubPage ? (
            <button
              onClick={() => setCurrentTab('home')}
              className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5"
              data-testid="header_back_button"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Menú</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 p-0.5 shadow-md shadow-orange-500/20 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/imagenes/logo/logo-buchisapa.webp"
                  alt="BuchiSapa Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to render
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white leading-tight tracking-tight flex items-center gap-1">
                  BuchiSapa
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Santa Clara
                  </span>
                </h1>
                <p className="text-[10px] font-semibold text-amber-400 leading-none mt-0.5">
                  Burger & Broaster Amazónico
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tracker Button */}
          <button
            onClick={() => setCurrentTab('tracker')}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'tracker'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Mis Pedidos"
            data-testid="header_tracker_button"
          >
            <Truck className="w-4 h-4" />
            <span className="hidden md:inline">Seguimiento</span>
          </button>

          {/* Info Button */}
          <button
            onClick={() => setCurrentTab('info')}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'info'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Nosotros y Local"
            data-testid="header_info_button"
          >
            <Store className="w-4 h-4" />
            <span className="hidden md:inline">Local</span>
          </button>

          {/* Claims Button */}
          <button
            onClick={() => setCurrentTab('claims')}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'claims'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Libro de Reclamaciones"
            data-testid="header_claims_button"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden lg:inline">Reclamos</span>
          </button>

          {/* Admin Button */}
          <button
            onClick={() => setCurrentTab('admin')}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'admin'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
            title="Panel Administrador"
            data-testid="header_admin_button"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Admin</span>
          </button>

          {/* Cart Button with Count Badge */}
          <button
            onClick={() => setCurrentTab('cart')}
            className={`relative p-2.5 rounded-xl transition-all ${
              currentTab === 'cart'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-slate-800/80 text-orange-400 hover:bg-slate-800 border border-slate-700/60'
            }`}
            data-testid="header_cart_button"
            title="Ver Carrito"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0F1424] shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
