# BuchiSapa — estructura actualizada

- `interfaz/src/componentes/`: solo HTML de componentes, directamente en la carpeta.
- `interfaz/src/paginas/`: solo HTML de páginas, directamente en la carpeta.
- `interfaz/src/estilos/`: todos los CSS del cliente, incluidos los estilos específicos de cada página.
- `interfaz/src/javascript/`: todos los JS del cliente, incluidos los scripts específicos de cada página.
- `interfaz/src/recursos/imagenes/`: logo, 4 portadas (E/M) y las 10 categorías.
- `datos/`: `categorias.json` y `productos.json` como catálogo estructurado y respaldo del cliente.
- `servidor/`: TypeScript de backend y acceso a Supabase.
- `publico/`: solo recursos técnicos estáticos necesarios: manifiesto PWA y trabajador de servicio. No contiene CSS/JS duplicados del cliente.
- `scripts/compilar-html.js`: genera `dist` sin crear carpetas duplicadas por página.

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

Solo existen cuatro portadas, cada una en versión escritorio (E) y móvil (M): Portada1, Portada2, Portada3 y Portada4.

## Regla de compilación

Las páginas fuente permanecen separadas por responsabilidad: HTML en `paginas`, CSS en `estilos` y JS en `javascript`. La compilación genera una sola copia pública de cada recurso en `dist`.
