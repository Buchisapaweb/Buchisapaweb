import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, MapPin, Store, Check, Phone } from 'lucide-react';
import { OrderType } from '../types';

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, deliveryLocation, setDeliveryLocation, orderType, setOrderType } = useCart();

  const [activeTab, setActiveTab] = useState<OrderType>(orderType);
  const [tag, setTag] = useState(deliveryLocation.tag || 'Mi casa');
  const [phone, setPhone] = useState(deliveryLocation.phone || '924955869');
  const [address, setAddress] = useState(deliveryLocation.address || 'Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate');
  const [reference, setReference] = useState(deliveryLocation.reference || 'Frente a Real Plaza');

  if (!isLocationModalOpen) return null;

  const quickTags = ['Mi casa', 'Casa de mamá', 'Trabajo', 'Otro'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderType(activeTab);
    setDeliveryLocation({
      type: activeTab,
      tag: tag || (activeTab === 'pickup' ? 'Recojo en Sede' : 'Mi casa'),
      phone,
      address: activeTab === 'pickup' ? 'Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate' : address,
      reference,
      fee: activeTab === 'pickup' ? 0 : 4.0,
    });
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#111827] border border-gray-700 rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] font-black text-lg text-white">
                ¿Dónde deseas recibir tu pedido?
              </h3>
              <p className="text-xs text-gray-400">
                Atención nocturna y servicio de 6:00 PM a 5:00 AM
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar modal de ubicación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'delivery'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
            }`}
          >
            <span>🛵</span>
            <span>Delivery a Domicilio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pickup')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pickup'
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/30 font-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Recojo en Tienda</span>
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {activeTab === 'delivery' ? (
            <>
              {/* Quick Tag Chips */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Etiqueta de dirección:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        tag === t
                          ? 'bg-red-600/30 border-red-500 text-amber-300 font-bold'
                          : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {t === 'Mi casa' ? '🏠 ' : t === 'Casa de mamá' ? '❤️ ' : t === 'Trabajo' ? '💼 ' : '📍 '}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Custom input */}
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Etiqueta personalizada (ej. Dpto de Juan)"
                className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />

              {/* Phone number */}
              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1 mb-1">
                  <Phone className="w-3.5 h-3.5 text-green-400" />
                  <span>Número de teléfono / WhatsApp para entrega *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
                  maxLength={15}
                />
              </div>

              {/* Address input */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Dirección exacta (Calle, Av, Mz, Lote o Urb)*
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. 15 de Julio Zona B, Huaycán o Calle 28 de Julio, Santa Clara"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Referencia o indicaciones del timbre
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej: Frente al parque, reja negra, portón blanco..."
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Map & Delivery Fee Note */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛵</span>
                  <div>
                    <span className="font-bold text-gray-200">Tarifa plana de Delivery</span>
                    <p className="text-[11px] text-gray-400">Cobertura: Santa Clara, Huaycán y Ate</p>
                  </div>
                </div>
                <span className="font-black text-amber-400 text-sm">S/ 4.00</span>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                  <Store className="w-5 h-5 text-amber-400" />
                  <span>Sede Principal BuchiSapa - Santa Clara, Ate</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  📍 <strong>Av. La Estrella con Calle 28 de Julio</strong> (Esquina de la posta médica, a 1 cuadra de Real Plaza Santa Clara), Ate, Lima.
                </p>
                <div className="text-xs text-green-400 font-semibold bg-green-950/40 border border-green-900/50 p-2.5 rounded-xl">
                  🕒 Horario de atención: <strong>Lunes a Domingo de 6:00 PM a 5:00 AM</strong>
                </div>
                <p className="text-[11px] text-gray-400">
                  Tu pedido estará empacado térmicamente y listo en aproximadamente <strong>15–20 minutos</strong> para recogerlo en nuestro mostrador con tu nombre y número de pedido.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1 mb-1">
                  <Phone className="w-3.5 h-3.5 text-green-400" />
                  <span>Teléfono de contacto para avisarte cuando esté listo *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white font-mono"
                  maxLength={15}
                />
              </div>

              <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl text-xs text-amber-300 font-medium">
                ✨ ¡Costo de recojo en tienda <strong>totalmente gratis</strong>!
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{activeTab === 'delivery' ? 'Confirmar Dirección' : 'Confirmar Recojo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
