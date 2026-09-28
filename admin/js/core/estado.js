/**
 * BUCHISAPA ADMIN - CORE STATE MANAGEMENT
 * Layer: /admin/js/core/state.js
 */

(function () {
  'use strict';



  const defaultSignatureProducts = [
    // 1. PLATOS AMAZÓNICOS (7)
    {
      id: 'ama-1',
      name: 'Patacones con Chorizo',
      category_id: 'platos-amazonicos',
      price: 12,
      description: 'Dorados y crujientes patacones artesanales con chorizo amazónico jugoso y salsa cremosa de la casa.',
      badge: 'SELVA',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ama-2',
      name: 'Tacacho con Cecina',
      category_id: 'platos-amazonicos',
      price: 12,
      description: 'El abrazo de la selva. Tacacho ahumado en leña con cecina premium y madurito caramelizado.',
      badge: 'TÍPICO',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ama-3',
      name: 'Juanes',
      category_id: 'platos-amazonicos',
      price: 15,
      description: 'Tradición envuelta en hoja de bijao. Arroz selvático jugoso con gallina de chacra y su toque de huevo.',
      badge: 'TRADICIONAL',
      popular: true,
      available: true,
      stock: 25,
      image: '/imagenes/categorias/platos-amazonicos/banner.webp',
      includes_sauces: true
    },
    {
      id: 'ama-4',
      name: 'Chilcano de Carachama o Pescado del Día',
      category_id: 'platos-amazonicos',
      price: 15,
      description: 'Caldo ancestral que revive. Pescado fresco de río, yuca nativa y culantro amazónico bien cargado.',
      badge: 'RECONSTITUYENTE',
      popular: false,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'ama-5',
      name: 'Palometa Frita con Maduro o Plátano',
      category_id: 'platos-amazonicos',
      price: 15,
      description: 'Palometa entera crocante y dorada, con arroz blanco graneado y plátanos maduros dulces.',
      badge: 'FRESCO',
      popular: true,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ama-6',
      name: 'Caldo Amazónico',
      category_id: 'platos-amazonicos',
      price: 12,
      description: 'Nuestra sopa bandera. Potente, aromático y humeante, con pescado fresco y hierbas de la selva.',
      badge: 'CALIENTE',
      popular: false,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'ama-7',
      name: 'Arroz Chaufa Amazónico',
      category_id: 'platos-amazonicos',
      price: 15,
      description: 'El chaufa selvático salteado al fuego con cecina ahumada, chorizo y aroma a selva profunda.',
      badge: 'FAVORITO',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 2. HAMBURGUESAS (12)
    {
      id: 'ham-1',
      name: 'Clásica',
      category_id: 'hamburguesas',
      price: 10,
      description: 'La clásica que nunca falla. Carne artesanal jugosa, pan suave, papas doradas y ensalada fresca.',
      badge: 'CLÁSICA',
      popular: true,
      available: true,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-2',
      name: 'Choripan',
      category_id: 'hamburguesas',
      price: 10,
      description: 'Chorizo a la parrilla chispeante con papas crujientes y cremas. Sabor callejero elevado a premium.',
      badge: 'PARRILLERO',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-3',
      name: 'Hawaiana Carne',
      category_id: 'hamburguesas',
      price: 14,
      description: 'Fusión tropical irresistible. Carne jugosa, piña asada dulce, jamón ahumado y queso fundido.',
      badge: 'ESPECIAL',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-4',
      name: 'Hawaiana Pollo',
      category_id: 'hamburguesas',
      price: 13,
      description: 'Pollo crispy extra crujiente con piña jugosa y queso derretido. Dulce, salado y adictivo.',
      badge: 'CRISPY',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-5',
      name: 'Pollo Deshilachado',
      category_id: 'hamburguesas',
      price: 9,
      description: 'Pollo jugoso deshilachado a fuego lento, sazonado con nuestra receta secreta de la casa.',
      badge: 'ECONÓMICO',
      popular: false,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-6',
      name: 'Filete de Pollo',
      category_id: 'hamburguesas',
      price: 11,
      description: 'Filete empanizado dorado, crujiente por fuera y tierno por dentro. Ligero pero contundente.',
      badge: 'FILLETA',
      popular: false,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-7',
      name: 'Cheese Burguer',
      category_id: 'hamburguesas',
      price: 11,
      description: 'Para los queseros de corazón. Carne jugosa bañada en abundante cheddar derretido cremoso.',
      badge: 'CHEDDAR',
      popular: true,
      available: true,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-8',
      name: 'Bacon Burguer',
      category_id: 'hamburguesas',
      price: 12,
      description: 'Pura tentación. Tocino ahumado crujiente, queso fundido y carne jugosa en cada mordida.',
      badge: 'TOCINO',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-9',
      name: 'La Suprema',
      category_id: 'hamburguesas',
      price: 15,
      description: 'La más imponente. Carne, tocino, jamón, queso y huevo frito. Creada para paladares exigentes.',
      badge: 'MÁXIMA',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-10',
      name: 'Hamburguesa a lo Pobre',
      category_id: 'hamburguesas',
      price: 14,
      description: 'Sabor 100% peruano. Con huevo frito, plátano maduro, jamón y queso sobre carne jugosa.',
      badge: 'A LO POBRE',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-11',
      name: 'Royal',
      category_id: 'hamburguesas',
      price: 13,
      description: 'La mixtura perfecta. Carne artesanal, chorizo, pollo deshilachado y pollo crispy en una sola.',
      badge: 'ROYAL',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-12',
      name: 'Royal a lo Pobre',
      category_id: 'hamburguesas',
      price: 14,
      description: 'La Royal llevada al extremo con huevo, plátano frito y jamón. Grande, completa y poderosa.',
      badge: 'COMPLETA',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 3. BROASTER (4)
    {
      id: 'bro-1',
      name: 'Pecho',
      category_id: 'broaster',
      price: 18,
      description: 'Pieza gigante extra crujiente y jugosa, con arroz graneado, papas doradas y ensalada fresca.',
      badge: 'PECHUGA',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-2',
      name: 'Pierna',
      category_id: 'broaster',
      price: 12,
      description: 'Dorada, crujiente y suculenta. Nuestra pierna broaster más pedida, jugosa hasta el hueso.',
      badge: 'JUGOSO',
      popular: true,
      available: true,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-3',
      name: 'Encuentro',
      category_id: 'broaster',
      price: 13,
      description: 'El dúo perfecto de muslo y pierna en un encuentro crujiente que no podrás olvidar.',
      badge: 'FAVORITO',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-4',
      name: 'Ala',
      category_id: 'broaster',
      price: 10,
      description: 'Ideal para picar. Alita dorada, súper crujiente y sazonada con toque secreto amazónico.',
      badge: 'CLÁSICO',
      popular: false,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 4. SALCHIPAPAS Y SALCHIBROASTERS (7)
    {
      id: 'sal-1',
      name: 'Salchipapa Clásica',
      category_id: 'salchipapas',
      price: 10,
      description: 'Papas doradas premium con salchicha crocante y lluvia de cremas caseras. La clásica infalible.',
      badge: 'CLÁSICA',
      popular: true,
      available: true,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'sal-2',
      name: 'Salchipapa a lo Pobre',
      category_id: 'salchipapas',
      price: 13,
      description: 'La clásica con poder extra: huevo frito y plátano maduro dulce para un sabor criollo total.',
      badge: 'A LO POBRE',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'sal-3',
      name: 'Salchibroaster Pecho',
      category_id: 'salchipapas',
      price: 20,
      description: 'Montaña de papas con pecho broaster gigante, crujiente por fuera y jugoso por dentro.',
      badge: 'CONTUNDENTE',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'sal-4',
      name: 'Salchibroaster Pierna',
      category_id: 'salchipapas',
      price: 14,
      description: 'Pierna broaster dorada sobre papas crujientes. Contundente, jugoso y perfecto para compartir.',
      badge: 'BROASTER',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'sal-5',
      name: 'Salchibroaster Encuentro',
      category_id: 'salchipapas',
      price: 16,
      description: 'Mix broaster generoso con papas doradas y cremas. Porción grande para hambre grande.',
      badge: 'POPULAR',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'sal-6',
      name: 'Salchibroaster Ala',
      category_id: 'salchipapas',
      price: 13,
      description: 'Ala broaster crujiente sobre base de papas doradas, con ensalada fresca y cremas.',
      badge: 'ALITA',
      popular: false,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'sal-7',
      name: 'Salchichorizo',
      category_id: 'salchipapas',
      price: 13,
      description: 'Explosión de sabor con chorizo parrillero ahumado, papas crujientes y cremas picantitas.',
      badge: 'AMAZÓNICO',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 5. ALITAS (2)
    {
      id: 'ali-1',
      name: 'Acevichadas',
      category_id: 'alitas',
      price: 15,
      description: '5 alitas jugosas bañadas en cremosa salsa acevichada con toque marino, cítrico y picante.',
      badge: 'ACEVICHADAS',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ali-2',
      name: 'BBQ',
      category_id: 'alitas',
      price: 15,
      description: '5 alitas glaseadas en salsa BBQ ahumada, dulce y jugosa con un toque ahumado irresistible.',
      badge: 'BBQ',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 6. BEBIDAS (5)
    {
      id: 'beb-1',
      name: 'Inca Cola',
      category_id: 'bebidas',
      price: 5,
      description: 'La doradita peruana bien heladita. Burbujeante, dulce y perfecta para tu broaster crujiente.',
      badge: 'HELADA',
      popular: true,
      available: true,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'beb-2',
      name: 'Coca Cola',
      category_id: 'bebidas',
      price: 5,
      description: 'Clásica mundial, helada al punto. Refrescancia burbujeante que combina con todo.',
      badge: 'HELADA',
      popular: true,
      available: true,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'beb-3',
      name: 'Fanta',
      category_id: 'bebidas',
      price: 3.5,
      description: 'Naranja vibrante, dulce y chispeante. Ultra refrescante para el calor de la selva.',
      badge: 'FRUTAL',
      popular: false,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'beb-4',
      name: 'Pepsi',
      category_id: 'bebidas',
      price: 2,
      description: 'Ligera, refrescante y burbujeante. Ideal para acompañar tus hamburguesas artesanales.',
      badge: 'REFRESCANTE',
      popular: false,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'beb-5',
      name: 'Agua Cielo',
      category_id: 'bebidas',
      price: 2.5,
      description: 'Pura y cristalina. Natural, sin gas, perfecta para hidratarte de forma saludable.',
      badge: 'NATURAL',
      popular: false,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },

    // 7. REFRESCOS NATURALES (5)
    {
      id: 'ref-1',
      name: 'Maracuyá',
      category_id: 'refrescos',
      price: 3,
      description: 'Tropical y vibrante. Dulce y ácido a la vez, 100% fruta natural amazónica bien helado.',
      badge: '100% NATURAL',
      popular: true,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'ref-2',
      name: 'Chicha',
      category_id: 'refrescos',
      price: 3,
      description: 'Nuestra chicha morada casera, dulce, aromática y refrescante con receta tradicional andina.',
      badge: 'CASERA',
      popular: true,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'ref-3',
      name: 'Cocona',
      category_id: 'refrescos',
      price: 3,
      description: 'Exótico de la selva. Cítrico, refrescante y revitalizante. Un sabor amazónico que enamora.',
      badge: 'AMAZÓNICO',
      popular: true,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'ref-4',
      name: 'Aguajina',
      category_id: 'refrescos',
      price: 3,
      description: 'Dulce y cremosa del aguaje amazónico. Nutritiva, suave y refrescante. Pura selva.',
      badge: 'TÍPICO',
      popular: true,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'ref-5',
      name: 'Camu Camu',
      category_id: 'refrescos',
      price: 3,
      description: 'El shot natural de vitamina C. Ácido, refrescante y energizante. Directo de la Amazonía.',
      badge: 'VITAMINA C',
      popular: true,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },

    // 8. INFUSIONES (3)
    {
      id: 'inf-1',
      name: 'Anís',
      category_id: 'infusiones',
      price: 2.5,
      description: 'Calientita y aromática. Digestiva, suave y relajante. El cierre perfecto después de comer.',
      badge: 'CALIENTE',
      popular: false,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'inf-2',
      name: 'Té',
      category_id: 'infusiones',
      price: 2.5,
      description: 'Clásico reconfortante y aromático. Calientito, equilibrado y perfecto para cerrar la velada.',
      badge: 'CALIENTE',
      popular: false,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    },
    {
      id: 'inf-3',
      name: 'Manzanilla',
      category_id: 'infusiones',
      price: 2.5,
      description: 'Flores de manzanilla seleccionadas. Calma, descanso y aroma herbal que reconforta el alma.',
      badge: 'RELAJANTE',
      popular: false,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',
      includes_sauces: false
    }
  ];

  window.AdminState = Object.assign({
    allProducts: defaultSignatureProducts,
    filteredProducts: [],
    currentCategory: 'todos',
    searchQuery: '',
    currentSort: 'recent',
    viewMode: 'grid',
    currentPage: 1,
    itemsPerPage: 12,
    allSupplies: [],
    allUtensils: [],
    allOrders: [],
    allUsers: [],
    cajaData: null,
    allTickets: [],
    filteredTickets: [],
    activePreviewTicket: null,
    allPortadas: [],
    currentPortadaSlide: 0,
    portadaPreviewInterval: null,
    currentPortadaFilter: 'all',
    allPromociones: [],
    currentPromocionesFilter: 'all',
    defaultSignatureProducts: defaultSignatureProducts
  }, window.AdminState || {});

  if (!window.AdminState.allProducts || window.AdminState.allProducts.length === 0) {
    window.AdminState.allProducts = defaultSignatureProducts;
  }

  window.getFallbackProducts = function () {
    return defaultSignatureProducts;
  };
})();
