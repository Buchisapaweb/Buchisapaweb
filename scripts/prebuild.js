import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🧹 Iniciando script de auto-curación de estructura para Vercel...');

// 1. Asegurar directorios base
const directoriesToEnsure = ['frontend', 'backend'];
for (const dir of directoriesToEnsure) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 2. Mapeo de auto-curación: [Ruta origen raíz, Ruta destino organizada]
const healMap = [
  { src: 'src', dest: 'backend/src' },
  { src: 'data', dest: 'backend/data' },
  { src: 'public', dest: 'frontend/public' },
  { src: 'admin', dest: 'frontend/admin' },
  { src: 'index.html', dest: 'frontend/index.html' },
  { src: 'vite.config.ts', dest: 'frontend/vite.config.ts' }
];

for (const pair of healMap) {
  const srcPath = path.join(ROOT_DIR, pair.src);
  const destPath = path.join(ROOT_DIR, pair.dest);

  // Si el destino no existe, pero el origen sí existe en la raíz, curamos la estructura copiándolo
  if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
    console.log(`➡️ Auto-curación: Copiando "${pair.src}" a "${pair.dest}"...`);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`✅ Estructura curada para: ${pair.dest}`);
  }
}

console.log('🎉 Estructura lista para compilar.');
