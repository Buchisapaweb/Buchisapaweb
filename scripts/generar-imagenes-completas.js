import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const categoryDefs = [
  {
    folder: 'adicionales',
    title: 'ADICIONALES',
    subtitle: 'Papas nativas, platanos maduros, cremas y ensalada fresca',
    emoji: '🍟',
    bg1: '#9a3412',
    bg2: '#ea580c',
    accent: '#fef08a'
  },
  {
    folder: 'alitas',
    title: 'ALITAS',
    subtitle: 'Crujientes baunadas en BBQ, Acevichada, Maracuya y Aji Charapita',
    emoji: '🍗',
    bg1: '#991b1b',
    bg2: '#dc2626',
    accent: '#fed7aa'
  },
  {
    folder: 'bebidas',
    title: 'BEBIDAS',
    subtitle: 'Inca Kola, Coca Cola, Cervezas bien heladas y Aguas',
    emoji: '🥤',
    bg1: '#1e3a8a',
    bg2: '#0284c7',
    accent: '#bae6fd'
  },
  {
    folder: 'broaster',
    title: 'BROASTER',
    subtitle: 'El mas crocante de Santa Clara con papas fritas y cremas',
    emoji: '🍗',
    bg1: '#b45309',
    bg2: '#f59e0b',
    accent: '#fef3c7'
  },
  {
    folder: 'hamburguesas',
    title: 'HAMBURGUESAS',
    subtitle: 'Carne 100% artesanal, queso fundido, huevo y papas al hilo',
    emoji: '🍔',
    bg1: '#831843',
    bg2: '#be185d',
    accent: '#fbcfe8'
  },
  {
    folder: 'infusiones',
    title: 'INFUSIONES',
    subtitle: 'Cafe Chanchamayo pasado, te caliente, anis y manzanilla',
    emoji: '☕',
    bg1: '#451a03',
    bg2: '#78350f',
    accent: '#fde68a'
  },
  {
    folder: 'platos-amazonicos',
    title: 'PLATOS AMAZONICOS',
    subtitle: 'Tacacho con Cecina, Juane tradicional, Chorizo regional y Cocona',
    emoji: '🌿',
    bg1: '#14532d',
    bg2: '#16a34a',
    accent: '#bbf7d0'
  },
  {
    folder: 'promociones',
    title: 'PROMOCIONES',
    subtitle: 'Combos familiares, super promociones y duos con gran descuento',
    emoji: '🔥',
    bg1: '#7f1d1d',
    bg2: '#e11d48',
    accent: '#fef08a'
  },
  {
    folder: 'refrescos',
    title: 'REFRESCOS',
    subtitle: 'Naturales y frescos: Camu Camu, Maracuya, Chicha Morada y Cocona',
    emoji: '🍹',
    bg1: '#701a75',
    bg2: '#a21caf',
    accent: '#f5d0fe'
  },
  {
    folder: 'salchipapas-y-salchibroasters',
    title: 'SALCHIPAPAS Y SALCHIBROASTERS',
    subtitle: 'Porciones generosas con hot dog frankfurter, queso, huevo y pollo',
    emoji: '🌭',
    bg1: '#c2410c',
    bg2: '#f97316',
    accent: '#ffedd5'
  }
];

const portadaDefs = [
  {
    id: 'Portada1',
    title: 'El Autentico Sabor Amazonico',
    badge: 'DELIVERY NOCTURNO HASTA LAS 5:00 AM',
    subtitle: 'Pollo a la Brasa y Platos Selvaticos en Santa Clara, Ate',
    address: 'Av. La Estrella con Calle 28 de Julio | Pedidos: 924 955 869',
    bg1: '#111827',
    bg2: '#b91c1c',
    emoji: '🔥'
  },
  {
    id: 'Portada2',
    title: 'Hamburguesas y Broasters Buchisapa',
    badge: '100% CARNE ARTESANAL Y PAPAS NATIVAS',
    subtitle: 'Crocantes, jugosas y preparadas con nuestras cremas caseras',
    address: 'Atendemos de Lunes a Domingo de 6:00 PM a 5:00 AM',
    bg1: '#1f2937',
    bg2: '#d97706',
    emoji: '🍔'
  },
  {
    id: 'Portada3',
    title: 'Alitas y Combos para Compartir',
    badge: 'SALSAS: BBQ, ACEVICHADA, MARACUYA Y AJI CHARAPITA',
    subtitle: 'Pide en linea y recibe en minutos caliente en tu domicilio',
    address: 'Delivery rapido a Huaycan, Santa Clara y Ate',
    bg1: '#0f172a',
    bg2: '#be123c',
    emoji: '🍗'
  },
  {
    id: 'Portada4',
    title: 'Tacacho con Cecina y Sazon de Selva',
    badge: 'TRADICION AMAZONICA EN LIMA',
    subtitle: 'Platano bellaco majado, cecina ahumada de Tarapoto y aji de cocona',
    address: 'Pide tu combo amazonico y deleitate esta noche',
    bg1: '#064e3b',
    bg2: '#15803d',
    emoji: '🌿'
  }
];

function generateCategorySvg(cat, width = 800, height = 500) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad_${cat.folder}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${cat.bg1}" />
        <stop offset="50%" stop-color="${cat.bg2}" />
        <stop offset="100%" stop-color="${cat.bg1}" />
      </linearGradient>
      <pattern id="grid_${cat.folder}" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
      </pattern>
    </defs>
    
    <rect width="${width}" height="${height}" fill="url(#grad_${cat.folder})" />
    <rect width="${width}" height="${height}" fill="url(#grid_${cat.folder})" />
    
    <circle cx="${width * 0.85}" cy="${height * 0.3}" r="180" fill="rgba(255,255,255,0.08)" />
    <circle cx="${width * 0.15}" cy="${height * 0.85}" r="120" fill="rgba(0,0,0,0.2)" />
    
    <!-- Top Tag -->
    <rect x="40" y="40" width="220" height="32" rx="16" fill="rgba(0,0,0,0.3)" />
    <text x="55" y="61" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="${cat.accent}" letter-spacing="1.5">BUCHISAPA CARTA</text>
    
    <!-- Category Emoji -->
    <text x="${width - 110}" y="110" font-size="64" text-anchor="middle">${cat.emoji}</text>
    
    <!-- Category Title -->
    <text x="40" y="${height * 0.58}" font-family="Georgia, serif" font-weight="900" font-size="44" fill="#ffffff">${escapeXml(cat.title)}</text>
    
    <!-- Category Subtitle -->
    <text x="40" y="${height * 0.72}" font-family="Arial, sans-serif" font-weight="600" font-size="17" fill="${cat.accent}">${escapeXml(cat.subtitle)}</text>
    
    <!-- Bottom Action Pill -->
    <rect x="40" y="${height - 75}" width="200" height="38" rx="19" fill="#ffffff" />
    <text x="60" y="${height - 51}" font-family="Arial, sans-serif" font-weight="900" font-size="13" fill="#111827">VER PLATOS &gt;</text>
  </svg>`;
}

function generatePortadaSvg(port, width, height, isMobile) {
  const titleSize = isMobile ? 36 : 54;
  const subSize = isMobile ? 15 : 22;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pgrad_${port.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${port.bg1}" />
        <stop offset="60%" stop-color="${port.bg2}" />
        <stop offset="100%" stop-color="${port.bg1}" />
      </linearGradient>
      <pattern id="pgrid_${port.id}" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
      </pattern>
    </defs>
    
    <rect width="${width}" height="${height}" fill="url(#pgrad_${port.id})" />
    <rect width="${width}" height="${height}" fill="url(#pgrid_${port.id})" />
    
    <circle cx="${width * 0.88}" cy="${height * 0.5}" r="${isMobile ? 140 : 260}" fill="rgba(255,255,255,0.06)" />
    
    <!-- Badge -->
    <rect x="${isMobile ? 24 : 60}" y="${isMobile ? 30 : 60}" width="${isMobile ? 280 : 400}" height="32" rx="16" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="${isMobile ? 40 : 80}" y="${isMobile ? 51 : 81}" font-family="Arial, sans-serif" font-weight="900" font-size="${isMobile ? 10 : 13}" fill="#fde047" letter-spacing="1">${escapeXml(port.badge)}</text>
    
    <!-- Big Title -->
    <text x="${isMobile ? 24 : 60}" y="${isMobile ? 130 : 180}" font-family="Georgia, serif" font-weight="900" font-size="${titleSize}" fill="#ffffff">${escapeXml(port.title)}</text>
    
    <!-- Subtitle -->
    <text x="${isMobile ? 24 : 60}" y="${isMobile ? 190 : 240}" font-family="Arial, sans-serif" font-weight="600" font-size="${subSize}" fill="#fef08a">${escapeXml(port.subtitle)}</text>
    
    <!-- Details / Address -->
    <text x="${isMobile ? 24 : 60}" y="${isMobile ? 250 : 300}" font-family="Arial, sans-serif" font-weight="400" font-size="${isMobile ? 12 : 16}" fill="#e2e8f0">${escapeXml(port.address)}</text>
    
    <!-- Button -->
    <rect x="${isMobile ? 24 : 60}" y="${isMobile ? height - 85 : height - 120}" width="${isMobile ? 170 : 210}" height="${isMobile ? 44 : 52}" rx="${isMobile ? 22 : 26}" fill="#dc2626" />
    <text x="${isMobile ? 50 : 95}" y="${isMobile ? height - 57 : height - 88}" font-family="Arial, sans-serif" font-weight="900" font-size="${isMobile ? 13 : 16}" fill="#ffffff">PEDIR AHORA &gt;</text>
    
    <!-- Big Emoji -->
    <text x="${width - (isMobile ? 60 : 130)}" y="${height * 0.5 + 20}" font-size="${isMobile ? 70 : 140}" text-anchor="middle">${port.emoji}</text>
  </svg>`;
}

async function run() {
  console.log('Generating category WebP banners...');
  for (const cat of categoryDefs) {
    const svg = generateCategorySvg(cat, 800, 500);
    const buffer = Buffer.from(svg);
    
    const dir1 = path.join(process.cwd(), 'public/imagenes/categorias', cat.folder);
    const dir2 = path.join(process.cwd(), 'interfaz/src/recursos/imagenes/categorias', cat.folder);
    fs.mkdirSync(dir1, { recursive: true });
    fs.mkdirSync(dir2, { recursive: true });
    
    await sharp(buffer).webp({ quality: 90 }).toFile(path.join(dir1, 'banner.webp'));
    await sharp(buffer).webp({ quality: 90 }).toFile(path.join(dir2, 'banner.webp'));
    console.log(`Generated category banner: ${cat.folder}/banner.webp`);
  }

  console.log('Generating portada WebP banners...');
  for (const p of portadaDefs) {
    const desktopSvg = generatePortadaSvg(p, 1280, 560, false);
    const desktopBuf = Buffer.from(desktopSvg);
    
    const mobileSvg = generatePortadaSvg(p, 720, 600, true);
    const mobileBuf = Buffer.from(mobileSvg);

    const dirP1 = path.join(process.cwd(), 'public/imagenes/portada');
    const dirP2 = path.join(process.cwd(), 'interfaz/src/recursos/imagenes/portada');
    fs.mkdirSync(dirP1, { recursive: true });
    fs.mkdirSync(dirP2, { recursive: true });

    await sharp(desktopBuf).webp({ quality: 90 }).toFile(path.join(dirP1, `${p.id}E.webp`));
    await sharp(desktopBuf).webp({ quality: 90 }).toFile(path.join(dirP2, `${p.id}E.webp`));

    await sharp(mobileBuf).webp({ quality: 90 }).toFile(path.join(dirP1, `${p.id}M.webp`));
    await sharp(mobileBuf).webp({ quality: 90 }).toFile(path.join(dirP2, `${p.id}M.webp`));
    console.log(`Generated portada: ${p.id}E & ${p.id}M`);
  }

  console.log('Finished generating all assets successfully!');
}

run().catch(console.error);
