# BuchiSapa - Pollería & Sabor Amazónico (React SPA)

Aplicación web oficial y sistema completo de pedidos para **BuchiSapa** (Santa Clara, Ate - Lima, Perú), reescrita íntegramente en **React 19**, **TypeScript**, **Tailwind CSS v4** y **Vite 6** con backend Node.js / Express.

## 🚀 Arquitectura del Proyecto

- `src/`:
  - `src/components/`:
    - `Header.tsx`: Barra de navegación responsive, selector de modalidad (Delivery / Recojo), contador de carrito y acceso de usuarios.
    - `HeroCarousel.tsx`: Carrusel interactivo de 4 portadas optimizadas en WebP para móvil y escritorio.
    - `CategoryNav.tsx`: Pestañas deslizables de las 10 categorías de la carta con buscador de platos en vivo.
    - `ProductCard.tsx`: Tarjetas de platos con imágenes, badges, precios en S/ y botones de acción.
    - `ProductModal.tsx`: Personalizador interactivo de platillos (selección de guarniciones, cremas caseras ilimitadas y notas de cocina).
    - `CartDrawer.tsx`: Cajón lateral interactivo ("Tu Pedido Buchisapa") con gestión de cantidades, cubiertos y cálculo en tiempo real.
    - `LocationModal.tsx`: Selector de Delivery vs Recojo en Tienda con validación de teléfono, etiquetas rápidas y cobertura en Santa Clara y Ate.
    - `AuthModal.tsx`: Modal unificado para clientes y acceso administrativo.
    - `Footer.tsx`: Pie de página informativo con horario nocturno (6:00 PM a 5:00 AM), formas de pago y enlace al Libro de Reclamaciones.
  - `src/pages/`:
    - `HomePage.tsx`: Carta digital completa y menú agrupado por categorías.
    - `CheckoutPage.tsx`: Flujo de checkout con selección de entrega, datos de contacto y opciones de pago (Yape QR, Plin, Efectivo con vuelto, Tarjeta/POS).
    - `OrderTrackingPage.tsx`: Seguimiento del pedido en vivo (Recibido 📋 -> En Cocina 🧑‍🍳 -> En Camino 🛵 -> Entregado 🍗) con enlace directo a WhatsApp.
    - `ReclamacionesPage.tsx`: Libro de Reclamaciones Virtual oficial del Perú conforme a la normativa de INDECOPI con código autogenerado.
    - `InfoPages.tsx`: Subpáginas de Nosotros, Servicios (Catering y Eventos), Ubicación & Horarios, Políticas de Privacidad y Términos.
    - `AdminPage.tsx`: Panel administrativo completo con 10 módulos (Dashboard de ventas, Pedidos en cocina, Catálogo de productos y categorías, Control de insumos y utensilios, Arqueo de caja chica, Impresión de tickets y comprobantes térmicos 58mm/80mm).
  - `src/context/`:
    - `CartContext.tsx`: Estado global del carrito, cantidades, tipo de pedido y persistencia en localStorage.
    - `AuthContext.tsx`: Autenticación de clientes y sesión administrativa segura.
  - `src/types/`: Interfaces y modelos de datos en TypeScript.
- `datos/`: Catálogos maestros en JSON (categorías, productos, cremas, acompañamientos).
- `public/`: Recursos estáticos, imágenes WebP (`/imagenes`), PWA manifest y service worker.
- `servidor.ts`: Servidor Express full-stack con rutas API (`/api/*`), SSE para pedidos en vivo y middleware SPA de Vite.

## 📦 Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en `http://0.0.0.0:3000` con Vite middlewares.
- `npm run build`: Compila la aplicación React SPA y el bundle del servidor Node.js en `dist/`.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Valida tipos y sintaxis con TypeScript (`tsc --noEmit`).
