import React from 'react';
import { ArrowLeft, Clock, MapPin, Phone, Award, Users, Heart, ShieldCheck, Flame, UtensilsCrossed } from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface InfoPageProps {
  type: 'nosotros' | 'servicios' | 'contacto' | 'politicas' | 'terminos';
  onBackToMenu: () => void;
}

export const InfoPages: React.FC<InfoPageProps> = ({ type, onBackToMenu }) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Carta Digital</span>
        </button>

        {/* 1. NOSOTROS / HISTORIA / VISIÓN */}
        {type === 'nosotros' && (
          <div className="space-y-8">
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 sm:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-red-300 px-3.5 py-1 rounded-full text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>NUESTRA PASIÓN POR EL SABOR</span>
              </div>
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                La Historia de BuchiSapa
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Nacimos en el corazón de <strong>Santa Clara, Ate</strong>, con la misión de fusionar dos de los grandes amores culinarios del Perú: la crocancia y sazón inconfundible del <strong>pollo a la brasa y broaster</strong> con los ingredientes ancestrales y aromas frescos de la <strong>selva amazónica</strong> (cecina ahumada, chorizo regional, plátano bellaco y ají charapita).
              </p>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                El término <em>"Buchisapa"</em> evoca con cariño al buen comensal, a quien disfruta de un plato bien servido, generoso y lleno de sabor casero. Cada hamburguesa, chaufa amazónico o porción de broaster se prepara al momento con recetas propias y cremas artesanales elaboradas diariamente.
              </p>
            </div>

            {/* Misión, Visión, Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Nuestra Visión</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ser la cadena de pollerías y sabor amazónico más querida y recomendada de Lima Este, destacándonos por porciones abundantes, calidad constante y atención nocturna confiable.
                </p>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Nuestra Misión</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Llevar felicidad a las mesas y hogares de nuestros vecinos mediante comida reconfortante, ingredientes frescos de alta calidad y un servicio rápido que nunca descansa de noche.
                </p>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Nuestros Valores</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generosidad en cada porción, honestidad en los insumos, higiene rigurosa y calidez humana en cada entrega y en nuestro mostrador.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SERVICIOS */}
        {type === 'servicios' && (
          <div className="space-y-8">
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 sm:p-12 space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>SOLUCIONES GASTRONÓMICAS</span>
              </div>
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-black text-white">
                Servicios & Eventos Especiales
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Además de nuestros pedidos nocturnos individuales, en BuchiSapa atendemos pedidos corporativos, celebraciones de cumpleaños, reuniones familiares y catering especial para empresas e instituciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-3">
                <h3 className="font-bold text-lg text-amber-400">🍗 Catering para Cumpleaños y Fiestas</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Preparamos combos a gran escala de alitas broaster, minihamburguesas y salchipapas en fuentes térmicas con surtido completo de cremas para que tus invitados disfruten al máximo.
                </p>
                <div className="text-xs text-gray-400">
                  Incluye salsas, ajíes, patacones y cubiertos descartables.
                </div>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-3">
                <h3 className="font-bold text-lg text-amber-400">🏢 Pedidos Corporativos & Empresas</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Atendemos turnos nocturnos de almacenes, fábricas y empresas de Lima Este con facturación electrónica y entregas coordinadas a tiempo.
                </p>
                <div className="text-xs text-gray-400">
                  Emitimos Factura y Boleta electrónica autorizada por SUNAT.
                </div>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-900/60 rounded-3xl p-6 text-center space-y-3">
              <h3 className="font-bold text-white text-base">¿Deseas cotizar un pedido para tu evento?</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Escríbenos directamente a nuestro WhatsApp oficial y un asesor de atención especial te brindará precios por volumen.
              </p>
              <a
                href={`${STORE_INFO.whatsapp}?text=Hola%20BuchiSapa,%20deseo%20cotizar%20un%20servicio%20de%20catering%20para%20un%20evento`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-full shadow-lg transition-transform active:scale-95"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* 3. CONTACTO & UBICACIÓN */}
        {type === 'contacto' && (
          <div className="space-y-8">
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 sm:p-12 space-y-4">
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-black text-white">
                Ubicación & Horarios Nocturnos
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Estamos estratégicamente ubicados en Santa Clara para atender a todo el distrito de Ate, Huaycán y zonas aledañas con servicio continuo todas las noches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Sede Principal Santa Clara</h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {STORE_INFO.address}
                    </p>
                    <span className="inline-block mt-2 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded-md">
                      Punto de referencia: Esquina de la posta médica
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-800">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Horario de Atención</h3>
                    <p className="text-xs text-green-400 font-semibold mt-1">
                      {STORE_INFO.schedule}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      ¡Nunca te quedes con las ganas de comer rico a medianoche o en la madrugada!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-800">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Teléfonos & Pedidos</h3>
                    <p className="text-xs text-white font-mono mt-1 font-bold">
                      {STORE_INFO.phone}
                    </p>
                    <a
                      href={STORE_INFO.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-xs text-green-400 hover:underline"
                    >
                      Enviar mensaje por WhatsApp →
                    </a>
                  </div>
                </div>
              </div>

              {/* Map representation */}
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-white">Zonas de Cobertura de Delivery</h3>
                  <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                    <li>Santa Clara (Centro, La Estrella, Manylsa)</li>
                    <li>Huaycán (Zonas A, B, C, D, E, F y aledaños)</li>
                    <li>Ate Vitarte (Zonas colindantes a Carretera Central)</li>
                    <li>Horacio Zeballos & Pariachi</li>
                  </ul>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center space-y-2">
                  <span className="text-2xl">🛵</span>
                  <p className="text-xs font-bold text-white">Tarifa plana de Delivery: S/ 4.00</p>
                  <p className="text-[11px] text-gray-400">
                    Empaque térmico hermético para que tus papas y pollo lleguen crujientes y calientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. POLÍTICAS Y TÉRMINOS */}
        {(type === 'politicas' || type === 'terminos') && (
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 sm:p-12 space-y-6">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-white">
                {type === 'politicas' ? 'Políticas de Privacidad y Tratamiento de Datos' : 'Términos y Condiciones del Servicio'}
              </h1>
            </div>

            <div className="text-xs text-gray-300 space-y-4 leading-relaxed">
              <p>
                En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su reglamento, BUCHISAPA SANTA CLARA SAC informa a todos sus clientes que los datos proporcionados al realizar pedidos (nombre, teléfono, dirección y correo electrónico) son almacenados de forma segura con el único fin de procesar, preparar y entregar su pedido en el domicilio indicado.
              </p>
              <h3 className="font-bold text-white text-sm pt-2">1. Condiciones de Entrega</h3>
              <p>
                El tiempo estimado de entrega fluctúa entre 25 y 45 minutos dependiendo de la demanda en cocina y la distancia en ruta. El repartidor esperará un máximo de 10 minutos en la dirección consignada.
              </p>
              <h3 className="font-bold text-white text-sm pt-2">2. Métodos de Pago y Cancelación</h3>
              <p>
                Los pagos mediante Yape o Plin deben realizarse a la línea oficial autorizada ({STORE_INFO.yapeNumber}). En caso de pago en efectivo, el cliente debe especificar el billete para asegurar el cambio necesario.
              </p>
              <h3 className="font-bold text-white text-sm pt-2">3. Libro de Reclamaciones</h3>
              <p>
                Ponemos a disposición de nuestros usuarios nuestro Libro de Reclamaciones Virtual en este sitio web, conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
