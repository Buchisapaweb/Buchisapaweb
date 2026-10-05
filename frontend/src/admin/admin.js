/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO PRINCIPAL
 * Coordinador Maestro de Datos, Estado y Módulos
 */
(function () {
  'use strict';

  // 1. Categorías oficiales de respaldo inicial
  const defaultCategories = [
    { id: 'alitas', code: '1001', name: 'ALITAS', icon: 'Drumstick', banner: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', description: 'Alitas crujientes en salsa acevichada y BBQ.' },
    { id: 'bebidas', code: '1002', name: 'BEBIDAS', icon: 'Coffee', banner: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', description: 'Gaseosas heladas, agua y bebidas en botella.' },
    { id: 'broaster', code: '1003', name: 'BROASTER', icon: 'Drumstick', banner: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', description: 'Pollo broaster ultra crocante con papas, arroz y cremas.' },
    { id: 'hamburguesas', code: '1004', name: 'HAMBURGUESAS', icon: 'Beef', banner: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesas artesanales, choripanes y sándwiches especiales.' },
    { id: 'infusiones', code: '1005', name: 'INFUSIONES', icon: 'CupSoda', banner: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80', description: 'Infusiones calientes y café aromático pasado.' },
    { id: 'platos-amazonicos', code: '1006', name: 'PLATOS AMAZÓNICOS', icon: 'Flame', banner: '/imagenes/categorias/platos-amazonicos/banner.webp', description: 'Auténticos sabores de la selva peruana: tacacho, cecina, juanes y patacones.' },
    { id: 'refrescos', code: '1007', name: 'REFRESCOS', icon: 'GlassWater', banner: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', description: 'Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.' },
    { id: 'salchipapas', code: '1008', name: 'SALCHIPAPAS Y SALCHIBROASTERS', icon: 'Flame', banner: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80', description: 'Papas crocantes, salchichas, chorizos y combinaciones broaster.' },
    { id: 'adicionales', code: '1009', name: 'ADICIONALES', icon: 'Plus', banner: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', description: 'Complementos y adicionales para personalizar los pedidos.' },
    { id: 'promociones', code: '1010', name: 'PROMOCIONES', icon: 'Sparkles', banner: '/imagenes/portada/Portada1E.webp', description: 'Promociones y combos especiales de BuchiSapa.' }
  ];

  // 2. Catálogo completo de platillos de respaldo inicial
  const defaultProducts = [
    { id: 'promo-1', code: 'PRM001', name: 'Promoción Tú Eliges con Gaseosa 1.5 LT.', category_id: 'promociones', category: 'promociones', price: 90.90, stock: 45, available: true, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', description: '1 BuchiSapa Brasa + papas fritas + guarnición + Inca Kola 1.5 LT.' },
    { id: 'promo-2', code: 'PRM002', name: 'Promoción Tu Chicha 1.5 LT.', category_id: 'promociones', category: 'promociones', price: 95.50, stock: 40, available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', description: '1 BuchiSapa Brasa + papas fritas + guarnición + Chicha 1.5 LT.' },
    { id: 'promo-3', code: 'PRM003', name: 'Promoción Tú Eliges con Gaseosa 2.25 LT.', category_id: 'promociones', category: 'promociones', price: 95.50, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80', description: '1 BuchiSapa Brasa + papas fritas + Inca Kola 2.25 LT.' },
    { id: 'promo-4', code: 'PRM004', name: 'Promoción Para 2', category_id: 'promociones', category: 'promociones', price: 57.90, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80', description: '1/2 BuchiSapa Brasa + papas fritas + ensalada + 2 bebidas.' },
    { id: 'ama-1', code: 'AMA001', name: 'Patacones con Chorizo', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 12.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', description: 'Patacones crujientes dorados con chorizo ahumado jugoso y crema selvática.' },
    { id: 'ama-2', code: 'AMA002', name: 'Tacacho con Cecina', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 12.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', description: 'Tacacho suave amazónico con cecina ahumada jugosa plátano dulce.' },
    { id: 'ama-3', code: 'AMA003', name: 'Juanes', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 15.00, stock: 25, available: true, image: '/imagenes/categorias/platos-amazonicos/banner.webp', description: 'Juane tradicional jugoso con arroz selvático gallina tierna huevo y maduro.' },
    { id: 'ama-4', code: 'AMA004', name: 'Chilcano de Carachama o Pescado del Día', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 15.00, stock: 20, available: true, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80', description: 'Chilcano caliente selvático con carachama fresca jugosa y yuca suave.' },
    { id: 'ama-5', code: 'AMA005', name: 'Palometa Frita con Maduro o Plátano', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 15.00, stock: 22, available: true, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', description: 'Palometa frita crujiente dorada con arroz blanco maduros dulces.' },
    { id: 'ama-6', code: 'AMA006', name: 'Caldo Amazónico', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 12.00, stock: 20, available: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', description: 'Caldo amazónico verde aromático con pescado fresco culantro y yuca.' },
    { id: 'ama-7', code: 'AMA007', name: 'Arroz Chaufa Amazónico', category_id: 'platos-amazonicos', category: 'platos-amazonicos', price: 15.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', description: 'Arroz chaufa amazónico salteado con cecina ahumada y chorizo jugoso.' },
    { id: 'ham-1', code: 'HAM001', name: 'Clásica', category_id: 'hamburguesas', category: 'hamburguesas', price: 10.00, stock: 40, available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa clásica jugosa artesanal con papas crujientes y ensalada fresca.' },
    { id: 'ham-2', code: 'HAM002', name: 'Choripan', category_id: 'hamburguesas', category: 'hamburguesas', price: 10.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', description: 'Choripan jugoso artesanal con chorizo parrillero y papas crujientes.' },
    { id: 'ham-3', code: 'HAM003', name: 'Hawaiana Carne', category_id: 'hamburguesas', category: 'hamburguesas', price: 14.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa hawaiana con carne artesanal jugosa piña dulce queso y jamón.' },
    { id: 'ham-4', code: 'HAM004', name: 'Hawaiana Pollo', category_id: 'hamburguesas', category: 'hamburguesas', price: 13.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa hawaiana con pollo crispy crujiente piña jugosa queso y jamón.' },
    { id: 'ham-5', code: 'HAM005', name: 'Pollo Deshilachado', category_id: 'hamburguesas', category: 'hamburguesas', price: 9.00, stock: 25, available: true, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa suave con pollo deshilachado jugoso y papas doradas.' },
    { id: 'ham-6', code: 'HAM006', name: 'Filete de Pollo', category_id: 'hamburguesas', category: 'hamburguesas', price: 11.00, stock: 25, available: true, image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80', description: 'Filete pollo dorado crujiente jugoso con papas y ensalada fresca.' },
    { id: 'ham-7', code: 'HAM007', name: 'Cheese Burguer', category_id: 'hamburguesas', category: 'hamburguesas', price: 11.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa casera jugosa con doble queso cheddar derretido cremoso.' },
    { id: 'ham-8', code: 'HAM008', name: 'Bacon Burguer', category_id: 'hamburguesas', category: 'hamburguesas', price: 12.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa jugosa con tocino ahumado crujiente y queso derretido.' },
    { id: 'ham-9', code: 'HAM009', name: 'La Suprema', category_id: 'hamburguesas', category: 'hamburguesas', price: 15.00, stock: 28, available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa suprema gigante con tocino queso huevo frito jamón y papas.' },
    { id: 'ham-10', code: 'HAM010', name: 'Hamburguesa a lo Pobre', category_id: 'hamburguesas', category: 'hamburguesas', price: 14.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa completa pobre con huevo jamón queso plátano frito.' },
    { id: 'ham-11', code: 'HAM011', name: 'Royal', category_id: 'hamburguesas', category: 'hamburguesas', price: 13.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa royal mixta con carnes selectas chorizo pollo.' },
    { id: 'ham-12', code: 'HAM012', name: 'Royal a lo Pobre', category_id: 'hamburguesas', category: 'hamburguesas', price: 14.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', description: 'Hamburguesa royal pobre con carne artesanal huevo jamón queso plátano.' },
    { id: 'bro-1', code: 'BRO001', name: 'Pecho', category_id: 'broaster', category: 'broaster', price: 18.00, stock: 40, available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', description: 'Pecho broaster gigante crujiente jugoso con arroz blanco papas.' },
    { id: 'bro-2', code: 'BRO002', name: 'Pierna', category_id: 'broaster', category: 'broaster', price: 12.00, stock: 45, available: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80', description: 'Pierna broaster dorada crujiente jugosa con arroz graneado papas.' },
    { id: 'bro-3', code: 'BRO003', name: 'Encuentro', category_id: 'broaster', category: 'broaster', price: 13.00, stock: 40, available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', description: 'Encuentro broaster mixto crujiente con pecho pierna arroz papas.' },
    { id: 'bro-4', code: 'BRO004', name: 'Ala', category_id: 'broaster', category: 'broaster', price: 10.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80', description: 'Ala broaster crujiente dorada jugosa con arroz blanco papas.' },
    { id: 'sal-1', code: 'SAL001', name: 'Salchipapa Clásica', category_id: 'salchipapas', category: 'salchipapas', price: 10.00, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80', description: 'Salchipapa clásica tradicional con papas crujientes salchicha dorada.' },
    { id: 'sal-2', code: 'SAL002', name: 'Salchipapa a lo Pobre', category_id: 'salchipapas', category: 'salchipapas', price: 13.00, stock: 45, available: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80', description: 'Salchipapa pobre con papas huevo frito plátano maduro salchicha.' },
    { id: 'sal-3', code: 'SAL003', name: 'Salchibroaster Pecho', category_id: 'salchipapas', category: 'salchipapas', price: 20.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', description: 'Salchibroaster pecho con pollo crujiente jugoso papas doradas.' },
    { id: 'sal-4', code: 'SAL004', name: 'Salchibroaster Pierna', category_id: 'salchipapas', category: 'salchipapas', price: 14.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80', description: 'Salchibroaster pierna con pollo jugoso dorado papas crujientes.' },
    { id: 'sal-5', code: 'SAL005', name: 'Salchibroaster Encuentro', category_id: 'salchipapas', category: 'salchipapas', price: 16.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', description: 'Salchibroaster encuentro mixto con pollo broaster variado papas.' },
    { id: 'sal-6', code: 'SAL006', name: 'Salchibroaster Ala', category_id: 'salchipapas', category: 'salchipapas', price: 13.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80', description: 'Salchibroaster ala con pollo crujiente dorado papas fritas.' },
    { id: 'sal-7', code: 'SAL007', name: 'Salchichorizo', category_id: 'salchipapas', category: 'salchipapas', price: 13.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', description: 'Salchichorizo potente con chorizo parrillero jugoso papas crujientes.' },
    { id: 'ali-1', code: 'ALI001', name: 'Acevichadas', category_id: 'alitas', category: 'alitas', price: 15.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', description: 'Alitas acevichadas jugosas con salsa marina cremosa y papas doradas.' },
    { id: 'ali-2', code: 'ALI002', name: 'BBQ', category_id: 'alitas', category: 'alitas', price: 15.00, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80', description: 'Alitas BBQ jugosas ahumadas con salsa dulce intensa y papas doradas.' },
    { id: 'beb-1', code: 'BEB001', name: 'Inca Cola', category_id: 'bebidas', category: 'bebidas', price: 5.00, stock: 60, available: true, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', description: 'Gaseosa dorada peruana dulce refrescante burbujeante.' },
    { id: 'beb-2', code: 'BEB002', name: 'Coca Cola', category_id: 'bebidas', category: 'bebidas', price: 5.00, stock: 60, available: true, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80', description: 'Gaseosa negra clásica mundial refrescante burbujeante helada.' },
    { id: 'beb-3', code: 'BEB003', name: 'Fanta', category_id: 'bebidas', category: 'bebidas', price: 3.50, stock: 40, available: true, image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80', description: 'Gaseosa naranja dulce burbujeante refrescante helada.' },
    { id: 'beb-4', code: 'BEB004', name: 'Pepsi', category_id: 'bebidas', category: 'bebidas', price: 2.00, stock: 40, available: true, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80', description: 'Gaseosa cola refrescante ligera burbujeante helada.' },
    { id: 'beb-5', code: 'BEB005', name: 'Agua Cielo', category_id: 'bebidas', category: 'bebidas', price: 2.50, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80', description: 'Agua pura cristalina sin gas natural refrescante saludable.' },
    { id: 'ref-1', code: 'REF001', name: 'Maracuyá', category_id: 'refrescos', category: 'refrescos', price: 3.00, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', description: 'Refresco tropical maracuyá dulce ácido natural refrescante.' },
    { id: 'ref-2', code: 'REF002', name: 'Chicha', category_id: 'refrescos', category: 'refrescos', price: 3.00, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', description: 'Refresco morado tradicional dulce andino refrescante natural.' },
    { id: 'ref-3', code: 'REF003', name: 'Cocona', category_id: 'refrescos', category: 'refrescos', price: 3.00, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80', description: 'Refresco amazónico cocona cítrico exótico refrescante natural.' },
    { id: 'ref-4', code: 'REF004', name: 'Aguajina', category_id: 'refrescos', category: 'refrescos', price: 3.00, stock: 45, available: true, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', description: 'Refresco amazónico aguaje dulce cremoso refrescante natural.' },
    { id: 'ref-5', code: 'REF005', name: 'Camu Camu', category_id: 'refrescos', category: 'refrescos', price: 3.00, stock: 45, available: true, image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80', description: 'Refresco camu camu ácido vitamínico refrescante amazónico.' },
    { id: 'inf-1', code: 'INF001', name: 'Anís', category_id: 'infusiones', category: 'infusiones', price: 2.50, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', description: 'Infusión digestiva de anís en grano seleccionado caliente.' },
    { id: 'inf-2', code: 'INF002', name: 'Té Clásico', category_id: 'infusiones', category: 'infusiones', price: 2.50, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80', description: 'Té negro aromático caliente reconfortante tradicional.' },
    { id: 'inf-3', code: 'INF003', name: 'Manzanilla', category_id: 'infusiones', category: 'infusiones', price: 2.50, stock: 35, available: true, image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80', description: 'Infusión relajante de flores de manzanilla caliente.' },
    { id: 'com-1', code: 'COM001', name: 'Combo Familiar Broaster', category_id: 'promociones', category: 'combos', price: 45.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80', description: '1 Pollo broaster entero crocante + papas fritas familiares + ensalada + chicha 1.5L.' },
    { id: 'com-2', code: 'COM002', name: 'Combo Selvático Dúo', category_id: 'promociones', category: 'combos', price: 32.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', description: '1 Tacacho con cecina + 1 Arroz chaufa amazónico + 2 refrescos de cocona.' },
    { id: 'com-3', code: 'COM003', name: 'Combo Burger Lover', category_id: 'promociones', category: 'combos', price: 28.00, stock: 30, available: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', description: '2 Hamburguesas a lo Pobre + 2 papas crujientes + 2 Inca Cola 500ml.' },
    { id: 'ext-1', code: 'EXT001', name: 'Porción de Papas Fritas', category_id: 'adicionales', category: 'extras', price: 6.00, stock: 80, available: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', description: 'Papas amarillas crocantes saladas al punto, doradas al momento.' },
    { id: 'ext-2', code: 'EXT002', name: 'Porción Extra de Cecina', category_id: 'adicionales', category: 'extras', price: 8.00, stock: 45, available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', description: 'Láminas jugosas de cecina ahumada artesanal de la selva.' },
    { id: 'ext-3', code: 'EXT003', name: 'Porción de Tacacho', category_id: 'adicionales', category: 'extras', price: 6.00, stock: 50, available: true, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', description: 'Bolas de plátano majado con chicharrón y sazón amazónica.' },
    { id: 'ext-4', code: 'EXT004', name: 'Porción de Cremas de la Casa', category_id: 'adicionales', category: 'extras', price: 3.00, stock: 100, available: true, image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', description: 'Variedad de salsas caseras: ají pollero, tártara, mayonesa y rocoto.' }
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
