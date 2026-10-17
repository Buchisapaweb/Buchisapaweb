import React from 'react';
import { MapPin, Phone, Clock, FileText, Heart, Shield } from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white text-gray-700 text-xs border-t border-gray-100">
      {/* Top Banner Featurettes */}
      <div className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              🍗
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Sabor Amazónico</h4>
              <p className="text-[11px] text-gray-500">Pollo a la brasa con toque de selva</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
              🛵
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Delivery Nocturno</h4>
              <p className="text-[11px] text-gray-500">Entregas calientes en Santa Clara y Ate</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-lg">
              🌙
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Horario 6 PM a 5 AM</h4>
              <p className="text-[11px] text-gray-500">Atendemos todos los días de la semana</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              💳
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Pagos Fáciles</h4>
              <p className="text-[11px] text-gray-500">Yape, Plin, Efectivo y Tarjetas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/imagenes/logo/logo-buchisapa.webp"
                alt="Logo BuchiSapa"
                className="w-10 h-10 object-contain rounded-full shadow-sm"
              />
              <span className="font-['Playfair_Display'] font-black text-xl text-gray-900">
                BuchiSapa
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Pasión por el auténtico pollo a la brasa, broasters crujientes, hamburguesas artesanales y platos con el toque inconfundible de la selva en Santa Clara, Ate.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>Hecho con</span>
              <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600" />
              <span>en Santa Clara, Lima</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h5 className="font-black text-gray-900 text-xs uppercase tracking-wider">
              Navegación
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-red-600 transition-colors"
                >
                  Carta Digital & Categorías
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('servicios')}
                  className="hover:text-red-600 transition-colors"
                >
                  Servicios de Catering & Eventos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nosotros')}
                  className="hover:text-red-600 transition-colors"
                >
                  Nuestra Historia & Valores
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contacto')}
                  className="hover:text-red-600 transition-colors"
                >
                  Ubicación & Horarios
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-red-600 transition-colors flex items-center gap-1 font-bold text-red-600"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Panel Administrativo</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-2.5">
            <h5 className="font-black text-gray-900 text-xs uppercase tracking-wider">
              Contacto & Sede
            </h5>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600 shrink-0" />
                <a
                  href={STORE_INFO.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gray-900 hover:text-green-600 underline"
                >
                  WhatsApp: {STORE_INFO.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>{STORE_INFO.schedule}</span>
              </div>
            </div>
          </div>

          {/* Legal & Libro de Reclamaciones */}
          <div className="space-y-3">
            <h5 className="font-black text-gray-900 text-xs uppercase tracking-wider">
              Transparencia Legal
            </h5>
            <button
              onClick={() => onNavigate('reclamaciones')}
              className="w-full bg-white hover:bg-gray-100 border border-gray-200 p-3 rounded-2xl flex items-center gap-3 transition-all text-left shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-xs block group-hover:text-red-600">
                  Libro de Reclamaciones
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Conforme a la normativa de INDECOPI
                </span>
              </div>
            </button>

            <div className="space-y-1 text-[11px] text-gray-500">
              <button
                onClick={() => onNavigate('politicas')}
                className="hover:text-gray-900 block text-left"
              >
                Políticas de Privacidad & Protección de Datos
              </button>
              <button
                onClick={() => onNavigate('terminos')}
                className="hover:text-gray-900 block text-left"
              >
                Términos del Servicio de Delivery
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 BuchiSapa. Todos los derechos reservados. Santa Clara, Ate - Lima, Perú.</p>
          <div className="flex items-center gap-3 font-semibold text-gray-600">
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
