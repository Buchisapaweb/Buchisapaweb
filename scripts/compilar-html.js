import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'publico');
const INTERFAZ_DIR = path.join(ROOT_DIR, 'interfaz', 'src');
const PAGINAS_DIR = path.join(INTERFAZ_DIR, 'paginas');
const ESTILOS_DIR = path.join(INTERFAZ_DIR, 'estilos');
const JAVASCRIPT_DIR = path.join(INTERFAZ_DIR, 'javascript');
const IMAGENES_DIR = path.join(INTERFAZ_DIR, 'recursos', 'imagenes');
const DATOS_DIR = path.join(ROOT_DIR, 'datos');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
}

function readFile(relativePath) {
  const absolute = path.join(ROOT_DIR, relativePath);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
}

function injectPartials(template, partials) {
  for (const [key, relativePath] of Object.entries(partials)) {
    template = template.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), readFile(relativePath));
  }
  return template;
}

export function compileHtml() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  let index = readFile('index.html');
  index = injectPartials(index, {
    ENCABEZADO: 'interfaz/src/componentes/encabezado.html',
    CARRUSEL_PORTADA: 'interfaz/src/componentes/carrusel-portada.html',
    CATEGORIA: 'interfaz/src/componentes/categoria.html',
    LOGIN: 'interfaz/src/componentes/inicio-sesion.html',
    PIE_PAGINA: 'interfaz/src/componentes/pie-pagina.html'
  });

  // Público contiene únicamente recursos técnicos estáticos (manifest y service worker).
  // No se copian aquí páginas, CSS ni JS del interfaz para evitar duplicados.
  copyDirRecursive(PUBLIC_DIR, DIST_DIR);

  // Los estilos y scripts tienen una única ubicación fuente.
  copyDirRecursive(ESTILOS_DIR, path.join(DIST_DIR, 'css'));
  copyDirRecursive(JAVASCRIPT_DIR, path.join(DIST_DIR, 'js'));
  copyDirRecursive(IMAGENES_DIR, path.join(DIST_DIR, 'imagenes'));
  copyDirRecursive(DATOS_DIR, path.join(DIST_DIR, 'datos'));

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), index, 'utf8');

  // Administración: se conserva la URL /admin, pero no se duplican páginas del cliente.
  const adminSrc = path.join(ROOT_DIR, 'interfaz', 'src', 'administracion');
  const adminDest = path.join(DIST_DIR, 'admin');
  copyDirRecursive(adminSrc, adminDest);
  let admin = readFile('interfaz/src/administracion/administracion.html');
  admin = injectPartials(admin, {
    ENCABEZADO: 'interfaz/src/administracion/componentes/encabezado.html',
    VIEW_DASHBOARD: 'interfaz/src/administracion/paginas/panel.html',
    VIEW_CLIENTES: 'interfaz/src/administracion/paginas/clientes.html',
    VIEW_PRODUCTOS: 'interfaz/src/administracion/paginas/productos.html',
    VIEW_CATEGORIAS: 'interfaz/src/administracion/paginas/categorias.html',
    VIEW_PORTADA: 'interfaz/src/administracion/paginas/portada.html',
    VIEW_PEDIDOS: 'interfaz/src/administracion/paginas/pedidos.html',
    VIEW_TICKET: 'interfaz/src/administracion/paginas/comprobante.html',
    VIEW_INSUMOS: 'interfaz/src/administracion/paginas/insumos.html',
    VIEW_UTENSILIOS: 'interfaz/src/administracion/paginas/utensilios.html',
    VIEW_CONFIGURACION: 'interfaz/src/administracion/paginas/configuracion.html'
  });
  fs.writeFileSync(path.join(adminDest, 'index.html'), admin, 'utf8');

  // Cada página del cliente se genera una sola vez en la raíz de dist.
  // No se crean carpetas /carrito, /contacto, etc.
  for (const entry of fs.readdirSync(PAGINAS_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const content = fs.readFileSync(path.join(PAGINAS_DIR, entry.name), 'utf8');
    fs.writeFileSync(path.join(DIST_DIR, entry.name), content, 'utf8');
  }

  console.log('✅ Compilación limpia: componentes directos, páginas HTML directas, CSS/JS centralizados y sin duplicados.');
}

compileHtml();
