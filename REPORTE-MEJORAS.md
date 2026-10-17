# Reporte de mejoras — BuchiSapa

Fecha: 16 de octubre de 2026

## Corregido

- Se agregó `interfaz/src/javascript/carrusel-portada.js`, que no existía aunque el HTML y CSS del carrusel estaban presentes.
- El carrusel de portadas ahora cambia automáticamente cada 5 segundos.
- Se habilitó la navegación manual mediante puntos y flechas.
- Se añadió soporte para deslizar con el dedo en móviles y usar las flechas del teclado.
- El carrusel se pausa cuando el usuario pasa el cursor, enfoca sus controles o cambia a otra pestaña.
- Se respeta la preferencia del sistema para reducir movimiento.
- Los indicadores ahora son botones accesibles para teclado y lectores de pantalla.
- Se actualizó la versión de caché del CSS del carrusel y se agregó el nuevo JavaScript a `index.html`.

## Comprobaciones realizadas

- Se verificó que los cuatro pares de imágenes de portada (móvil y escritorio) existen en el ZIP.
- Se validó el formato de los archivos JSON del proyecto.
- Se ejecutó `node --check` sobre los archivos JavaScript del frontend y scripts; no se detectaron errores de sintaxis.

## Limitaciones de esta revisión

- No se pudo completar `npm install` en el entorno de revisión, por lo que no fue posible ejecutar la compilación completa ni la verificación de TypeScript.
- El ZIP contiene carpetas de productos con `.gitkeep` pero sin imágenes individuales en varias categorías. El catálogo ya intenta usar el banner de la categoría como alternativa cuando falla la imagen de un producto; se recomienda agregar las imágenes finales para evitar mostrar banners en las tarjetas.
- No se modificaron las reglas de autenticación del panel ni las credenciales del servidor en esta entrega para evitar bloquear el acceso administrativo sin probar el flujo real de inicio de sesión. Se recomienda una auditoría de seguridad independiente antes de producción.
