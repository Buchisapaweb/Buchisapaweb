#!/usr/bin/env bash
set -e

mkdir -p public/imagenes/logo
mkdir -p public/imagenes/portada
mkdir -p public/imagenes/categorias/platos-amazonicos
mkdir -p public/imagenes/categorias/hamburguesas
mkdir -p public/imagenes/categorias/broaster
mkdir -p public/imagenes/categorias/salchipapas-y-salchibroasters
mkdir -p public/imagenes/categorias/alitas
mkdir -p public/imagenes/categorias/bebidas
mkdir -p public/imagenes/categorias/refrescos
mkdir -p public/imagenes/categorias/infusiones

echo "Generating logo..."
convert -size 512x512 radial-gradient:"#ff7a00"-"#b91c1c" \
  -fill "#ffffff" -gravity north -pointsize 48 -annotate +0+80 "🍗 BUCHISAPA 🌿" \
  -fill "#fed7aa" -gravity center -pointsize 32 -annotate +0+-20 "POLLERIA & SABOR AMAZONICO" \
  -fill "#ffffff" -gravity center -pointsize 64 -annotate +0+50 "🔥 BUCHISAPA 🔥" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+80 "Santa Clara - Ate | Delivery Nocturno" \
  public/imagenes/logo/logo-buchisapa.png

echo "Generating portadas..."
convert -size 1200x600 gradient:"#1e1b4b"-"#ea580c" \
  -fill "#fed7aa" -gravity northwest -pointsize 28 -annotate +80+80 "DELIVERY NOCTURNO HASTA LAS 5:00 AM" \
  -fill "#ffffff" -gravity west -pointsize 68 -annotate +80+-40 "Sabor Criollo &\nTradición Amazónica" \
  -fill "#fef08a" -gravity southwest -pointsize 34 -annotate +80+100 "Av. La Estrella con Calle 28 de Julio, Santa Clara" \
  public/imagenes/portada/portada-1.jpg

convert -size 1200x600 gradient:"#064e3b"-"#1e293b" \
  -fill "#a7f3d0" -gravity northwest -pointsize 28 -annotate +80+80 "ESPECIALIDADES DE LA SELVA" \
  -fill "#ffffff" -gravity west -pointsize 68 -annotate +80+-40 "Tacacho con Cecina\ny Juane Auténtico" \
  -fill "#fde047" -gravity southwest -pointsize 34 -annotate +80+100 "Plátano bellaco frito con chicharrón & ají de cocona" \
  public/imagenes/portada/portada-2.jpg

convert -size 1200x600 gradient:"#7c2d12"-"#0f172a" \
  -fill "#fed7aa" -gravity northwest -pointsize 28 -annotate +80+80 "CRUJIENTE & JUGOSO" \
  -fill "#ffffff" -gravity west -pointsize 68 -annotate +80+-40 "Pollo Broaster Dorado\ncon Papas Nativas" \
  -fill "#fde047" -gravity southwest -pointsize 34 -annotate +80+100 "Acompañado de todas tus cremas y salsas favoritas" \
  public/imagenes/portada/portada-3.jpg

convert -size 1200x600 gradient:"#4c1d95"-"#831843" \
  -fill "#fbcfe8" -gravity northwest -pointsize 28 -annotate +80+80 "COMBOS PARA COMPARTIR" \
  -fill "#ffffff" -gravity west -pointsize 68 -annotate +80+-40 "Salchipapas Supremas\ny Alitas BBQ" \
  -fill "#fde047" -gravity southwest -pointsize 34 -annotate +80+100 "La mejor porción nocturna de Santa Clara" \
  public/imagenes/portada/portada-4.jpg

echo "Generating category banners..."
convert -size 800x500 gradient:"#14532d"-"#15803d" \
  -fill "#bbf7d0" -gravity northwest -pointsize 24 -annotate +50+50 "TRADICIÓN Y SAZÓN SELVÁTICA" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "PLATOS\nAMAZÓNICOS" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Tacacho, Cecina, Chorizo & Juanes" \
  public/imagenes/categorias/platos-amazonicos/banner.jpg

convert -size 800x500 gradient:"#9a3412"-"#ea580c" \
  -fill "#fed7aa" -gravity northwest -pointsize 24 -annotate +50+50 "100% CARNE DE RES Y POLLO" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "HAMBURGUESAS\nARTESANALES" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Clásica, Royal, A lo Pobre & Especiales" \
  public/imagenes/categorias/hamburguesas/banner.jpg

convert -size 800x500 gradient:"#b45309"-"#d97706" \
  -fill "#fef3c7" -gravity northwest -pointsize 24 -annotate +50+50 "EL MÁS CROCANTE DE SANTA CLARA" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "POLLO\nBROASTER" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Presas crocantes con papas fritas y ensalada" \
  public/imagenes/categorias/broaster/banner.jpg

convert -size 800x500 gradient:"#c2410c"-"#7f1d1d" \
  -fill "#fed7aa" -gravity northwest -pointsize 24 -annotate +50+50 "PORCIONES GENEROSAS" \
  -fill "#ffffff" -gravity center -pointsize 50 -annotate +0+-20 "SALCHIPAPAS &\nSALCHIBROASTERS" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Hot Dog especial, huevo, queso y pollo" \
  public/imagenes/categorias/salchipapas-y-salchibroasters/banner.jpg

convert -size 800x500 gradient:"#991b1b"-"#450a0a" \
  -fill "#fecaca" -gravity northwest -pointsize 24 -annotate +50+50 "SALSAS A ELECCIÓN" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "ALITAS\nCRUJIENTES" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "BBQ, Picantes, Broaster & Agridulce" \
  public/imagenes/categorias/alitas/banner.jpg

convert -size 800x500 gradient:"#1e3a8a"-"#0284c7" \
  -fill "#bae6fd" -gravity northwest -pointsize 24 -annotate +50+50 "SIEMPRE BIEN HELADAS" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "BEBIDAS Y\nGASEOSAS" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Inca Kola, Coca Cola, Cervezas & Agua" \
  public/imagenes/categorias/bebidas/banner.jpg

convert -size 800x500 gradient:"#831843"-"#db2777" \
  -fill "#fce7f3" -gravity northwest -pointsize 24 -annotate +50+50 "NATURALES Y FRESCOS" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "REFRESCOS\nCASEROS" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Camu Camu, Maracuyá, Chicha Morada & Cocona" \
  public/imagenes/categorias/refrescos/banner.jpg

convert -size 800x500 gradient:"#78350f"-"#b45309" \
  -fill "#fde68a" -gravity northwest -pointsize 24 -annotate +50+50 "CALIENTITOS PARA LA NOCHE" \
  -fill "#ffffff" -gravity center -pointsize 54 -annotate +0+-20 "INFUSIONES &\nCAFÉ PASADO" \
  -fill "#fef08a" -gravity south -pointsize 26 -annotate +0+50 "Café Chanchamayo, Té, Anís & Manzanilla" \
  public/imagenes/categorias/infusiones/banner.jpg

echo "All images generated in public/images!"
