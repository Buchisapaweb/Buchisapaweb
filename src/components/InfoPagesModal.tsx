import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Flame, 
  Heart, 
  ShieldCheck, 
  FileText, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { StoreConfig } from '../types';

interface InfoPagesModalProps {
  initialTab?: 'nosotros' | 'ubicacion' | 'reclamaciones' | 'horario';
  onClose: () => void;
  storeConfig: StoreConfig;
}

export const InfoPagesModal: React.FC<InfoPagesModalProps> = ({
  initialTab = 'nosotros',
  onClose,
  storeConfig
}) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Libro de reclamaciones form state
  const [reclamacionSubmitted, setReclamacionSubmitted] = React.useState(false);
  const [claimCode, setClaimCode] = React.useState('');
  const [reclamoForm, setReclamoForm] = React.useState({
    nombre: '',
    dni: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo: 'reclamo' as 'reclamo' | 'queja',
    detalle: '',
    pedido: ''
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reclamoForm.nombre || !reclamoForm.dni || !reclamoForm.detalle) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }
    const code = `LR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setClaimCode(code);
    setReclamacionSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-white">
        
        {/* Header with Navigation Tabs */}
        <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              🍗
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">BuchiSapa Información</h2>
              <span className="text-xs text-stone-400">Pollería & Sabor Amazónico</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('nosotros')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'nosotros'
                ? 'border-amber-500 text-amber-400 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Nosotros & Historia
          </button>
          <button
            onClick={() => setActiveTab('ubicacion')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'ubicacion' || activeTab === 'horario'
                ? 'border-amber-500 text-amber-400 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Ubicación & Horarios
          </button>
          <button
            onClick={() => setActiveTab('reclamaciones')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'reclamaciones'
                ? 'border-amber-500 text-amber-400 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Libro de Reclamaciones
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-sm text-stone-300">
          
          {/* TAB: NOSOTROS */}
          {activeTab === 'nosotros' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Flame className="w-5 h-5 fill-current" />
                  <span className="text-xs font-black uppercase tracking-wider">Nuestra Pasión</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  El Sabor de la Selva y la Tradición del Broaster en Santa Clara
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  <strong>BuchiSapa</strong> nació de una profunda conexión con las raíces de la Amazonía peruana y la irresistible cultura polleril nocturna de Lima. El término <em>"Buchi Sapa"</em> en la jerga amazónica hace referencia con cariño al buen comer: a quien disfruta los platos bien servidos, sabrosos y abundantes.
                </p>
                <p className="text-stone-300 text-sm leading-relaxed">
                  En nuestro local de <strong>Santa Clara, Ate</strong>, unimos dos mundos extraordinarios: el auténtico <strong>Tacacho con Cecina</strong> traída de la selva, los Juanes y los refrescos naturales de <strong>Cocona y Aguajina</strong>, junto a un <strong>Pollo Broaster ultra crocante</strong>, alitas en salsa acevichada y BBQ, y hamburguesas artesanales de primer nivel.
                </p>
              </div>

              {/* Pillars / Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Frescura Total</h4>
                  <p className="text-xs text-stone-400">
                    Pollo fresco marinado diariamente con especias secretas y cecina ahumada legítima.
                  </p>
                </div>

                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Madrugadas Calientes</h4>
                  <p className="text-xs text-stone-400">
                    Atendemos de 6:00 PM a 5:00 AM para calmar todos tus antojos en Santa Clara.
                  </p>
                </div>

                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Cremas Ilimitadas</h4>
                  <p className="text-xs text-stone-400">
                    Ají pollero casero, crema de rocoto y nuestro inigualable ají de cocona amazónico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: UBICACIÓN Y HORARIOS */}
          {(activeTab === 'ubicacion' || activeTab === 'horario') && (
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                  Visítanos o Pide a Domicilio
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Santa Clara, Ate - Lima
                </h3>
              </div>

              {/* Map mockup card */}
              <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-base">Ubicación del Local</h4>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {storeConfig.address} - Santa Clara, Ate (A pocas cuadras de la Carretera Central y la Plaza de Armas de Santa Clara)
                    </p>
                  </div>
                </div>

                <div className="aspect-[21/9] bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-center relative overflow-hidden text-center p-4">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-amber-500 text-stone-950 font-black px-3 py-1 rounded-full text-xs shadow-md">
                      <MapPin className="w-3.5 h-3.5" /> BuchiSapa Santa Clara
                    </div>
                    <p className="text-[11px] text-stone-400 max-w-sm">
                      Zona de cobertura de delivery directo: Santa Clara, Cooperativa, Los Sauces, Urb. Manylsa, Carretera Central Km 10 - 13.
                    </p>
                  </div>
                </div>

                {/* Schedule & Phone details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Horario Nocturno Ininterrumpido
                    </span>
                    <p className="text-stone-300 font-semibold">
                      Lunes a Domingo: 6:00 PM - 5:00 AM
                    </p>
                    <p className="text-stone-500 text-[11px]">
                      Atención continua durante toda la noche y madrugada.
                    </p>
                  </div>

                  <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Central de Pedidos & WhatsApp
                    </span>
                    <p className="text-stone-300 font-semibold">
                      +51 987 654 321
                    </p>
                    <p className="text-stone-500 text-[11px]">
                      Envíos con repartidores propios con caja térmica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIBRO DE RECLAMACIONES */}
          {activeTab === 'reclamaciones' && (
            <div className="space-y-5">
              <div className="border-b border-stone-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Conforme al D.L. N° 29571
                </span>
                <h3 className="text-xl font-black text-white">
                  Libro de Reclamaciones Virtual
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Razón Social: BUCHISAPA S.A.C. • RUC: 20608912345 • Santa Clara, Ate - Lima
                </p>
              </div>

              {reclamacionSubmitted ? (
                <div className="bg-emerald-950/30 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500 text-stone-950 rounded-full flex items-center justify-center mx-auto font-black text-xl">
                    ✓
                  </div>
                  <h4 className="text-lg font-black text-emerald-400">
                    Reclamación Registrada Correctamente
                  </h4>
                  <p className="text-xs text-stone-300 max-w-md mx-auto">
                    Tu código de seguimiento es: <strong className="text-white text-sm">{claimCode}</strong>.
                    Conforme a la normativa de INDECOPI, daremos respuesta a tu solicitud a tu correo electrónico en un plazo máximo de quince (15) días hábiles.
                  </p>
                  <button
                    onClick={() => setReclamacionSubmitted(false)}
                    className="mt-2 text-xs text-amber-400 underline font-bold"
                  >
                    Ingresar otro registro
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1">Nombre Completo *</label>
                      <input
                        required
                        type="text"
                        value={reclamoForm.nombre}
                        onChange={(e) => setReclamoForm({ ...reclamoForm, nombre: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                        placeholder="Nombres y Apellidos"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">DNI / CE / Pasaporte *</label>
                      <input
                        required
                        type="text"
                        value={reclamoForm.dni}
                        onChange={(e) => setReclamoForm({ ...reclamoForm, dni: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                        placeholder="Número de documento"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        value={reclamoForm.telefono}
                        onChange={(e) => setReclamoForm({ ...reclamoForm, telefono: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                        placeholder="Ej: 987654321"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        value={reclamoForm.email}
                        onChange={(e) => setReclamoForm({ ...reclamoForm, email: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1">Tipo de Solicitud:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo"
                          checked={reclamoForm.tipo === 'reclamo'}
                          onChange={() => setReclamoForm({ ...reclamoForm, tipo: 'reclamo' })}
                        />
                        <span>Reclamo (Disconformidad relacionada a los productos o servicios)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo"
                          checked={reclamoForm.tipo === 'queja'}
                          onChange={() => setReclamoForm({ ...reclamoForm, tipo: 'queja' })}
                        />
                        <span>Queja (Disconformidad sobre la atención recibida)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1">Detalle del Reclamo o Queja *</label>
                    <textarea
                      required
                      rows={3}
                      value={reclamoForm.detalle}
                      onChange={(e) => setReclamoForm({ ...reclamoForm, detalle: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white"
                      placeholder="Explica detalladamente lo sucedido..."
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1">Pedido del Consumidor</label>
                    <input
                      type="text"
                      value={reclamoForm.pedido}
                      onChange={(e) => setReclamoForm({ ...reclamoForm, pedido: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                      placeholder="¿Qué solución solicitas?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 rounded-xl transition text-sm shadow-md"
                  >
                    Registrar Hoja de Reclamación
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
