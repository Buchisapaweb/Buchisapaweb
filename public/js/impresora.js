/**
 * Buchisapa Ticket & Thermal Printer Shared Utility
 * Centralizes ticket text generation, HTML receipt generation,
 * WiFi direct printing, and ping diagnostics across Admin and Kitchen (KDS).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BuchisapaPrinter = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_IP = '192.168.8.100';
  const STORAGE_KEY = 'buchisapa_printer_ip';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getPrinterIp() {
    try {
      const input = typeof document !== 'undefined' ? document.getElementById('setting-printer-ip') : null;
      if (input && input.value && input.value.trim()) {
        return input.value.trim();
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_IP;
      }
    } catch (e) {}
    return DEFAULT_IP;
  }

  function setPrinterIp(ip) {
    const cleanIp = (ip || '').trim() || DEFAULT_IP;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, cleanIp);
      }
    } catch (e) {}
    return cleanIp;
  }

  function normalizeOrderItems(order) {
    if (!order) return [];
    if (Array.isArray(order.items)) return order.items;
    if (typeof order.items === 'string') {
      try {
        const parsed = JSON.parse(order.items);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.items)) return parsed.items;
      } catch (e) {}
    }
    if (order.items && Array.isArray(order.items.items)) {
      return order.items.items;
    }
    return [];
  }

  function extractOrderDetails(order) {
    const o = order || {};
    const orderNum = o.order_number || o.orderNumber || (o.id ? String(o.id).replace(/\D/g, '').slice(-4) : '1132') || '1132';
    const rawDate = o.created_at || o.createdAt;
    const dateObj = rawDate ? new Date(rawDate) : new Date();
    
    // Formato fecha: DD/MM/AAAA
    let day = dateObj.getDate().toString().padStart(2, '0');
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    let year = dateObj.getFullYear();
    const fecha = `${day}/${month}/${year}`;

    // Formato hora: hh:mm:ss p. m.
    let hours24 = dateObj.getHours();
    let minutes = dateObj.getMinutes().toString().padStart(2, '0');
    let seconds = dateObj.getSeconds().toString().padStart(2, '0');
    let ampm = hours24 >= 12 ? 'p. m.' : 'a. m.';
    let hours12 = (hours24 % 12 || 12).toString().padStart(2, '0');
    const hora = `${hours12}:${minutes}:${seconds} ${ampm}`;

    const cliente = o.customer_name || o.customerName || o.cliente || 'Cliente';
    const estado = o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase()) : 'Pendiente';
    const telefono = o.customer_phone || o.customerPhone || o.phone || '';
    const tipo = (o.order_type || o.orderType || o.tipo || 'Delivery');
    const direccion = o.delivery_address || o.address || o.direccion || '';
    const pago = (o.payment_method || o.paymentMethod || o.payment || 'Efectivo');
    const items = normalizeOrderItems(o);

    let totalCalculated = 0;
    let totalItemsCount = 0;
    items.forEach(i => {
      const q = parseInt(i.cant || i.quantity || 1) || 1;
      const p = parseFloat(i.precio || i.price || (i.item && i.item.price) || 0);
      totalCalculated += (q * p);
      totalItemsCount += q;
    });

    const total = o.total ? parseFloat(o.total).toFixed(2) : (totalCalculated > 0 ? totalCalculated.toFixed(2) : '13.00');
    if (totalItemsCount === 0) totalItemsCount = 1;

    return {
      orderNum,
      fecha,
      hora,
      cliente,
      estado,
      telefono,
      tipo,
      direccion,
      pago,
      total,
      totalItemsCount,
      items
    };
  }

  function buildTicketString(order) {
    const d = extractOrderDetails(order);

    const itemsText = d.items.length > 0
      ? d.items.map(i => {
          const cant = parseInt(i.cant || i.quantity || 1) || 1;
          const nombre = i.nombre || i.name || (i.item && i.item.name) || 'Encuentro';
          const precio = parseFloat(i.precio || i.price || (i.item && i.item.price) || 0).toFixed(2);
          const sub = (cant * parseFloat(precio)).toFixed(2);
          return `${cant} ${nombre}\n S/ ${precio} c/u                                   S/ ${sub}`;
        }).join('\n')
      : `1 Encuentro\n S/ ${d.total} c/u                                   S/ ${d.total}`;

    return `          [ LOGO BUCHISAPA ]

              BUCHISAPA
          Sabor que te llena
   Comida Amazónica, Broaster &
            Hamburguesas

          RUC: 10757052569
  Av. La Estrella con Calle 28 Julio
         Esquina de la Posta
  A 1 cdra. de Real Plaza Santa Clara
          Tel: 943 312 024
----------------------------------------
            TICKET DE VENTA

Pedido                                     #${d.orderNum}
Fecha                                 ${d.fecha}
Hora                              ${d.hora}
Cliente                                ${d.cliente}
Estado                                 ${d.estado}
----------------------------------------
${itemsText}
----------------------------------------
Items                                          ${d.totalItemsCount}

TOTAL                                  S/ ${d.total}
----------------------------------------
         Gracias por su compra
           www.buchisapa.com
`;
  }

  function formatTicketHtml(order) {
    const d = extractOrderDetails(order);

    let itemsHtml = '';
    if (d.items.length > 0) {
      itemsHtml = d.items.map(i => {
        const cant = parseInt(i.cant || i.quantity || 1) || 1;
        const nombre = escapeHtml(i.nombre || i.name || (i.item && i.item.name) || 'Encuentro');
        const precio = parseFloat(i.precio || i.price || (i.item && i.item.price) || 0).toFixed(2);
        const sub = (cant * parseFloat(precio)).toFixed(2);
        return `
          <div style="margin-bottom: 6px; font-family: 'Courier New', Courier, monospace;">
            <div style="font-weight: 700; font-size: 13.5px; color: #000000;">${cant} ${nombre}</div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #1e293b; margin-top: 2px;">
              <span style="padding-left: 12px;">S/ ${precio} c/u</span>
              <span style="font-weight: 700;">S/ ${sub}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      itemsHtml = `
        <div style="margin-bottom: 6px; font-family: 'Courier New', Courier, monospace;">
          <div style="font-weight: 700; font-size: 13.5px; color: #000000;">1 Encuentro</div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #1e293b; margin-top: 2px;">
            <span style="padding-left: 12px;">S/ ${d.total} c/u</span>
            <span style="font-weight: 700;">S/ ${d.total}</span>
          </div>
        </div>
      `;
    }

    return `
      <div style="width: 100%; max-width: 310px; margin: 0 auto; font-family: 'Courier New', Courier, monospace; color: #000000; font-size: 13px; line-height: 1.35; padding: 2px 4px; box-sizing: border-box;">
        
        <!-- LOGO OFICIAL BUCHISAPA -->
        <div style="text-align: center; margin-bottom: 10px;">
          <img src="/imagenes/logo/logo-buchisapa.png" alt="Buchisapa" style="width: 125px; height: auto; display: block; margin: 0 auto; filter: grayscale(100%) contrast(150%);" onerror="this.onerror=null; this.src='/imagenes/logo/logo-buchisapa.png'">
        </div>

        <!-- ENCABEZADO FISCAL Y DIRECCIÓN -->
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="font-size: 17px; font-weight: 900; letter-spacing: 1.5px; margin-bottom: 4px;">BUCHISAPA</div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">Sabor que te llena</div>
          <div style="font-size: 12px; margin-bottom: 6px; line-height: 1.25;">Comida Amazónica, Broaster &<br>Hamburguesas</div>
          
          <div style="font-size: 12.5px; font-weight: 700; margin-bottom: 3px;">RUC: 10757052569</div>
          <div style="font-size: 12px; line-height: 1.25;">Av. La Estrella con Calle 28 Julio<br>Esquina de la Posta</div>
          <div style="font-size: 11.5px; margin-top: 2px;">A 1 cdra. de Real Plaza Santa Clara</div>
          <div style="font-size: 12.5px; margin-top: 3px;">Tel: 943 312 024</div>
        </div>

        <!-- SEPARADOR DISCONTINUO -->
        <div style="border-top: 1px dashed #000000; margin: 10px 0;"></div>

        <!-- TÍTULO DE VENTA -->
        <div style="text-align: center; font-size: 14px; font-weight: 900; letter-spacing: 1px; margin: 8px 0 10px 0;">
          TICKET DE VENTA
        </div>

        <!-- METADATOS DEL PEDIDO -->
        <div style="font-size: 13px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Pedido</span>
            <span style="font-weight: 700;">#${escapeHtml(d.orderNum)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Fecha</span>
            <span>${escapeHtml(d.fecha)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Hora</span>
            <span>${escapeHtml(d.hora)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Cliente</span>
            <span>${escapeHtml(d.cliente)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Estado</span>
            <span>${escapeHtml(d.estado)}</span>
          </div>
        </div>

        <!-- SEPARADOR DISCONTINUO -->
        <div style="border-top: 1px dashed #000000; margin: 10px 0;"></div>

        <!-- DETALLE DE PRODUCTOS -->
        <div style="margin: 8px 0;">
          ${itemsHtml}
        </div>

        <!-- SEPARADOR DISCONTINUO -->
        <div style="border-top: 1px dashed #000000; margin: 10px 0;"></div>

        <!-- RESUMEN DE ITEMS Y TOTAL -->
        <div style="margin: 8px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 8px;">
            <span>Items</span>
            <span style="font-weight: 700;">${d.totalItemsCount}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 900; letter-spacing: 0.5px; margin-top: 6px;">
            <span>TOTAL</span>
            <span>S/ ${d.total}</span>
          </div>
        </div>

        <!-- SEPARADOR DISCONTINUO -->
        <div style="border-top: 1px dashed #000000; margin: 12px 0;"></div>

        <!-- PIE DE TICKET -->
        <div style="text-align: center; font-size: 12px; margin-top: 10px; line-height: 1.4;">
          <div style="margin-bottom: 2px;">Gracias por su compra</div>
          <div style="font-weight: 700;">www.buchisapa.com</div>
        </div>

      </div>
    `;
  }

  function printTicketNative(order) {
    if (!order) return;
    const ticketHtml = formatTicketHtml(order);

    // 1. Intentar imprimir usando un iframe aislado con estilos limpios para móvil
    try {
      let printFrame = document.getElementById('buchisapa-native-print-frame');
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'buchisapa-native-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        printFrame.style.visibility = 'hidden';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow ? printFrame.contentWindow.document : (printFrame.contentDocument || null);
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket #${extractOrderDetails(order).orderNum}</title>
  <link rel="stylesheet" href="/css/impresora.css">
</head>
<body class="print-ticket-body">
  ${ticketHtml}
</body>
</html>`);
        frameDoc.close();

        // Esperar a que rendericen las imágenes y disparar impresión
        setTimeout(() => {
          try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
          } catch (e) {
            window.print();
          }
        }, 300);
        return true;
      }
    } catch (err) {
      console.warn('Fallback a window.print():', err);
    }

    // Fallback nativo
    window.print();
    return true;
  }

  function openTicketInNewTab(order) {
    if (!order) return;
    const ticketHtml = formatTicketHtml(order);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket de Venta #${extractOrderDetails(order).orderNum} - Buchisapa</title>
  <link rel="stylesheet" href="/css/impresora.css">
</head>
<body class="preview-ticket-body">
  <div class="ticket-wrapper">
    ${ticketHtml}
  </div>
  <div class="actions-bar">
    <button class="btn-act btn-print" onclick="window.print()">🖨️ Imprimir</button>
    <button class="btn-act btn-close" onclick="window.close()">Cerrar</button>
  </div>
</body>
</html>`);
      win.document.close();
    }
  }

  function ensureHiddenPrintIframe() {
    if (typeof document === 'undefined') return null;
    let hiddenIframe = document.querySelector('iframe[name="print_hidden"]');
    if (!hiddenIframe) {
      hiddenIframe = document.createElement('iframe');
      hiddenIframe.name = 'print_hidden';
      hiddenIframe.id = 'print_hidden';
      hiddenIframe.style.display = 'none';
      document.body.appendChild(hiddenIframe);
    }
    return hiddenIframe;
  }

  function sendRawToWifiPrinter(ticketText, printerIp) {
    const ip = printerIp || getPrinterIp();
    ensureHiddenPrintIframe();

    if (typeof document === 'undefined') return;
    const form = document.createElement('form');
    form.action = `http://${ip}`;
    form.method = 'POST';
    form.target = 'print_hidden';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'printcontent';
    input.value = ticketText;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      if (form.parentNode) form.parentNode.removeChild(form);
    }, 1000);
  }

  async function pingPrinter(printerIp) {
    const ip = printerIp || getPrinterIp();
    const startTime = Date.now();

    // 1. Sondeo directo cliente (LAN)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch(`http://${ip}/?ping_t=${Date.now()}`, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      return {
        reachable: true,
        latencyMs,
        scope: 'client',
        ip,
        message: `✓ Conexión LAN directa con la impresora (${ip}) exitosa`
      };
    } catch (clientErr) {}

    // 2. Consulta de diagnóstico al servidor
    try {
      const res = await fetch(`/api/printer/ping?ip=${encodeURIComponent(ip)}&port=80`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (serverErr) {}

    const totalLatency = Date.now() - startTime;
    return {
      reachable: false,
      latencyMs: totalLatency,
      scope: 'both',
      ip,
      message: `Sin respuesta en http://${ip}:80`
    };
  }

  return {
    DEFAULT_IP,
    escapeHtml,
    getPrinterIp,
    setPrinterIp,
    extractOrderDetails,
    buildTicketString,
    formatTicketHtml,
    sendRawToWifiPrinter,
    pingPrinter,
    printTicketNative,
    openTicketInNewTab
  };
});
