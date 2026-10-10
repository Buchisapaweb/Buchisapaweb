# BuchiSapa

Proyecto web y sistema de pedidos de BuchiSapa.

## Organización actual

- `interfaz/src/componentes/`: HTML de componentes compartidos, sin subcarpetas.
- `interfaz/src/paginas/`: HTML de páginas, sin subcarpetas.
- `interfaz/src/estilos/`: todos los CSS del cliente.
- `interfaz/src/javascript/`: todos los JS del cliente.
- `interfaz/src/recursos/imagenes/`: imágenes del proyecto, organizadas por logo, portada y las 10 categorías.
- `datos/categorias.json`: catálogo estructurado de las 10 categorías.
- `datos/productos.json`: catálogo estructurado de los 57 productos.
- `servidor/`: backend TypeScript y utilidades de Supabase.
- `publico/`: únicamente `manifiesto.json` y `trabajador-servicio.js`; no contiene copias del CSS/JS del cliente.

## Categorías

1. adicionales
2. alitas
3. bebidas
4. broaster
5. hamburguesas
6. infusiones
7. platos-amazonicos
8. promociones
9. refrescos
10. salchipapas-y-salchibroasters

## Portadas

El carrusel utiliza únicamente cuatro portadas, cada una en versión escritorio y móvil: `Portada1`, `Portada2`, `Portada3` y `Portada4`.

## Compilación

`npm run construir` genera `dist/` sin crear carpetas duplicadas para cada página. Las páginas se generan directamente como HTML y el CSS/JS se copia desde sus carpetas únicas de origen.
