import fs from 'fs';
import path from 'path';
import { PortadaBanner } from './types.js';

const PORTADAS_DIR = path.join(process.cwd(), 'data', 'portadas');
const PORTADAS_FILE = path.join(process.cwd(), 'data', 'portadas.json');

export const initialPortadas: PortadaBanner[] = [
  {
    id: 'PT001',
    title: 'Portada PT001',
    image: '/imagenes/portada/Portada1E.webp',
    imageMobile: '/imagenes/portada/Portada1M.webp',
    active: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT002',
    title: 'Portada PT002',
    image: '/imagenes/portada/Portada2E.webp',
    imageMobile: '/imagenes/portada/Portada2M.webp',
    active: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT003',
    title: 'Portada PT003',
    image: '/imagenes/portada/Portada3E.webp',
    imageMobile: '/imagenes/portada/Portada3M.webp',
    active: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT004',
    title: 'Portada PT004',
    image: '/imagenes/portada/Portada4E.webp',
    imageMobile: '/imagenes/portada/Portada4M.webp',
    active: true,
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT005',
    title: 'Portada PT005',
    image: '/imagenes/portada/Portada5E.webp',
    imageMobile: '/imagenes/portada/Portada5M.webp',
    active: true,
    order: 5,
    createdAt: new Date().toISOString()
  }
];

export function loadPortadasFromDisk(): PortadaBanner[] {
  try {
    const targetDir = path.join(process.cwd(), 'public', 'imagenes', 'portada');
    const distDir = path.join(process.cwd(), 'dist', 'imagenes', 'portada');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    for (let i = 1; i <= 10; i++) {
      const eFile = path.join(targetDir, `Portada${i}E.webp`);
      const mFile = path.join(targetDir, `Portada${i}M.webp`);

      const eExist = fs.existsSync(eFile) && fs.statSync(eFile).size > 500;
      const mExist = fs.existsSync(mFile) && fs.statSync(mFile).size > 500;

      if (!eExist && mExist) {
        try { fs.copyFileSync(mFile, eFile); } catch (e) {}
      } else if (eExist && !mExist) {
        try { fs.copyFileSync(eFile, mFile); } catch (e) {}
      }

      if (fs.existsSync(eFile) && fs.statSync(eFile).size > 500) {
        try { fs.copyFileSync(eFile, path.join(distDir, `Portada${i}E.webp`)); } catch (e) {}
      }
      if (fs.existsSync(mFile) && fs.statSync(mFile).size > 500) {
        try { fs.copyFileSync(mFile, path.join(distDir, `Portada${i}M.webp`)); } catch (e) {}
      }
    }

    if (fs.existsSync(PORTADAS_DIR)) {
      const files = fs.readdirSync(PORTADAS_DIR).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        const loaded: PortadaBanner[] = [];
        for (const file of files) {
          try {
            const raw = fs.readFileSync(path.join(PORTADAS_DIR, file), 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id) {
              loaded.push(parsed);
            }
          } catch (e) {}
        }
        if (loaded.length > 0) {
          return loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      }
    }

    if (fs.existsSync(PORTADAS_FILE)) {
      const raw = fs.readFileSync(PORTADAS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!fs.existsSync(PORTADAS_DIR)) fs.mkdirSync(PORTADAS_DIR, { recursive: true });
        for (const p of parsed) {
          try {
            fs.writeFileSync(path.join(PORTADAS_DIR, `${p.id}.json`), JSON.stringify(p, null, 2), 'utf-8');
          } catch (e) {}
        }
        return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    }
  } catch (err) {
    console.warn('No se pudo cargar portadas de disco, usando iniciales:', err);
  }

  try {
    if (!fs.existsSync(PORTADAS_DIR)) fs.mkdirSync(PORTADAS_DIR, { recursive: true });
    for (const p of initialPortadas) {
      fs.writeFileSync(path.join(PORTADAS_DIR, `${p.id}.json`), JSON.stringify(p, null, 2), 'utf-8');
    }
  } catch (e) {}

  return [...initialPortadas];
}

export function savePortadasToDisk() {
  try {
    if (!fs.existsSync(PORTADAS_DIR)) {
      fs.mkdirSync(PORTADAS_DIR, { recursive: true });
    }

    const currentIds = new Set(portadasStore.map(p => p.id));
    for (const p of portadasStore) {
      const filePath = path.join(PORTADAS_DIR, `${p.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(p, null, 2), 'utf-8');
    }

    const filesOnDisk = fs.readdirSync(PORTADAS_DIR).filter(f => f.endsWith('.json'));
    for (const file of filesOnDisk) {
      const id = path.basename(file, '.json');
      if (!currentIds.has(id)) {
        try { fs.unlinkSync(path.join(PORTADAS_DIR, file)); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Error al guardar portadas en disco:', err);
  }
}

let portadasStore: PortadaBanner[] = loadPortadasFromDisk();

export async function getPortadas(includeInactive = false): Promise<PortadaBanner[]> {
  let list = [...portadasStore];
  if (!includeInactive) {
    list = list.filter(p => p.active);
  }
  return list.sort((a, b) => a.order - b.order);
}

export async function getPortadaById(id: string): Promise<PortadaBanner | null> {
  const p = portadasStore.find(item => item.id === id);
  return p || null;
}

export function savePortadaImageBase64(base64Str: string, slideNumber: number, type: 'E' | 'M'): string {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
    return base64Str;
  }
  try {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const targetDir = path.join(process.cwd(), 'public', 'imagenes', 'portada');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const fileName = `Portada${slideNumber}${type}.webp`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const otherType = type === 'E' ? 'M' : 'E';
    const otherFileName = `Portada${slideNumber}${otherType}.webp`;
    const otherFilePath = path.join(targetDir, otherFileName);
    fs.writeFileSync(otherFilePath, buffer);

    return `/imagenes/portada/${fileName}`;
  } catch (e) {
    console.error('Error saving portada image:', e);
    return base64Str;
  }
}

export async function createPortada(data: Partial<PortadaBanner>): Promise<PortadaBanner> {
  const slideNum = data.order || (portadasStore.length + 1);
  let finalImage = data.image || `/imagenes/portada/Portada${slideNum}E.webp`;
  let finalImageMobile = data.imageMobile || `/imagenes/portada/Portada${slideNum}M.webp`;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, slideNum, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, slideNum, 'M');
  }

  const codeStr = data.id || `PT${String(slideNum).padStart(3, '0')}`;
  const newPortada: PortadaBanner = {
    id: codeStr,
    title: data.title || `Portada ${codeStr}`,
    highlight: data.highlight || '',
    subtitle: data.subtitle || 'Promoción especial BuchiSapa Burger & Broaster',
    badge: data.badge || '✨ DESTACADO',
    badgeType: data.badgeType || 'red-pill',
    image: finalImage,
    imageMobile: finalImageMobile,
    secretPillIcon: data.secretPillIcon || '💡',
    secretPillText: data.secretPillText || '',
    buttonText: data.buttonText || 'VER CARTA',
    buttonCategory: data.buttonCategory || 'todos',
    features: data.features || ['✦ SABOR AMAZÓNICO', '🔥 PREPARADO AL MOMENTO'],
    active: data.active !== undefined ? data.active : true,
    order: data.order !== undefined ? data.order : portadasStore.length + 1,
    createdAt: new Date().toISOString()
  };

  portadasStore.push(newPortada);
  savePortadasToDisk();
  return newPortada;
}

export async function updatePortada(id: string, data: Partial<PortadaBanner>): Promise<PortadaBanner | null> {
  const index = portadasStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const current = portadasStore[index];
  const slideNum = data.order || current.order || (index + 1);

  let finalImage = data.image !== undefined ? data.image : current.image;
  let finalImageMobile = data.imageMobile !== undefined ? data.imageMobile : current.imageMobile;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, slideNum, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, slideNum, 'M');
  }

  portadasStore[index] = {
    ...current,
    ...data,
    image: finalImage,
    imageMobile: finalImageMobile,
    updatedAt: new Date().toISOString(),
    id
  };
  savePortadasToDisk();
  return portadasStore[index];
}

export async function deletePortada(id: string): Promise<boolean> {
  const initialLength = portadasStore.length;
  portadasStore = portadasStore.filter(item => item.id !== id);
  portadasStore.forEach((p, idx) => {
    p.order = idx + 1;
  });
  savePortadasToDisk();
  return portadasStore.length < initialLength;
}

export async function reorderPortadas(orderedIds: string[]): Promise<PortadaBanner[]> {
  orderedIds.forEach((id, index) => {
    const p = portadasStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  savePortadasToDisk();
  return portadasStore.sort((a, b) => a.order - b.order);
}
