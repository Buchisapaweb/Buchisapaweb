# BuchiSapa - Pollería & Sabor Amazónico

Sistema de pedidos y gestión de restaurante para **BuchiSapa (Burger, Broaster & Sabor Amazónico)** en Lima (Santa Clara, Ate) y Tarapoto.

## 🚀 Características Principales

1. **Carta & Menú Digital**:
   - Catálogo completo con 10 categorías (Promociones, Alitas, Bebidas, Broaster, Hamburguesas, Infusiones, Platos Amazónicos, Refrescos de Frutas de la Selva, Salchipapas y Adicionales).
   - Búsqueda en tiempo real por nombre o ingredientes.
   - Filtros dinámicos por categorías.

2. **Personalizador de Platos**:
   - Selección de guarniciones incluidas (Papa crocante, arroz, ensalada fresca).
   - Selección de cremas de la casa (Mayonesa, Ají de Rocoto, Tártara, Mostaza, Salsa Golf).
   - Adicionales y extras (Huevo a la plancha, queso fundido, tocino, plátano maduro).
   - Instrucciones especiales de preparación para cocina.

3. **Carrito & Checkout**:
   - 3 Modalidades de entrega: **Delivery a Domicilio**, **Recojo en Tienda** y **Consumo en Mesa**.
   - Múltiples métodos de pago: **Efectivo** (con cálculo de vuelto), **Yape / Plin** y **Tarjeta**.
   - Resumen y cálculo automático de subtotales y costos de envío.

4. **Seguimiento de Pedidos en Vivo (Comandas)**:
   - Stepper en tiempo real: *Recibido* ➔ *En Cocina* ➔ *En Camino / Listo* ➔ *Entregado*.
   - Historial detallado de pedidos por cliente.

5. **Ticket Digital & Impresión Térmica**:
   - Generación de comanda con formato de impresora térmica (58mm/80mm).
   - Integración y simulación de impresión WiFi directa (`192.168.8.100:80`).
   - Opción para copiar texto o compartir ticket por WhatsApp.

6. **Libro de Reclamaciones Virtual**:
   - Conforme a los requisitos de INDECOPI en Perú (Ley N° 29571).
   - Registro de Hoja de Reclamación con generación de código único (`REC-XXXX`).

7. **Panel de Administración**:
   - Monitoreo de comandas en vivo y cambio de estados para cocina.
   - Control de stock y disponibilidad de platos (Activo / Agotado).
   - Ajustes del negocio (RUC, dirección, horarios, costo de delivery e IP de impresora).

## 🛠️ Tecnologías

- **Framework**: React 18 + TypeScript + Vite 6
- **Estilos**: Tailwind CSS 4 + Lucide React Icons + Plus Jakarta Sans Font
- **Estado**: React Context + Persistencia en LocalStorage
