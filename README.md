# BuchiSapa - Pollería & Sabor Amazónico 🍗🌿

Sistema web oficial, plataforma de pedidos online, carta digital interactiva y panel de administración para **Restaurante BuchiSapa** (Santa Clara, Ate - Lima).

---

## 🚀 Novedades y Mejoras Dinámicas

1. **Barra Dinámica de Categorías Rápidas (Pills Interactivos):**
   - Acceso inmediato en un toque: *Todos, Platos Amazónicos, Broaster, Hamburguesas, Salchipapas, Alitas, Bebidas, Refrescos e Infusiones*.
   - Desplazamiento táctil fluido y filtrado instantáneo.
3. **Gestos Táctiles (Swipe) en Carrusel de Portada:**
   - Desliza hacia la izquierda o derecha en teléfonos móviles para cambiar los banners de portada.
   - Pausa automática al interactuar y reanudación fluida.
4. **Botón Flotante de Carrito Dinámico (Bottom Action Bar):**
   - Aparece suavemente al tener platos en el carrito con contador en tiempo real, monto acumulado en Soles y micro-animación de rebote al sumar nuevos platos.
5. **Notificaciones Toast y Sintetizador de Audio (Web Audio API):**
   - Chime sonoro de confirmación sintetizado con osciladores de audio (sin latencia ni descargas pesadas).
   - Mensajes flotantes de confirmación al agregar platos o al recibir actualizaciones de cocina.
6. **Rastreador Dinámico de Pedido en Curso:**
   - Detecta pedidos activos en el dispositivo y muestra un banner flotante con acceso directo al seguimiento GPS en tiempo real.
7. **PWA (Progressive Web App):**
   - Configuración completa de `manifest.json`, iconos y Service Worker (`sw.js`) para instalación en pantalla de inicio de Android e iOS.

---

## 🛠️ Flujos de GitHub Actions Configurados

El repositorio incluye automatizaciones listas para producción en `.github/workflows/`:

- **`.github/workflows/ci.yml` (Integración Continua):**
  - Se ejecuta en cada `push` o `pull request` a las ramas `main` o `master`.
  - Instala dependencias con Node.js 20.
  - Verifica TypeScript (`npm run lint`).
  - Compila HTML con inyección de parciales y construye los bundles de servidor y cliente (`npm run build`).
  - Almacena artefactos de distribución listos para descarga.

- **`.github/workflows/deploy.yml` (Despliegue a GitHub Pages / Web):**
  - Despliega automáticamente la versión compilada en `dist/` a GitHub Pages o como artefacto web.

---

## 📦 Opciones de Despliegue

### 1. Despliegue en Vercel (Recomendado)
El proyecto cuenta con `vercel.json` y `/api/index.ts` configurados para arquitectura Serverless:
```bash
npx vercel
```

### 2. Despliegue en Docker / Cloud Run / VPS
Utiliza el `Dockerfile` optimizado multi-etapa:
```bash
docker build -t buchisapa .
docker run -p 3000:3000 buchisapa
```

### 3. Ejecución Local / Servidor Node.js
```bash
npm install
npm run dev        # Servidor de desarrollo en puerto 3000
npm run build      # Compilación completa para producción
npm start          # Iniciar servidor Node.js de producción (dist/server.cjs)
```

---

## 📍 Rutas Principales del Sistema

- `/` - Carta digital para clientes, pedidos delivery y recojo.
- `/admin` - Panel administrativo (gestión de stock, portadas, promociones, caja y ventas).
- `/kitchen` - Pantalla KDS para personal de cocina en tiempo real (con sonido y tickets).
- `/order-status.html` - Seguimiento de pedidos con mapa en vivo y estado.
- `/ubicacion` - Mapa interactivo con geolocalización de entrega en Ate / Santa Clara.
- `/reclamaciones` - Libro de reclamaciones digital según normativa peruana.
