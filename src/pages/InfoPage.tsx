import React from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { Store, MapPin, Clock, Phone, Flame, MessageCircle, ShieldAlert } from 'lucide-react';

interface InfoPageProps {
  onNavigateToClaims: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ onNavigateToClaims }) => {
  const { businessConfig } = useBuchisapa();

  const cleanPhone = businessConfig.phone.replace(/\D/g, '');

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Brand Story Hero Card */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">BuchiSapa</h2>
            <p className="text-xs font-bold text-amber-400">Pollería & Sabor Amazónico</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Nacimos con la pasión de llevar los mejores sabores de la selva peruana (Tarapoto) y fusionarlos con las más crocantes hamburguesas artesanales y pollos broasters gigantes. Atendemos en horario nocturno y de madrugada para satisfacer todos tus antojos con la mejor sazón.
        </p>
      </div>

      {/* Location, Schedule & Contact */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Información del Local
        </h3>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Dirección del Local</p>
              <p className="text-slate-400 mt-0.5">{businessConfig.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Horario de Atención</p>
              <p className="text-slate-400 mt-0.5">{businessConfig.openingHours}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Central de Pedidos</p>
              <p className="text-slate-400 mt-0.5">{businessConfig.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hola%20BuchiSapa,%20deseo%20hacer%20un%20pedido`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all block text-center"
      >
        <MessageCircle className="w-4 h-4 inline" />
        <span>Escribir al WhatsApp Oficial</span>
      </a>

      {/* Reclamaciones Link */}
      <button
        onClick={onNavigateToClaims}
        className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>Ir al Libro de Reclamaciones Virtual</span>
      </button>
    </div>
  );
};
