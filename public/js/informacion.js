/* =========================================================
   BUCHISAPA - LÓGICA DE LA PÁGINA DE INFORMACIÓN (JS)
   ========================================================= */

const INFORMACION_DATA = {
  historia: {
    category: "NOSOTROS",
    title: "Nuestra Historia - El Sabor Único de BuchiSapa",
    content: `
      <p><strong>Buchisapa</strong> nació en el corazón de Santa Clara, Ate, con una visión clara y apasionada: unir la inconfundible sazón amazónica de la selva peruana con los platillos más aclamados al carbón y al estilo broaster.</p>
      <p>Desde nuestros inicios, nos caracterizamos por utilizar ingredientes autóctonos de máxima frescura: cecina traída directamente de Tarapoto, plátanos bellacos seleccionados para patacones crujientes y chifles artesanales, y ajíes regionales que le dan ese toque picante e irresistible.</p>
      <div class="info-highlight-box">
        🔥 <strong>Compromiso BuchiSapa:</strong> Servir porciones generosas, jugosas y calientes, manteniendo nuestro servicio activo todas las noches hasta las 5:00 AM.
      </div>
      <h3>¿Qué significa Buchisapa?</h3>
      <p>En el dialecto amazónico peruano, <em>"Buchisapa"</em> significa de 'barriga llena' o 'bien comido'. Es el mayor elogio para un banquete tradicional, y nuestro compromiso diario con cada cliente.</p>
    `
  },
  vision: {
    category: "NOSOTROS",
    title: "Misión y Visión BuchiSapa",
    content: `
      <h3>Nuestra Misión</h3>
      <p>Brindar una experiencia gastronómica reconfortante, rápida y deliciosa a cada hogar de Lima Este, ofreciendo productos de pollo al carbón, broaster y fusiones amazónicas elaborados con altos estándares de higiene y sabor único.</p>
      <h3>Nuestra Visión</h3>
      <p>Convertirnos en la cadena de restaurante y delivery nocturno N° 1 de Lima Este, reconocida por la calidad insuperable de sus productos, la innovación constante en su carta y el compromiso con nuestros comensales y trabajadores.</p>
    `
  },
  valores: {
    category: "NOSOTROS",
    title: "Nuestros Valores Fundamentales",
    content: `
      <ul>
        <li><strong>Calidad Incalculable:</strong> Selección de insumos frescos y control riguroso de temperatura en cada entrega.</li>
        <li><strong>Velocidad y Precisión:</strong> Despachos en tiempo récord con seguimiento GPS transparente.</li>
        <li><strong>Hospitalidad Amazónica:</strong> Trato cálido y atento tanto en atención presencial como en delivery.</li>
        <li><strong>Integritad e Higiene:</strong> Cocinas y procesos de empaque con certificación sanitaria continua.</li>
      </ul>
    `
  },
  restaurantes: {
    category: "NOSOTROS",
    title: "Nuestras Sedes y Puntos de Atención",
    content: `
      <h3>Sede Central Santa Clara - Ate</h3>
      <p><strong>Dirección:</strong> Av. La Estrella con Calle 28 de Julio (Esquina de la Posta de Santa Clara, a 1 cuadra del Real Plaza Santa Clara).</p>
      <p><strong>Horario de Atención:</strong> Lunes a Domingo de 6:00 PM a 5:00 AM (Servicio Nocturno Continuo).</p>
      <div class="info-contact-card">
        <span class="info-contact-icon">🛵</span>
        <div>
          <div class="info-contact-text-title">Central Delivery y Recojo</div>
          <div class="info-contact-text-sub">Llamadas y WhatsApp: +51 943 312 024</div>
        </div>
      </div>
    `
  },
  reservas: {
    category: "SERVICIOS",
    title: "Reserva de Mesas y Eventos",
    content: `
      <p>En BuchiSapa ofrecemos atención presencial en salón para celebraciones de cumpleaños, aniversarios y reencuentros familiares o corporativos.</p>
      <h3>Condiciones de Reserva:</h3>
      <ul>
        <li>Reservas con mínimo 24 horas de anticipación a través de nuestra central telefónica o WhatsApp.</li>
        <li>Tolerancia de recepción: 15 minutos sobre la hora pactada.</li>
        <li>Decoración temática opcional para cumpleaños disponible bajo consulta previa.</li>
      </ul>
    `
  },
  catering: {
    category: "SERVICIOS",
    title: "Servicio de Catering y Banquetes Corporativos",
    content: `
      <p>Llevamos el sazón de BuchiSapa a tus eventos de empresa, aniversarios corporativos o reuniones familiares masivas.</p>
      <p>Ofrecemos bandejas de bocaditos amazónicos (mini juanes, brochetas de cecina con tacacho, tequeños rellenos de queso artesanal) y combos masivos de pollo broaster al carbón.</p>
      <p>Escríbenos a <strong>buchisapaweb@gmail.com</strong> para cotizaciones a medida.</p>
    `
  },
  fiestas: {
    category: "SERVICIOS",
    title: "Fiestas Infantiles y Paquetes Especiales",
    content: `
      <p>Contamos con combos infantiles adaptados: tiras de pechuga broaster sin picante, papas nativas doradas, refrescos naturales de camu camu o maracuyá y sorpresas temáticas.</p>
    `
  },
  giftcards: {
    category: "SERVICIOS",
    title: "Vales y Giftcards BuchiSapa",
    content: `
      <p>Regala sabor con nuestras Giftcards Digitales BuchiSapa, disponibles desde S/ 50.00 en adelante.</p>
      <ul>
        <li>Canjeables en salón, página web y central telefónica.</li>
        <li>Vigencia de 6 meses desde la fecha de emisión.</li>
        <li>Código QR de verificación inmediata.</li>
      </ul>
    `
  },
  nutricional: {
    category: "INFORMACIÓN ADICIONAL",
    title: "Valores Nutricionales e Insumos",
    content: `
      <p>En BuchiSapa nos esforzamos por brindar alimentos nutritivos y balanceados. Nuestro pollo se marina en hierbas naturales y especias sin conservantes artificiales.</p>
      <p>Utilizamos aceites vegetales de primer uso para frituras limpias y crujientes, garantizando un sabor puro y saludable.</p>
    `
  },
  alergenos: {
    category: "INFORMACIÓN ADICIONAL",
    title: "Cartilla de Alérgenos",
    content: `
      <p>Si sufres de alergias alimentarias, consulta la siguiente tabla de ingredientes:</p>
      <ul>
        <li><strong>Gluten (Trigo):</strong> Empanizado de Pollo Broaster, Tequeños, Pan de Hamburguesa.</li>
        <li><strong>Lácteos / Queso:</strong> Salsas de la casa, Tequeños, Queso cheddar en hamburguesas.</li>
        <li><strong>Soya y Sésamo:</strong> Aderezos de pollo al carbón y salsas orientales.</li>
        <li><strong>Huevo:</strong> Mayonesa de la casa, crema tártara.</li>
      </ul>
    `
  },
  privacidad: {
    category: "POLÍTICAS Y TÉRMINOS",
    title: "Políticas de Privacidad y Protección de Datos",
    content: `
      <p>De conformidad con la Ley N° 29733 de Protección de Datos Personales en el Perú, BuchiSapa garantiza la confidencialidad y protección de los datos suministrados por nuestros comensales.</p>
      <p>Los datos como nombre, dirección de entrega, teléfono y correo electrónico son utilizados exclusivamente para la gestión de su pedido, emisión de comprobantes y notificaciones sobre el estado de su delivery.</p>
    `
  },
  terminos: {
    category: "POLÍTICAS Y TÉRMINOS",
    title: "Términos y Condiciones Generales de Servicio",
    content: `
      <p>Al realizar una compra en nuestra plataforma o canal telefónico, el usuario acepta los siguientes términos:</p>
      <ul>
        <li>Todos los precios están expresados en Soles (S/) e incluyen IGV.</li>
        <li>El tiempo de entrega estimado es de 25 a 45 minutos sujeto a demanda y clima.</li>
        <li>Formas de pago aceptadas: Yape, Plin, Tarjeta de Crédito/Débito, PagoEfectivo y Efectivo contra entrega.</li>
      </ul>
    `
  },
  promociones: {
    category: "POLÍTICAS Y TÉRMINOS",
    title: "Términos de Promociones Comerciales",
    content: `
      <p>Las promociones y combos mostrados en nuestra carta digital son válidas según el stock disponible diario. No son acumulables con otros cupones de descuento a menos que se indique explícitamente.</p>
    `
  },
  terminos_giftcard: {
    category: "POLÍTICAS Y TÉRMINOS",
    title: "Términos de Vales y Giftcards",
    content: `
      <p>Los vales corporativos y giftcards digitales no son canjeables por dinero en efectivo. En caso de saldos remanentes, estos permanecerán activos en la tarjeta hasta la fecha de expiración.</p>
    `
  },
  trabaja: {
    category: "CONTÁCTANOS",
    title: "Trabaja con Nosotros - Únete a la Familia BuchiSapa",
    content: `
      <p>¡Buscamos talento apasionado por la gastronomía y la excelencia en atención al cliente!</p>
      <p>Puestos continuos: Cocineros, Horneros, Despachadores, Asistentes de Limpieza y Motorizados de Delivery con moto propia.</p>
      <div class="info-contact-card">
        <span class="info-contact-icon">💼</span>
        <div>
          <div class="info-contact-text-title">Envíanos tu CV</div>
          <div class="info-contact-text-sub">Correo: buchisapaweb@gmail.com | WhatsApp: +51 943 312 024</div>
        </div>
      </div>
    `
  },
  proveedores: {
    category: "CONTÁCTANOS",
    title: "Portal de Proveedores",
    content: `
      <p>Buscamos constantemente alianzas estratégicas con productores de insumos agrícolas (plátano bellaco, cecina, ajíes), empaques ecológicos biodegradables y distribuidores de bebidas.</p>
      <p>Envía tu catálogo o propuesta comercial a <strong>buchisapaweb@gmail.com</strong>.</p>
    `
  }
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function loadSection(sectionKey) {
  const data = INFORMACION_DATA[sectionKey] || INFORMACION_DATA['historia'];
  
  const badgeEl = document.getElementById('info-badge');
  const titleEl = document.getElementById('info-title');
  const bodyEl = document.getElementById('info-body');

  if (badgeEl) badgeEl.textContent = data.category;
  if (titleEl) titleEl.textContent = data.title;
  if (bodyEl) bodyEl.innerHTML = data.content;

  // Actualizar clase activa en enlaces laterales
  document.querySelectorAll('.info-nav-link').forEach(link => {
    if (link.dataset.section === sectionKey) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Actualizar título de la ventana
  document.title = `${data.title} | BuchiSapa Restaurante`;
  
  // Scroll suave al inicio del artículo en móviles
  if (window.innerWidth < 860) {
    const card = document.getElementById('info-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sectionParam = getUrlParameter('seccion') || getUrlParameter('section') || 'historia';
  loadSection(sectionParam);
});
