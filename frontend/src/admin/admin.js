/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO PRINCIPAL
 * Coordinador Maestro de Datos, Estado y Módulos
 */
(function () {
  'use strict';

  // 1. Categorías oficiales de respaldo inicial
  const defaultCategories = [
  {
    "id": "C0001",
    "code": "C0001",
    "name": "ADICIONALES",
    "icon": "Plus",
    "description": "Complementos y adicionales para personalizar los pedidos.",
    "banner": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
    "order": 1
  },
  {
    "id": "C0002",
    "code": "C0002",
    "name": "ALITAS",
    "icon": "Drumstick",
    "description": "Alitas crujientes en salsa acevichada y BBQ.",
    "banner": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
    "order": 2
  },
  {
    "id": "C0003",
    "code": "C0003",
    "name": "BEBIDAS",
    "icon": "Coffee",
    "description": "Gaseosas heladas, agua y bebidas en botella.",
    "banner": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "order": 3
  },
  {
    "id": "C0004",
    "code": "C0004",
    "name": "BROASTER",
    "icon": "Drumstick",
    "description": "Pollo broaster ultra crocante con papas, arroz y cremas.",
    "banner": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "order": 4
  },
  {
    "id": "C0005",
    "code": "C0005",
    "name": "HAMBURGUESAS",
    "icon": "Beef",
    "description": "Hamburguesas artesanales, choripanes y sándwiches especiales.",
    "banner": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "order": 5
  },
  {
    "id": "C0006",
    "code": "C0006",
    "name": "INFUSIONES",
    "icon": "CupSoda",
    "description": "Infusiones calientes y café aromático pasado.",
    "banner": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
    "order": 6
  },
  {
    "id": "C0007",
    "code": "C0007",
    "name": "PLATOS AMAZÓNICOS",
    "icon": "Flame",
    "description": "Auténticos sabores de la selva peruana: tacacho, cecina, juanes y patacones.",
    "banner": "/imagenes/categorias/platos-amazonicos/banner.webp",
    "order": 7
  },
  {
    "id": "C0008",
    "code": "C0008",
    "name": "PROMOCIONES",
    "icon": "Sparkles",
    "description": "Promociones y combos especiales de BuchiSapa.",
    "banner": "/imagenes/portada/Portada1E.webp",
    "order": 8
  },
  {
    "id": "C0009",
    "code": "C0009",
    "name": "REFRESCOS",
    "icon": "GlassWater",
    "description": "Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.",
    "banner": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "order": 9
  },
  {
    "id": "C0010",
    "code": "C0010",
    "name": "SALCHIPAPAS Y SALCHIBROASTERS",
    "icon": "Flame",
    "description": "Papas crocantes, salchichas, chorizos y combinaciones broaster.",
    "banner": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "order": 10
  }
];

  // 2. Catálogo completo de platillos de respaldo inicial
  const defaultProducts = [
  {
    "id": "PL00001",
    "code": "PL00001",
    "name": "Acevichadas",
    "category": "ALITAS",
    "category_id": "C0002",
    "price": 15,
    "description": "Acompañamiento: 5 alitas + Papas crocantes",
    "badge": "ACEVICHADAS",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00002",
    "code": "PL00002",
    "name": "Agua Cielo",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 2.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "NATURAL",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00003",
    "code": "PL00003",
    "name": "Aguajina",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "SELVÁTICO",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00004",
    "code": "PL00004",
    "name": "Ala",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 10,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "ECONÓMICO",
    "popular": false,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00005",
    "code": "PL00005",
    "name": "Anís",
    "category": "INFUSIONES",
    "category_id": "C0006",
    "price": 2.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "CALIENTE",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00006",
    "code": "PL00006",
    "name": "Arroz Chaufa Amazónico",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Cecina y chorizo amazónico salteado",
    "badge": "FUSIÓN",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "/imagenes/categorias/platos-amazonicos/banner.webp",
    "includes_sauces": true
  },
  {
    "id": "PL00007",
    "code": "PL00007",
    "name": "Bacon Burguer",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 12,
    "description": "Acompañamiento: Papas crocantes + Tocino + Queso",
    "badge": "TOCINO",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00008",
    "code": "PL00008",
    "name": "BBQ",
    "category": "ALITAS",
    "category_id": "C0002",
    "price": 15,
    "description": "Acompañamiento: 5 alitas + Papas crocantes",
    "badge": "BBQ",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1527477378308-140ae2443325?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00009",
    "code": "PL00009",
    "name": "Café",
    "category": "INFUSIONES",
    "category_id": "C0006",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PASADO",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00010",
    "code": "PL00010",
    "name": "Caldo Amazónico",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 12,
    "description": "Acompañamiento: Yuca + Verduras de la selva",
    "badge": "TRADICIONAL",
    "popular": false,
    "available": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00011",
    "code": "PL00011",
    "name": "Camu Camu",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "VITAMINA C",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00012",
    "code": "PL00012",
    "name": "Cheese Burguer",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 11,
    "description": "Acompañamiento: Queso cheddar",
    "badge": "CHEDDAR",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00013",
    "code": "PL00013",
    "name": "Chicha",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "CASERA",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00014",
    "code": "PL00014",
    "name": "Chilcano de Carachama o Pescado del Día",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Inguiri + Plátano",
    "badge": "RECONSTITUYENTE",
    "popular": false,
    "available": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00015",
    "code": "PL00015",
    "name": "Choripán",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 10,
    "description": "Acompañamiento: Papas crocantes + Chorizo + Ensalada fresca",
    "badge": "PARRILLERO",
    "popular": false,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00016",
    "code": "PL00016",
    "name": "Clásica",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 10,
    "description": "Acompañamiento: Hamburguesa artesanal + Papa crocante + Ensalada fresca",
    "badge": "CLÁSICA",
    "popular": true,
    "available": true,
    "stock": 35,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00017",
    "code": "PL00017",
    "name": "Coca Cola",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PERSONAL",
    "popular": true,
    "available": true,
    "stock": 45,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00018",
    "code": "PL00018",
    "name": "Cocona",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "TÍPICO",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00019",
    "code": "PL00019",
    "name": "Encuentro",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 13,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "BROASTER",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00020",
    "code": "PL00020",
    "name": "Fanta",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 3.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PERSONAL",
    "popular": false,
    "available": true,
    "stock": 35,
    "image": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00021",
    "code": "PL00021",
    "name": "Filete de Pollo",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 11,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "popular": false,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00022",
    "code": "PL00022",
    "name": "Hamburguesa",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00023",
    "code": "PL00023",
    "name": "Hamburguesa a lo Pobre",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 14,
    "description": "Acompañamiento: Huevo frito + Queso + Jamón + Plátano",
    "badge": "A LO POBRE",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00024",
    "code": "PL00024",
    "name": "Hawaiana Carne",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 14,
    "description": "Acompañamiento: Papa crocante + Carne artesanal + Huevo + Jamón + Queso + Piña + Ensalada fresca",
    "badge": "HAWAIANA",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00025",
    "code": "PL00025",
    "name": "Hawaiana Pollo",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 13,
    "description": "Acompañamiento: Papa crocante + Pollo crispy + Huevo + Jamón + Queso + Piña + Ensalada fresca",
    "badge": "CRISPY",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00026",
    "code": "PL00026",
    "name": "Huevo",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 100,
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00027",
    "code": "PL00027",
    "name": "Inca Kola",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "POPULAR",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00028",
    "code": "PL00028",
    "name": "Jamón",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1524438418049-ab2acb7aa48f?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00029",
    "code": "PL00029",
    "name": "Juanes",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Maduros fritos",
    "badge": "TRADICIÓN",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00030",
    "code": "PL00030",
    "name": "La Suprema",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 15,
    "description": "Acompañamiento: Tocino + Queso + Huevo frito + Jamón",
    "badge": "SUPREMA",
    "popular": true,
    "available": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00031",
    "code": "PL00031",
    "name": "Maracuyá",
    "category": "REFRESCOS",
    "category_id": "C0009",
    "price": 3,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "REFRESCANTE",
    "popular": true,
    "available": true,
    "stock": 45,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00032",
    "code": "PL00032",
    "name": "Palometa Frita con Maduro o Plátano",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 15,
    "description": "Acompañamiento: Arroz + Maduro frito",
    "badge": "RÍO",
    "popular": false,
    "available": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00033",
    "code": "PL00033",
    "name": "Patacones con Chorizo",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 12,
    "description": "Acompañamiento: Patacones + Chorizo",
    "badge": "ENTRADA",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00034",
    "code": "PL00034",
    "name": "Pecho",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 18,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "PREMIUM",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00035",
    "code": "PL00035",
    "name": "Pepsi",
    "category": "BEBIDAS",
    "category_id": "C0003",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "PERSONAL",
    "popular": false,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00036",
    "code": "PL00036",
    "name": "Pierna",
    "category": "BROASTER",
    "category_id": "C0004",
    "price": 12,
    "description": "Acompañamiento: Papa crocante + Ensalada fresca + Arroz",
    "badge": "CLÁSICO",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00037",
    "code": "PL00037",
    "name": "Piña",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00038",
    "code": "PL00038",
    "name": "Plátano",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00039",
    "code": "PL00039",
    "name": "Pollo Broaster",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00040",
    "code": "PL00040",
    "name": "Pollo Deshilachado",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 9,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "DESHILACHADO",
    "popular": false,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00041",
    "code": "PL00041",
    "name": "PROMO BROASTER FAMILIAR",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 38,
    "description": "La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola. / Acompañamientos: Papa crocante + Ensalada fresca + Arroz",
    "badge": "FAMILIAR",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00042",
    "code": "PL00042",
    "name": "PROMO BUCHI DUO",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 22,
    "description": "Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi. / Acompañamientos: Papa crocante + Hamburguesa artesanal + Ensalada fresca",
    "badge": "DUO",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00043",
    "code": "PL00043",
    "name": "PROMO SALCHI BURGER",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 24,
    "description": "La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola. / Acompañamientos: Queso cheddar + Papa crocante + Ensalada fresca",
    "badge": "COMBO",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00044",
    "code": "PL00044",
    "name": "PROMO SELVA POWER",
    "category": "PROMOCIONES",
    "category_id": "C0008",
    "price": 29,
    "description": "Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta. / Acompañamientos: Maduros fritos + Sarza criolla + Papa crocante + Ensalada fresca",
    "badge": "SELVA",
    "popular": true,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00045",
    "code": "PL00045",
    "name": "Queso",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1552767059-ce182ead8c1b?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00046",
    "code": "PL00046",
    "name": "Royal",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 13,
    "description": "Acompañamiento: Carne casera + Pollo deshilachado + Pollo + Chorizo",
    "badge": "ROYAL",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00047",
    "code": "PL00047",
    "name": "Royal a lo Pobre",
    "category": "HAMBURGUESAS",
    "category_id": "C0005",
    "price": 14,
    "description": "Acompañamiento: Papa crocante + Carne artesanal + Huevo + Jamón + Queso + Plátano + Ensalada fresca",
    "badge": "ESPECIAL",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00048",
    "code": "PL00048",
    "name": "Salchibroaster Ala",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 13,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "BROASTER",
    "popular": false,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00049",
    "code": "PL00049",
    "name": "Salchibroaster Encuentro",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 16,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "ENCUENTRO",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00050",
    "code": "PL00050",
    "name": "Salchibroaster Pecho",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 20,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "PECHO",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00051",
    "code": "PL00051",
    "name": "Salchibroaster Pierna",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 14,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "PIERNA",
    "popular": true,
    "available": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00052",
    "code": "PL00052",
    "name": "Salchichorizo",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 13,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "PARRILLERO",
    "popular": false,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00053",
    "code": "PL00053",
    "name": "Salchipapa a lo Pobre",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 13,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "A LO POBRE",
    "popular": true,
    "available": true,
    "stock": 30,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00054",
    "code": "PL00054",
    "name": "Salchipapa Clásica",
    "category": "SALCHIPAPAS Y SALCHIBROASTERS",
    "category_id": "C0010",
    "price": 10,
    "description": "Acompañamiento: Papas crocantes + Ensalada fresca",
    "badge": "CLÁSICA",
    "popular": true,
    "available": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": true
  },
  {
    "id": "PL00055",
    "code": "PL00055",
    "name": "Tacacho con Cecina",
    "category": "PLATOS AMAZÓNICOS",
    "category_id": "C0007",
    "price": 12,
    "description": "Acompañamiento: Maduros fritos + Sarza criolla",
    "badge": "ESTRELLA",
    "popular": true,
    "available": true,
    "stock": 35,
    "image": "/imagenes/categorias/platos-amazonicos/banner.webp",
    "includes_sauces": true
  },
  {
    "id": "PL00056",
    "code": "PL00056",
    "name": "Té",
    "category": "INFUSIONES",
    "category_id": "C0006",
    "price": 2.5,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "CALIENTE",
    "popular": false,
    "available": true,
    "stock": 50,
    "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  },
  {
    "id": "PL00057",
    "code": "PL00057",
    "name": "Tocino",
    "category": "ADICIONALES",
    "category_id": "C0001",
    "price": 2,
    "description": "No cuenta con acompañamientos ni cremas",
    "badge": "EXTRA",
    "popular": false,
    "available": true,
    "stock": 80,
    "image": "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=600&auto=format&fit=crop&q=80",
    "includes_sauces": false
  }
];

  // Almacén central de datos accesible para todos los módulos
  window.adminData = {
    products: defaultProducts,
    categories: defaultCategories,
    orders: [],
    clients: [],
    insumos: [
      { id: 'INS001', name: 'Carne Molida Especial Burger (80/20)', category: 'carnes', stock: 45, unit: 'Kg', min: 15, cost: 28.50, status: 'normal' },
      { id: 'INS002', name: 'Pechuga / Pierna de Pollo Broaster Marinado', category: 'carnes', stock: 60, unit: 'Kg', min: 20, cost: 18.00, status: 'normal' },
      { id: 'INS003', name: 'Pan Brioche Artesanal con Ajonjolí', category: 'panaderia', stock: 120, unit: 'Unidades', min: 40, cost: 1.80, status: 'normal' },
      { id: 'INS004', name: 'Papa Amarilla / Tumbay Seleccionada', category: 'vegetales', stock: 80, unit: 'Kg', min: 25, cost: 4.50, status: 'normal' },
      { id: 'INS005', name: 'Queso Cheddar Fundente en Láminas', category: 'lacteos', stock: 18, unit: 'Paquetes', min: 8, cost: 22.00, status: 'normal' },
      { id: 'INS006', name: 'Cajas Biodegradables Hamburguesa Premium', category: 'empaques', stock: 250, unit: 'Unidades', min: 50, cost: 0.95, status: 'normal' },
      { id: 'INS007', name: 'Aceite Vegetal Alto Rendimiento 20L', category: 'abarrotes', stock: 6, unit: 'Bidones', min: 3, cost: 85.00, status: 'normal' }
    ],
    utensilios: [
      { id: 'UT001', name: 'Freidora Industrial Doble Cuba 20L + 20L', area: 'Cocina Caliente', quantity: 2, condition: '100% Operativo', lastMaint: '01/10/2026', status: 'operativo' },
      { id: 'UT002', name: 'Plancha Ranurada / Lisa a Gas 90cm Smash', area: 'Zona de Plancha', quantity: 1, condition: '100% Operativo', lastMaint: '28/09/2026', status: 'operativo' },
      { id: 'UT003', name: 'Espátulas Profesionales de Acero Inox para Smash', area: 'Zona de Plancha', quantity: 4, condition: 'Buena', lastMaint: '15/09/2026', status: 'operativo' },
      { id: 'UT004', name: 'Dispensador Térmico de Salsas 3L Acero', area: 'Línea de Ensamble', quantity: 3, condition: '100% Operativo', lastMaint: '02/10/2026', status: 'operativo' },
      { id: 'UT005', name: 'Campana Extractora Industrial con Trampas de Grasa', area: 'Cocina Caliente', quantity: 1, condition: 'En Mantenimiento Preventivo', lastMaint: '04/10/2026', status: 'mantenimiento' }
    ]
  };

  /* --------------------------------------------------------------------------
     SISTEMA DE RELOJ Y FECHA EN VIVO EN TIEMPO REAL
     -------------------------------------------------------------------------- */
  function updateLiveClock() {
    const now = new Date();
    
    const timeEl = document.getElementById('topbar-live-time');
    const dateEl = document.getElementById('topbar-live-date');
    const ticketDateEl = document.getElementById('ticket-preview-date');
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    const timeFormatted = `${hoursStr}:${minutes}:${seconds} ${ampm}`;

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const dateFormatted = `${dayName}, ${dayNum} ${monthName} ${year}`;

    if (timeEl) timeEl.textContent = timeFormatted;
    if (dateEl) dateEl.textContent = dateFormatted;

    if (ticketDateEl) {
      const ticketDay = String(dayNum).padStart(2, '0');
      const ticketMonth = String(now.getMonth() + 1).padStart(2, '0');
      ticketDateEl.textContent = `${ticketDay}/${ticketMonth}/${year} - ${hoursStr}:${minutes} ${ampm}`;
    }
  }

  function initLiveClock() {
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
  }

  /* --------------------------------------------------------------------------
     INICIALIZACIÓN Y ENRUTAMIENTO DE EVENTOS
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initLiveClock();

    // Event listeners del sidebar y navegación
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.switchAdminView(btn.dataset.view);
      });
    });

    document.getElementById('btn-mobile-menu')?.addEventListener('click', window.toggleMobileSidebar);
    document.getElementById('btn-sidebar-close')?.addEventListener('click', window.closeMobileSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', window.closeMobileSidebar);
    document.getElementById('btn-admin-logout')?.addEventListener('click', window.handleLogout);

    loadAllAdminData();
    window.switchAdminView('dashboard');
  });

  // Escuchar cambios de vista para activar el renderizado correspondiente
  window.onAdminViewSwitched = function (viewId) {
    if (viewId === 'dashboard') {
      window.renderDashboard?.();
    } else if (viewId === 'portada') {
      window.loadPortadas?.();
    } else if (viewId === 'productos') {
      window.renderProductsTable?.();
    } else if (viewId === 'categorias') {
      window.renderCategoriesGrid?.();
    } else if (viewId === 'pedidos') {
      window.renderOrdersTable?.();
    } else if (viewId === 'clientes') {
      window.renderClientesTable?.();
    } else if (viewId === 'insumos') {
      window.renderInsumosTable?.();
    } else if (viewId === 'utensilios') {
      window.renderUtensiliosTable?.();
    } else if (viewId === 'ticket') {
      window.syncTicketPreview?.();
    } else if (viewId === 'configuracion') {
      window.loadSavedAdminProfile?.();
    }
  };

  /* --------------------------------------------------------------------------
     CARGA DE DATOS DESDE LA API (EXTRACCIÓN ROBUSTA)
     -------------------------------------------------------------------------- */
  async function loadAllAdminData() {
    try {
      const [resProd, resCat, resOrd, resUsers] = await Promise.allSettled([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);

      if (resProd.status === 'fulfilled') {
        const raw = resProd.value;
        const pList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        if (pList.length > 0) {
          window.adminData.products = pList.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
        }
      }

      if (resCat.status === 'fulfilled') {
        const raw = resCat.value;
        const cList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        if (cList.length > 0) {
          window.adminData.categories = cList.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
        }
      }

      if (resOrd.status === 'fulfilled') {
        const raw = resOrd.value;
        const oList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.orders) ? raw.orders : []));
        if (oList.length > 0) {
          window.adminData.orders = oList;
        }
      }

      if (resUsers.status === 'fulfilled') {
        const raw = resUsers.value;
        const uList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.users) ? raw.users : []));
        if (uList.length > 0) {
          window.adminData.clients = uList;
        }
      }

      // Renderizar todos los módulos
      window.renderDashboard?.();
      window.renderProductsTable?.();
      window.renderCategoriesGrid?.();
      window.renderOrdersTable?.();
      window.renderClientesTable?.();
      window.renderInsumosTable?.();
      window.renderUtensiliosTable?.();
    } catch (e) {
      console.error('Error cargando datos del panel admin:', e);
    }
  }

  window.loadAllAdminData = loadAllAdminData;

  /* --------------------------------------------------------------------------
     SISTEMA DE NOTIFICACIONES TOAST
     -------------------------------------------------------------------------- */
  function showAdminToast(msg, type = 'info') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ'}</span>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
  window.showAdminToast = showAdminToast;

})();
