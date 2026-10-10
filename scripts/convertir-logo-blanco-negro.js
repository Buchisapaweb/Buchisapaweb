import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateTicketLogos() {
  const inputPath = fs.existsSync(path.resolve('publico/imagenes/logo/logo-buchisapa.webp'))
    ? path.resolve('publico/imagenes/logo/logo-buchisapa.webp')
    : path.resolve('publico/imagenes/logo/logo-buchisapa.webp');
  const outputPathBn = path.resolve('publico/imagenes/logo/logo-ticket-bn.webp');

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    return;
  }

  // WebP high-contrast grayscale / black & white for thermal printer receipt
  await sharp(inputPath)
    .grayscale()
    .normalise()
    .linear(1.4, -(128 * 0.4))
    .webp({ quality: 95 })
    .toFile(outputPathBn);

  console.log('Successfully generated ticket B&W WebP logo:', outputPathBn);
}

generateTicketLogos().catch(console.error);
