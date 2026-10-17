import React from 'react';
import { MapPin, Phone, Clock, FileText, Heart, Shield } from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0b0f19] text-gray-400 text-xs border-t border-gray-800">
      {/* Top Banner Featurettes */}
      <div className="bg-[#111827] border-b border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-lg">
              🍗
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Sabor Amazónico</h4>
              <p className="text-[11px] text-gray-400">Pollo a la brasa con toque de selva</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              🛵
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Delivery Nocturno</h4>
              <p className="text-[11px] text-gray-400">Entregas calientes en Santa Clara y Ate</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-lg">
              🌙
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Horario 6 PM a 5 AM</h4>
              <p className="text-[11px] text-gray-400">Atendemos todos los días de la semana</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
              💳
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Pagos Fáciles</h4>
              <p className="text-[11px] text-gray-400">Yape, Plin, Efectivo y Tarjetas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/imagenes/logo/logo-buchisapa.webp"
                alt="Logo BuchiSapa"
                className="w-10 h-10 object-contain rounded-full border border-amber-500/40"
              />
              <span className="font-['Playfair_Display'] font-black text-xl text-amber-400">
                BuchiSapa
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Pasión por el sabor peruano y amazónico. Ofrecemos los mejores pollos broaster, hamburguesas caseras, alitas bañadas y platos típicos con el auténtico toque de la selva.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-300">
              <span>Hecho con</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>en Santa Clara, Ate</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Navegación
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Carta Digital & Combos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('servicios')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Servicios de Catering & Eventos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nosotros')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Historia, Visión & Valores
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contacto')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Ubicación & Horarios
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-red-400 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Shield className="w-3 h-3 text-red-500" />
                  <span>Portal Administrativo</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Contacto & Sede
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                <a href={STORE_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  WhatsApp: {STORE_INFO.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{STORE_INFO.schedule}</span>
              </div>
            </div>
          </div>

          {/* Legal & Libro de Reclamaciones */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Transparencia Legal
            </h5>
            <button
              onClick={() => onNavigate('reclamaciones')}
              className="w-full bg-[#161f30] hover:bg-[#1f2b42] border border-gray-700 hover:border-amber-500/50 p-3 rounded-2xl flex items-center gap-3 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block group-hover:text-amber-400">
                  Libro de Reclamaciones
                </span>
                <span className="text-[10px] text-gray-400 block">
                  Conforme al Código de Protección al Consumidor
                </span>
              </div>
            </button>

            <div className="space-y-1 text-[11px] text-gray-500">
              <button
                onClick={() => onNavigate('politicas')}
                className="hover:text-gray-300 block text-left"
              >
                Políticas de Privacidad & Protección de Datos
              </button>
              <button
                onClick={() => onNavigate('terminos')}
                className="hover:text-gray-300 block text-left"
              >
                Términos del Servicio de Delivery
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 BuchiSapa. Todos los derechos reservados. Santa Clara, Ate - Lima, Perú.</p>
          <div className="flex items-center gap-3">
            <span>Yape</span>
            <span>·</span>
            <span>Plin</span>
            <span>·</span>
            <span>Efectivo</span>
            <span>·</span>
            <span>Visa / POS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
