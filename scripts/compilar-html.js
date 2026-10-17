import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const source = path.join(root, 'interfaz', 'src');

async function copyDir(from, to) {
  await fs.mkdir(to, { recursive: true });
  await fs.cp(from, to, { recursive: true, force: true });
}

async function readText(file) {
  return fs.readFile(file, 'utf8');
}

async function writeText(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, 'utf8');
}

async function main() {
  await fs.mkdir(dist, { recursive: true });

  // Public URLs used by the existing HTML remain stable.
  await copyDir(path.join(source, 'estilos'), path.join(dist, 'css'));
  await copyDir(path.join(source, 'javascript'), path.join(dist, 'js'));
  await copyDir(path.join(source, 'recursos', 'imagenes'), path.join(dist, 'imagenes'));
  await copyDir(path.join(root, 'datos'), path.join(dist, 'datos'));
  await copyDir(path.join(root, 'publico'), dist);

  // Publish each secondary page at the root so Vercel cleanUrls can resolve it.
  const pagesDir = path.join(source, 'paginas');
  const pageNames = (await fs.readdir(pagesDir)).filter(name => name.endsWith('.html'));
  for (const name of pageNames) {
    await fs.copyFile(path.join(pagesDir, name), path.join(dist, name));
  }

  // Keep the public URL /producto compatible with the existing product-detail links.
  const productDetail = path.join(dist, 'producto-detalle.html');
  await fs.copyFile(productDetail, path.join(dist, 'producto.html'));

  // The home page links to /politicas-privacidad; retain that URL while keeping both source pages.
  const privacyPage = path.join(dist, 'privacidad.html');
  await fs.copyFile(privacyPage, path.join(dist, 'politicas-privacidad.html'));

  // Build the admin page from the maintained modular source files.
  const adminRoot = path.join(source, 'administracion');
  let adminHtml = await readText(path.join(adminRoot, 'administracion.html'));
  const header = await readText(path.join(adminRoot, 'componentes', 'encabezado.html'));
  adminHtml = adminHtml.replace('<!-- PARTIAL: ENCABEZADO -->', header);

  const viewMap = {
    DASHBOARD: 'panel.html',
    CLIENTES: 'clientes.html',
    PRODUCTOS: 'productos.html',
    CATEGORIAS: 'categorias.html',
    PORTADA: 'portada.html',
    PEDIDOS: 'pedidos.html',
    TICKET: 'comprobante.html',
    INSUMOS: 'insumos.html',
    UTENSILIOS: 'utensilios.html',
    CONFIGURACION: 'configuracion.html',
  };
  for (const [view, file] of Object.entries(viewMap)) {
    const marker = `<!-- PARTIAL: VIEW_${view} -->`;
    const fragment = await readText(path.join(adminRoot, 'paginas', file));
    if (!adminHtml.includes(marker)) {
      throw new Error(`Falta el marcador ${marker} en administracion.html`);
    }
    adminHtml = adminHtml.replace(marker, fragment);
  }

  // Avoid shipping a broken script URL: the coordinator is administracion.js.
  adminHtml = adminHtml.replaceAll('/admin/rutas/admin.js', '/admin/rutas/administracion.js');
  await writeText(path.join(dist, 'admin.html'), adminHtml);
  await writeText(path.join(dist, 'administracion.html'), adminHtml);
  await copyDir(path.join(adminRoot, 'estilos'), path.join(dist, 'admin', 'estilos'));
  await copyDir(path.join(adminRoot, 'rutas'), path.join(dist, 'admin', 'rutas'));
  await copyDir(path.join(adminRoot, 'componentes'), path.join(dist, 'admin', 'componentes'));
  await copyDir(path.join(adminRoot, 'paginas'), path.join(dist, 'admin', 'paginas'));

  // Fail the build if a local asset referenced by a published HTML page is missing.
  const htmlFiles = [];
  async function collectHtml(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await collectHtml(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  await collectHtml(dist);
  const missing = [];
  const localAssetPattern = /(?:src|href)=["'](\/(?:css|js|imagenes|admin|manifiesto\.json|trabajador-servicio\.js)[^"'#]*)["']/g;
  for (const file of htmlFiles) {
    const html = await readText(file);
    for (const match of html.matchAll(localAssetPattern)) {
      const urlPath = match[1].split('?')[0];
      const diskPath = path.join(dist, decodeURIComponent(urlPath).replace(/^\//, ''));
      try {
        await fs.access(diskPath);
      } catch {
        missing.push(`${path.relative(dist, file)} -> ${urlPath}`);
      }
    }
  }
  if (missing.length) {
    throw new Error('Recursos locales referenciados que no existen:\n' + missing.map(item => ' - ' + item).join('\n'));
  }

  console.log(`Compilación estática completada: ${pageNames.length + 1} páginas y recursos publicados en dist/.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
