import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateTicketLogos() {
  const inputPath = path.resolve('public/imagenes/logo/logo-buchisapa.png');
  const outputPathBn = path.resolve('public/imagenes/logo/logo-ticket-bn.png');
  const outputPathClean = path.resolve('public/imagenes/logo/logo-ticket-mono.png');

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    return;
  }

  // Version 1: Clean high-contrast grayscale / black & white with gamma curve
  await sharp(inputPath)
    .grayscale()
    .normalise()
    .linear(1.4, -(128 * 0.4)) // Enhance contrast
    .toFile(outputPathBn);

  // Version 2: Monochrome / dithered or pure thresholded for thermal print
  await sharp(inputPath)
    .grayscale()
    .modulate({ brightness: 1.1, saturation: 0 })
    .linear(1.5, -30)
    .toFile(outputPathClean);

  console.log('Successfully generated ticket B&W logos:', outputPathBn, outputPathClean);
}

generateTicketLogos().catch(console.error);
