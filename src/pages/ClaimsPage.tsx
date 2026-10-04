import React, { useState } from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { ShieldAlert, CheckCircle2, FileText, Building2 } from 'lucide-react';
import { Claim } from '../types';

export const ClaimsPage: React.FC = () => {
  const { submitClaim, businessConfig } = useBuchisapa();

  const [fullName, setFullName] = useState('');
  const [docType, setDocType] = useState('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [claimType, setClaimType] = useState<'Reclamo' | 'Queja'>('Reclamo');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [consumerClaim, setConsumerClaim] = useState('');

  const [registeredClaim, setRegisteredClaim] = useState<Claim | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !docNumber || !email || !phone || !description || !consumerClaim) {
      alert('Por favor completa todos los campos requeridos con (*)');
      return;
    }

    const claim = submitClaim({
      fullName,
      docType,
      docNumber,
      email,
      phone,
      address,
      claimType,
      amount: amount ? parseFloat(amount) : undefined,
      description,
      consumerClaim
    });

    setRegisteredClaim(claim);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          <span>Libro de Reclamaciones Virtual</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Conforme a lo establecido en el Código de Protección y Defensa del Consumidor de Perú (Ley N° 29571).
        </p>
      </div>

      {/* Business Header Card */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <Building2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-extrabold text-white text-sm">{businessConfig.businessName}</p>
          <p className="text-slate-400">RUC: {businessConfig.ruc}</p>
          <p className="text-slate-400">Dirección: {businessConfig.address}</p>
        </div>
      </div>

      {registeredClaim ? (
        <div className="bg-[#0F1424] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">
            Hoja de Reclamación Registrada
          </h3>
          <p className="text-sm font-black text-orange-400">
            Código: {registeredClaim.code}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Hemos recibido su {registeredClaim.claimType.toLowerCase()}. Se le ha enviado una copia a su correo ({registeredClaim.email}). De acuerdo a ley, responderemos en un plazo máximo de 15 días hábiles.
          </p>
          <button
            onClick={() => setRegisteredClaim(null)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Registrar otro reclamo
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificación del Consumidor */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              1. Identificación del Consumidor Reclamante
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Nombres y Apellidos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                  >
                    <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                    <option value="CE">Carnet de Extranjería</option>
                    <option value="RUC">RUC</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                    placeholder="Número de documento"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Teléfono / Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="987654321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Domicilio
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Dirección, Distrito, Ciudad"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Detalle de la Reclamación */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              2. Detalle de la Reclamación
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tipo de Reclamación *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setClaimType('Reclamo')}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      claimType === 'Reclamo'
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-xs">RECLAMO</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Disconformidad relacionada a los productos o platos</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClaimType('Queja')}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      claimType === 'Queja'
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-xs">QUEJA</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Malestar o descontento respecto a la atención al público</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Monto Reclamado S/ (Opcional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ej: 35.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Descripción del Reclamo o Queja *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalla lo sucedido con la fecha y hora aproximada..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Pedido / Solicitud del Consumidor *
                </label>
                <textarea
                  required
                  rows={2}
                  value={consumerClaim}
                  onChange={e => setConsumerClaim(e.target.value)}
                  placeholder="Indica qué solución solicitas (ej: reposición, devolución...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 active:scale-[0.98] transition-all"
            data-testid="submit_claim_btn"
          >
            Registrar Hoja de Reclamación
          </button>
        </form>
      )}
    </div>
  );
};
