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
      name: 'Chaufa Regional',
      category_id: 'platos-amazonicos',
      price: 13,
      description: 'Wok al fuego vivo con cecina ahumada, chorizo de la selva y plátano madurito frito en trozos.',
      badge: 'POPULAR',
      popular: true,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ama-4',
      name: 'Juane Tradicional de Gallina',
      category_id: 'platos-amazonicos',
      price: 15,
      description: 'Envuelto en hoja de bijao, arroz aromatizado con especias selváticas, presa tierna de gallina de chacra y huevo duro.',
      badge: 'TRADICIÓN',
      popular: true,
      available: true,
      stock: 15,
      image: '/imagenes/portada/portada-2.jpg',
      includes_sauces: true
    },
    {
      id: 'ama-5',
      name: 'Bichi Broaster Regional',
      category_id: 'platos-amazonicos',
      price: 18,
      description: 'Nuestra fusión estrella: Broaster ultra crocante acompañado de patacones amazónicos y ensalada fresca chonta.',
      badge: 'ESTRELLA',
      popular: true,
      available: true,
      stock: 20,
      image: '/imagenes/portada/portada-1.jpg',
      includes_sauces: true
    },
    {
      id: 'ama-6',
      name: 'Hamburguesa Amazónica BuchiSapa',
      category_id: 'platos-amazonicos',
      price: 15,
      description: 'Carne artesanal a la parrilla, cecina deshilachada crocante, plátano maduro asado y mayonesa de cocona.',
      badge: 'SIGNATURE',
      popular: true,
      available: true,
      stock: 30,
      image: '/imagenes/portada/portada-3.jpg',
      includes_sauces: true
    },
    {
      id: 'ama-7',
      name: 'Porción Extra Cecina Ahumada',
      category_id: 'platos-amazonicos',
      price: 8,
      description: 'Láminas tiernas y doraditas de cecina regional para acompañar cualquier plato de tu elección.',
      badge: 'EXTRA',
      popular: false,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 2. HAMBURGUESAS (7)
    {
      id: 'ham-1',
      name: 'Hamburguesa Clásica',
      category_id: 'hamburguesas',
      price: 10,
      description: 'Carne 100% res seleccionada a la plancha, lechuga hidropónica, tomate fresco y cremas.',
      badge: 'CLÁSICA',
      popular: false,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-2',
      name: 'Hamburguesa con Queso',
      category_id: 'hamburguesas',
      price: 12,
      description: 'Carne de res con abundante queso cheddar derretido al vapor sobre la plancha caliente.',
      badge: 'CHEDDAR',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-3',
      name: 'Hamburguesa Doble Carne',
      category_id: 'hamburguesas',
      price: 15,
      description: 'Doble porción de carne jugosa, doble queso cheddar fundido y papas al hilo.',
      badge: 'DOBLE',
      popular: true,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1583032015879-67994468f760?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-4',
      name: 'Hamburguesa Royal',
      category_id: 'hamburguesas',
      price: 14,
      description: 'Carne jugosa, huevo frito a la inglesa con yema tierna, queso fundido y papas al hilo.',
      badge: 'ROYAL',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-5',
      name: 'Hamburguesa a lo Pobre',
      category_id: 'hamburguesas',
      price: 15,
      description: 'Carne de res, plátano maduro acaramelado frito, huevo a la plancha y queso cheddar.',
      badge: 'CRIOLLA',
      popular: true,
      available: true,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-6',
      name: 'Hamburguesa Parrillera',
      category_id: 'hamburguesas',
      price: 15,
      description: 'Carne con chorizo parrillero ahumado en rodajas y chimichurri artesanal.',
      badge: 'PARRILLERA',
      popular: false,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'ham-7',
      name: 'BuchiBurger Suprema',
      category_id: 'hamburguesas',
      price: 18,
      description: 'Nuestra burger más colosal: Doble carne, queso cheddar, huevo, cecina crocante y papas amarillas fritas.',
      badge: 'MONSTER',
      popular: true,
      available: true,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },

    // 3. POLLO BROASTER (6)
    {
      id: 'bro-1',
      name: '1/8 Pollo Broaster',
      category_id: 'broaster',
      price: 9,
      description: 'Una presa tierna y crujiente, dorada a la perfección, servida con papas fritas y cremas.',
      badge: 'INDIVIDUAL',
      popular: false,
      available: true,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-2',
      name: '1/4 Pollo Broaster Clásico',
      category_id: 'broaster',
      price: 14,
      description: 'Pierna o pecho según disponibilidad, empanizado especial BuchiSapa, papas y ensalada.',
      badge: 'TOP VENTAS',
      popular: true,
      available: true,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-3',
      name: '1/4 Broaster con Chaufa',
      category_id: 'broaster',
      price: 16,
      description: 'El combo favorito de la casa: presa broaster crocante acompañada de arroz chaufa frito al wok.',
      badge: 'DUPLA',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1527477321055-436158a2b0a4?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-4',
      name: '1/2 Pollo Broaster Familiar',
      category_id: 'broaster',
      price: 26,
      description: 'Dos presas grandes de broaster ultra crocante, porción doble de papas fritas y salsas surtidas.',
      badge: 'PARA DOS',
      popular: true,
      available: true,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-5',
      name: '1 Pollo Broaster Entero Fiesta',
      category_id: 'broaster',
      price: 48,
      description: '4 presas completas, fuentes grandes de papas crocantes, ensalada fresca y gaseosa 1.5L.',
      badge: 'FAMILIAR',
      popular: true,
      available: true,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    },
    {
      id: 'bro-6',
      name: 'BuchiTenders Broaster (6 u)',
      category_id: 'broaster',
      price: 14,
      description: 'Filetes tiernos de pechuga 100% pura marinados con el secreto BuchiSapa, papas y salsas dipping.',
      badge: 'SNACK',
      popular: true,
      available: true,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
      includes_sauces: true
    }
  ];

  window.AdminState = {
    allProducts: [],
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
    cajaData: null,
    allTickets: [],
    filteredTickets: [],
    activePreviewTicket: null,
    allPortadas: [],
    currentPortadaSlide: 0,
    portadaPreviewInterval: null,
    currentPortadaFilter: 'all',
    defaultSignatureProducts: defaultSignatureProducts
  };

})();
