import React, { useState } from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Flame,
  MessageCircle,
  ShieldAlert,
  BookOpen,
  Target,
  HeartHandshake,
  UtensilsCrossed,
  PartyPopper,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface InfoPageProps {
  onNavigateToClaims: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ onNavigateToClaims }) => {
  const { businessConfig } = useBuchisapa();
  const [activeSection, setActiveSection] = useState<'local' | 'historia' | 'mision' | 'servicios' | 'alergenos'>('local');

  const cleanPhone = businessConfig.phone.replace(/\D/g, '');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Brand Hero Banner */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30 overflow-hidden shrink-0">
            <img
              src="/imagenes/logo/logo-buchisapa.webp"
              alt="BuchiSapa Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">BuchiSapa</h2>
            <p className="text-xs font-bold text-amber-400">Pollería & Sabor Amazónico • Santa Clara, Ate</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Nacimos con la pasión de llevar los mejores sabores de la selva peruana (Tarapoto) y fusionarlos con las más crocantes hamburguesas artesanales y pollos broasters gigantes. Atendemos en horario nocturno y de madrugada para satisfacer todos tus antojos con la mejor sazón.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        <button
          onClick={() => setActiveSection('local')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeSection === 'local'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Local & Horario</span>
        </button>

        <button
          onClick={() => setActiveSection('historia')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeSection === 'historia'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Historia</span>
        </button>

        <button
          onClick={() => setActiveSection('mision')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeSection === 'mision'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Misión & Visión</span>
        </button>

        <button
          onClick={() => setActiveSection('servicios')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeSection === 'servicios'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PartyPopper className="w-4 h-4" />
          <span>Eventos & Catering</span>
        </button>

        <button
          onClick={() => setActiveSection('alergenos')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeSection === 'alergenos'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Alérgenos</span>
        </button>
      </div>

      {/* Section 1: Local & Horario */}
      {activeSection === 'local' && (
        <div className="space-y-4">
          <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Ubicación & Atención
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Dirección de BuchiSapa</p>
                  <p className="text-slate-400 mt-0.5">{businessConfig.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Horario Nocturno Ininterrumpido</p>
                  <p className="text-slate-400 mt-0.5">{businessConfig.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Central Telefónica / Pedidos</p>
                  <p className="text-slate-400 mt-0.5">{businessConfig.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Zone Banner */}
          <div className="bg-gradient-to-r from-orange-950/40 to-amber-950/20 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-orange-400 tracking-wider">
                Zona de Cobertura Delivery
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Reparto directo en Santa Clara, Huaycán, Pariachi, Vitarte y alrededores de Ate.
              </p>
            </div>
            <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 shrink-0">
              Delivery S/ 4.00
            </span>
          </div>
        </div>
      )}

      {/* Section 2: Historia */}
      {activeSection === 'historia' && (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-orange-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Nuestra Historia & Raíces
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            BuchiSapa nació del amor por la auténtica gastronomía de la selva de San Martín (Tarapoto) y el deseo de brindar una propuesta nocturna contundente y deliciosa para las familias y noctámbulos de Lima Este.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Desde nuestros inicios, seleccionamos cecina curada en leña, chorizo ahumado tradicional, plátano bellaco verde y maduro, combinados con las recetas maestras de pollo broaster gigante crujiente y hamburguesas 100% artesanales con cremas caseras.
          </p>
        </div>
      )}

      {/* Section 3: Misión & Visión */}
      {activeSection === 'mision' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-orange-400">
              <Target className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase text-white">Nuestra Misión</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Brindar una experiencia gastronómica nocturna inigualable, fusionando la sazón amazónica con el mejor pollo broaster y hamburguesas, sirviendo platos generosos, frescos y con atención cálida y rápida.
            </p>
          </div>

          <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400">
              <HeartHandshake className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase text-white">Nuestra Visión</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ser el referente gastronómico nocturno líder en Lima Este por nuestra autenticidad, calidad constante, rapidez en delivery y orgullo de nuestros sabores peruanos.
            </p>
          </div>
        </div>
      )}

      {/* Section 4: Eventos & Catering */}
      {activeSection === 'servicios' && (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <PartyPopper className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Catering, Fiestas & Pedidos Corporativos
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ¿Tienes un cumpleaños, reunión familiar o evento corporativo en Ate o Santa Clara? En BuchiSapa preparamos combos especiales por volumen (Tacacho con Cecina, Juanes, Alitas BBQ y Hamburguesas) listos para servir con todas las cremas y bebidas heladas.
          </p>
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Coordina tu catering con 24h de anticipación:</span>
            <span className="text-xs font-black text-emerald-400">{businessConfig.phone}</span>
          </div>
        </div>
      )}

      {/* Section 5: Alérgenos */}
      {activeSection === 'alergenos' && (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Cartilla de Alérgenos & Valores Nutricionales
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            En BuchiSapa cuidamos cada detalle en la preparación de nuestros platos. Consulta con nuestro equipo si tienes alguna intolerancia alimentaria:
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span><strong>Gluten:</strong> Presente en pan de hamburguesa, empanizado de pollo broaster y alitas.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span><strong>Lácteos / Huevos:</strong> Presente en mayonesa casera, queso cheddar fundido y cremas.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span><strong>Pescados / Mariscos:</strong> Presente en Chilcano de Pescado, Palometa Frita y salsa acevichada.</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <a
          href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hola%20BuchiSapa,%20deseo%20hacer%20un%20pedido`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all block text-center"
        >
          <MessageCircle className="w-4 h-4 inline" />
          <span>Escribir al WhatsApp Oficial ({businessConfig.phone})</span>
        </a>

        <button
          onClick={onNavigateToClaims}
          className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Ir al Libro de Reclamaciones Virtual</span>
        </button>
      </div>
    </div>
  );
};
