/* =========================================================
   BUCHISAPA - LÓGICA DE LA PÁGINA DE INFORMACIÓN (JS)
   ========================================================= */

const INFORMACION_DATA = {
  historia: {
    categoria: "NOSOTROS",
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
    categoria: "NOSOTROS",
    title: "Misión y Visión BuchiSapa",
    content: `
      <h3>Nuestra Misión</h3>
      <p>Brindar una experiencia gastronómica reconfortante, rápida y deliciosa a cada hogar de Lima Este, ofreciendo productos de pollo al carbón, broaster y fusiones amazónicas elaborados con altos estándares de higiene y sabor único.</p>
      <h3>Nuestra Visión</h3>
      <p>Convertirnos en la cadena de restaurante y delivery nocturno N° 1 de Lima Este, reconocida por la calidad insuperable de sus productos, la innovación constante en su carta y el compromiso con nuestros comensales y trabajadores.</p>
    `
  },
  valores: {
    categoria: "NOSOTROS",
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
  reservas: {
    categoria: "SERVICIOS",
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
    categoria: "SERVICIOS",
    title: "Servicio de Catering y Banquetes Corporativos",
    content: `
      <p>Llevamos el sazón de BuchiSapa a tus eventos de empresa, aniversarios corporativos o reuniones familiares masivas.</p>
      <p>Ofrecemos bandejas de bocaditos amazónicos (mini juanes, brochetas de cecina con tacacho, tequeños rellenos de queso artesanal) y combos masivos de pollo broaster al carbón.</p>
      <p>Escríbenos a <strong>buchisapaweb@gmail.com</strong> para cotizaciones a medida.</p>
    `
  },
  fiestas: {
    categoria: "SERVICIOS",
    title: "Fiestas Infantiles y Paquetes Especiales",
    content: `
      <p>Contamos con combos infantiles adaptados: tiras de pechuga broaster sin picante, papas nativas doradas, refrescos naturales de camu camu o maracuyá y sorpresas temáticas.</p>
    `
  },
  giftcards: {
    categoria: "SERVICIOS",
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
    categoria: "INFORMACIÓN ADICIONAL",
    title: "Valores Nutricionales e Insumos",
    content: `
      <p>En BuchiSapa nos esforzamos por brindar alimentos nutritivos y balanceados. Nuestro pollo se marina en hierbas naturales y especias sin conservantes artificiales.</p>
      <p>Utilizamos aceites vegetales de primer uso para frituras limpias y crujientes, garantizando un sabor puro y saludable.</p>
    `
  },
  privacidad: {
    categoria: "POLÍTICAS Y TÉRMINOS",
    title: "Políticas de Privacidad y Protección de Datos",
    content: `
      <p>De conformidad con la Ley N° 29733 de Protección de Datos Personales en el Perú, BuchiSapa garantiza la confidencialidad y protección de los datos suministrados por nuestros comensales.</p>
      <p>Los datos como nombre, dirección de entrega, teléfono y correo electrónico son utilizados exclusivamente para la gestión de su pedido, emisión de comprobantes y notificaciones sobre el estado de su delivery.</p>
    `
  },
  terminos: {
    categoria: "POLÍTICAS Y TÉRMINOS",
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
  terminos_giftcard: {
    categoria: "POLÍTICAS Y TÉRMINOS",
    title: "Términos de Vales y Giftcards",
    content: `
      <p>Los vales corporativos y giftcards digitales no son canjeables por dinero en efectivo. En caso de saldos remanentes, estos permanecerán activos en la tarjeta hasta la fecha de expiración.</p>
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
  const datos = INFORMACION_DATA[sectionKey] || INFORMACION_DATA['historia'];
  
  const badgeEl = document.getElementById('info-badge');
  const titleEl = document.getElementById('info-title');
  const bodyEl = document.getElementById('info-body');

  if (badgeEl) badgeEl.textContent = datos.categoria;
  if (titleEl) titleEl.textContent = datos.title;
  if (bodyEl) bodyEl.innerHTML = datos.content;

  // Actualizar clase activa en enlaces laterales
  document.querySelectorAll('.info-nav-link').forEach(link => {
    if (link.dataset.section === sectionKey) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Actualizar título de la ventana
  document.title = `${datos.title} | BuchiSapa Restaurante`;
  
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
