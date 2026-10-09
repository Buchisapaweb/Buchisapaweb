import React from 'react';
import { Flame, MapPin, Clock, Phone, ShieldCheck, Heart, FileText } from 'lucide-react';
import { StoreConfig } from '../types';

interface FooterProps {
  storeConfig: StoreConfig;
  onOpenInfo: (tab: 'nosotros' | 'ubicacion' | 'reclamaciones' | 'horario') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ storeConfig, onOpenInfo, onOpenAdmin }) => {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-black shadow-md">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tight">
                BUCHI<span className="text-amber-500">SAPA</span>
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Pollería, broaster crocante y el auténtico sabor de la selva peruana en Santa Clara, Ate. Tacacho con cecina, alitas acevichadas y hamburguesas artesanales servidas calientes durante toda la noche.
            </p>
          </div>

          {/* Col 2: Atención & Horarios */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Horario de Atención</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-300 block">Lunes a Domingo</span>
                  <span className="text-amber-400 font-bold">6:00 PM - 5:00 AM</span>
                  <span className="text-stone-500 text-[11px] block">(Atención nocturna ininterrumpida)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Ubicación y Pedidos */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Ubicación & Pedidos</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300 block">{storeConfig.address}</span>
                  <span className="text-stone-400 text-[11px]">{storeConfig.district} - {storeConfig.city}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300 font-semibold block">Delivery WhatsApp:</span>
                  <a 
                    href={`https://wa.me/${storeConfig.whatsapp}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-emerald-400 font-black hover:underline"
                  >
                    +51 987 654 321
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Enlaces Rápidos & Transparencia */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Información</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onOpenInfo('nosotros')}
                  className="hover:text-amber-400 transition"
                >
                  Conócenos (Historia & Misión)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenInfo('ubicacion')}
                  className="hover:text-amber-400 transition"
                >
                  Zonas de Cobertura en Ate
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenInfo('reclamaciones')}
                  className="hover:text-amber-400 transition flex items-center gap-1.5 text-stone-300"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Libro de Reclamaciones Virtual</span>
                </button>
              </li>
              <li className="pt-2">
                <button 
                  onClick={onOpenAdmin}
                  className="hover:text-amber-400 text-stone-500 text-[11px] flex items-center gap-1 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acceso Administración BuchiSapa</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} BuchiSapa S.A.C. RUC: 20608912345. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-2">
            <span>Sabor amazónico & broaster crujiente en Santa Clara, Ate.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
