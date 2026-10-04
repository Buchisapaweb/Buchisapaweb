import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface WebPOptions {
  quality?: number;     // 1-100 (Default: 80)
  maxWidth?: number;    // Default: 1200px
  maxHeight?: number;   // Default: 1200px
  effort?: number;      // 0-6 (Default: 4)
  lossless?: boolean;   // Default: false
}

/**
 * Normaliza y extrae un Buffer a partir de Base64 o Buffer
 */
export function extractImageBuffer(input: string | Buffer): Buffer {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      const commaIndex = input.indexOf(',');
      const base64Str = commaIndex !== -1 ? input.slice(commaIndex + 1) : input;
      return Buffer.from(base64Str, 'base64');
    }
    // Asumir base64 plano si no es URL http o ruta local
    if (!input.startsWith('http://') && !input.startsWith('https://') && !input.startsWith('/')) {
      return Buffer.from(input, 'base64');
    }
  }
  throw new Error('Formato de entrada de imagen no válido para conversión a Buffer');
}

/**
 * Convierte cualquier formato de imagen (JPG, PNG, GIF, BMP, TIFF, SVG, etc.) a WebP optimizado
 */
export async function convertToWebP(
  input: string | Buffer,
  options: WebPOptions = {}
): Promise<Buffer> {
  const {
    quality = 80,
    maxWidth = 1200,
    maxHeight = 1200,
    effort = 4,
    lossless = false
  } = options;

  const buffer = extractImageBuffer(input);

  let transform = sharp(buffer)
    .rotate(); // Auto-rotación según metadatos EXIF

  // Redimensionar si supera las dimensiones máximas preservando relación de aspecto
  transform = transform.resize({
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    withoutEnlargement: true
  });

  // Convertir a WebP
  return await transform
    .webp({
      quality,
      effort,
      lossless
    })
    .toBuffer();
}

/**
 * Guarda una imagen convertida automáticamente a WebP en el sistema de archivos
 * y retorna su ruta relativa pública para guardar en la base de datos
 */
export async function saveAsWebP(
  input: string | Buffer,
  folder: 'productos' | 'categorias' | 'portadas' | 'uploads' | string = 'uploads',
  baseName?: string,
  options: WebPOptions = {}
): Promise<{ url: string; absolutePath: string; size: number }> {
  const webpBuffer = await convertToWebP(input, options);

  const cleanFolder = folder.replace(/[^a-zA-Z0-9-_/]/g, '').replace(/^\/+|\/+$/g, '') || 'uploads';
  const targetDir = path.join(process.cwd(), 'public/imagenes', cleanFolder);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const cleanName = (baseName || `img-${Date.now()}`)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const fileName = `${cleanName}-${Date.now().toString().slice(-4)}.webp`;
  const absolutePath = path.join(targetDir, fileName);

  fs.writeFileSync(absolutePath, webpBuffer);

  const url = `/imagenes/${cleanFolder}/${fileName}`;
  return {
    url,
    absolutePath,
    size: webpBuffer.length
  };
}

/**
 * Procesa automáticamente la propiedad de imagen de un plato, categoría o portada:
 * Si es una imagen en base64, la convierte a .webp, la guarda en disco y retorna la URL .webp.
 * Si ya es una URL .webp o enlace externo, la devuelve tal cual.
 */
export async function autoProcessWebPImage(
  imageStr: string | undefined | null,
  folder: 'productos' | 'categorias' | 'portadas' | 'uploads' = 'uploads',
  baseName?: string
): Promise<string> {
  if (!imageStr) return '/imagenes/productos/fallback.webp';
  
  const trimmed = imageStr.trim();
  
  // Si es un base64 data URL, convertir a WebP y guardar en disco
  if (trimmed.startsWith('data:image/') || (trimmed.startsWith('data:') && trimmed.includes(';base64,'))) {
    try {
      const result = await saveAsWebP(trimmed, folder, baseName);
      return result.url;
    } catch (err) {
      console.warn('⚠️ No se pudo convertir base64 a archivo WebP:', err);
      return trimmed;
    }
  }

  return trimmed;
}
