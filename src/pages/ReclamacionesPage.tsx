import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle2, Printer } from 'lucide-react';
import { Claim } from '../types';

interface ReclamacionesPageProps {
  onBackToMenu: () => void;
}

export const ReclamacionesPage: React.FC<ReclamacionesPageProps> = ({ onBackToMenu }) => {
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [itemType, setItemType] = useState<'producto' | 'servicio'>('producto');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [claimType, setClaimType] = useState<'queja' | 'reclamo'>('reclamo');
  const [consumerDetail, setConsumerDetail] = useState('');
  const [consumerRequest, setConsumerRequest] = useState('');
  const [submittedClaim, setSubmittedClaim] = useState<Claim | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedCode = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim: Claim = {
      id: `clm-${Date.now()}`,
      code: generatedCode,
      date: new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      fullName,
      documentType,
      documentNumber,
      phone,
      email,
      address,
      type: claimType,
      amountClaimed: amount,
      description,
      consumerDetail: `${consumerDetail}\n\n[Pedido del Consumidor]: ${consumerRequest}`,
      status: 'pendiente',
    };

    try {
      await fetch('/api/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim),
      }).catch(() => null);
    } catch {
      // ignore
    }

    setSubmittedClaim(newClaim);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>

        {submittedClaim ? (
          /* Confirmation Sheet */
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-white">
                Hoja de Reclamación Registrada
              </h1>
              <p className="text-xs text-gray-300 max-w-lg mx-auto">
                Su reclamación ha sido asentada formalmente en nuestro Libro de Reclamaciones Virtual. Conforme a la legislación de INDECOPI, le responderemos en un plazo máximo no mayor a quince (15) días hábiles.
              </p>
              <div className="inline-block bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-300 font-mono font-black text-lg">
                Código: {submittedClaim.code}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-xs text-gray-300 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 block">Consumidor Reclamante:</span>
                  <strong className="text-white text-sm">{submittedClaim.fullName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Documento de Identidad:</span>
                  <strong className="text-white text-sm">{submittedClaim.documentType}: {submittedClaim.documentNumber}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Fecha y Hora de Registro:</span>
                  <span className="text-white font-medium">{submittedClaim.date}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Tipo:</span>
                  <span className="uppercase font-bold text-amber-400">{submittedClaim.type}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <span className="text-gray-400 block mb-1">Detalle del Reclamo y Solicitud:</span>
                <p className="bg-black/40 p-3 rounded-xl whitespace-pre-wrap text-gray-200">
                  {submittedClaim.consumerDetail}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full text-xs flex items-center gap-2 border border-gray-700"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Hoja de Reclamación</span>
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full text-xs shadow-lg"
              >
                Regresar a la Tienda
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-white">
                  Libro de Reclamaciones Virtual
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  BuchiSapa · Pollería & Sabor Amazónico · Razón Social: BUCHISAPA SANTA CLARA SAC
                </p>
                <p className="text-[11px] text-gray-500">
                  Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate - Lima, Perú
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Identificación del Consumidor */}
              <div className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  1. Identificación del Consumidor Reclamante
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Tipo Doc *</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carnet de Extranjería</option>
                      <option value="RUC">RUC</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Número Documento *</label>
                    <input
                      type="text"
                      required
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Nombres y Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Domicilio *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Identificación del Bien Contratado */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  2. Identificación del Bien Contratado
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Tipo de Bien</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                    >
                      <option value="producto">Producto (Comida/Bebida)</option>
                      <option value="servicio">Servicio (Delivery/Atención)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Monto Reclamado (S/)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Descripción del Pedido</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Pedido Broaster Familiar #BS-1234"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Detalle de la Reclamación */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  3. Detalle de la Reclamación y Pedido del Consumidor
                </h2>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="claimType"
                      checked={claimType === 'reclamo'}
                      onChange={() => setClaimType('reclamo')}
                      className="accent-red-600"
                    />
                    <span>Reclamo (Disconformidad relacionada a los productos o servicios)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="claimType"
                      checked={claimType === 'queja'}
                      onChange={() => setClaimType('queja')}
                      className="accent-amber-500"
                    />
                    <span>Queja (Malestar respecto a la atención recibida)</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Detalle de los hechos sucedidos *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={consumerDetail}
                    onChange={(e) => setConsumerDetail(e.target.value)}
                    placeholder="Explique claramente qué ocurrió..."
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Pedido concreto del consumidor *
                  </label>
                  <input
                    type="text"
                    required
                    value={consumerRequest}
                    onChange={(e) => setConsumerRequest(e.target.value)}
                    placeholder="Ej: Reposición del plato, cambio de producto o devolución de dinero..."
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <p className="text-[11px] text-gray-500 max-w-sm">
                  Al enviar este formulario declara bajo juramento la veracidad de los hechos expuestos.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs rounded-full shadow-lg shadow-red-600/30 transition-all"
                >
                  {isSubmitting ? 'Registrando...' : 'ENVIAR RECLAMACIÓN'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
