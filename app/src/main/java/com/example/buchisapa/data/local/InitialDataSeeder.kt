package com.example.buchisapa.data.local

import com.example.buchisapa.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object InitialDataSeeder {

    val categories = listOf(
        CategoryEntity("C0001", "promociones", "PROMOCIONES", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0002", "alitas", "ALITAS", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0003", "bebidas", "BEBIDAS", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0004", "broaster", "BROASTER", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0005", "hamburguesas", "HAMBURGUESAS", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0006", "infusiones", "INFUSIONES", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0007", "platos-amazonicos", "PLATOS AMAZÓNICOS", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0008", "refrescos", "REFRESCOS", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0009", "salchipapas", "SALCHIPAPAS Y SALCHIBROASTERS", "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80"),
        CategoryEntity("C0010", "adicional", "ADICIONALES", "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80")
    )

    val defaultCremas = listOf("Mayonesa", "Mostaza", "Ketchup", "Ají de Rocoto", "Tártara", "Golf")

    val products = listOf(
        // PROMOCIONES
        ProductEntity(
            id = "PL0001",
            name = "PROMO BUCHI DUO",
            categoryId = "C0001",
            categorySlug = "promociones",
            price = 22.0,
            description = "Dos hamburguesas artesanales premium más dos gaseosas personales Pepsi.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Hamburguesa artesanal", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0002",
            name = "PROMO BROASTER FAMILIAR",
            categoryId = "C0001",
            categorySlug = "promociones",
            price = 38.0,
            description = "Tres presas broaster (pecho, pierna, ala) con papas crocantes, arroz graneado y gaseosa Inca Kola 1.5L.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas Fritas", "Arroz graneado", "Ensalada fresca", "Inca Kola 1.5L"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0003",
            name = "PROMO SALCHI BURGER",
            categoryId = "C0001",
            categorySlug = "promociones",
            price = 24.0,
            description = "Hamburguesa Cheese Burguer y Salchipapa Clásica más Coca Cola personal.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Queso cheddar", "Papa crocante", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0004",
            name = "PROMO SELVA POWER",
            categoryId = "C0001",
            categorySlug = "promociones",
            price = 29.0,
            description = "Tacacho con Cecina de Tarapoto y Salchibroaster Pierna más Gaseosa Fanta.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Maduros fritos", "Sarza criolla", "Papa crocante", "Ensalada fresca"),
            cremas = defaultCremas
        ),

        // ALITAS
        ProductEntity(
            id = "PL0005",
            name = "Alitas Acevichadas",
            categoryId = "C0002",
            categorySlug = "alitas",
            price = 29.0,
            description = "5 alitas jugosas bañadas en cremosa salsa acevichada artesanal con toque crocante.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("5 alitas", "Papas crocantes"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0006",
            name = "Alitas BBQ Ahumadas",
            categoryId = "C0002",
            categorySlug = "alitas",
            price = 15.0,
            description = "5 alitas glaseadas en salsa BBQ ahumada con especias de la casa.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("5 alitas", "Papas crocantes"),
            cremas = defaultCremas
        ),

        // BEBIDAS
        ProductEntity(
            id = "PL0007",
            name = "Inca Kola 500ml",
            categoryId = "C0003",
            categorySlug = "bebidas",
            price = 5.0,
            description = "Gaseosa peruana personal bien helada.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0008",
            name = "Coca Cola 500ml",
            categoryId = "C0003",
            categorySlug = "bebidas",
            price = 5.0,
            description = "Gaseosa clásica personal helada.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0009",
            name = "Fanta 500ml",
            categoryId = "C0003",
            categorySlug = "bebidas",
            price = 3.5,
            description = "Gaseosa sabor naranja personal.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0010",
            name = "Pepsi 500ml",
            categoryId = "C0003",
            categorySlug = "bebidas",
            price = 2.0,
            description = "Gaseosa refrescante personal.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0011",
            name = "Agua Cielo 600ml",
            categoryId = "C0003",
            categorySlug = "bebidas",
            price = 2.5,
            description = "Agua de mesa purificada personal.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),

        // BROASTER
        ProductEntity(
            id = "PL0012",
            name = "Pollo Broaster Pecho Gigante",
            categoryId = "C0004",
            categorySlug = "broaster",
            price = 18.0,
            description = "Pechuga broaster gigante crocante con papas doradas, arroz y ensalada fresca.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Ensalada fresca", "Arroz"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0013",
            name = "Pollo Broaster Pierna",
            categoryId = "C0004",
            categorySlug = "broaster",
            price = 12.0,
            description = "Pierna broaster crocante y sazonada con papas, arroz y ensalada.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Ensalada fresca", "Arroz"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0014",
            name = "Pollo Broaster Encuentro",
            categoryId = "C0004",
            categorySlug = "broaster",
            price = 13.0,
            description = "Encuentro broaster jugoso con papas crocantes, arroz y ensalada.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Ensalada fresca", "Arroz"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0015",
            name = "Pollo Broaster Ala",
            categoryId = "C0004",
            categorySlug = "broaster",
            price = 10.0,
            description = "Ala broaster crujiente con papas, arroz y ensalada.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Ensalada fresca", "Arroz"),
            cremas = defaultCremas
        ),

        // HAMBURGUESAS
        ProductEntity(
            id = "PL0016",
            name = "Hamburguesa Clásica",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 10.0,
            description = "Carne artesanal de la casa a la plancha, papas crocantes y ensalada fresca.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Hamburguesa artesanal", "Papa crocante", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0017",
            name = "Choripán Parrillero",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 10.0,
            description = "Chorizo a la parrilla con papas crocantes y ensalada criolla.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1627054234594-526d705c567a?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas crocantes", "Chorizo", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0018",
            name = "Hawaiana Carne",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 14.0,
            description = "Carne artesanal, piña caramelizada a la plancha, queso y jamón sellado.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Carne artesanal", "Huevo", "Jamón", "Queso", "Piña", "Ensalada"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0019",
            name = "Hawaiana Pollo",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 13.0,
            description = "Pollo crispy, piña caramelizada, queso fundido y jamón.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papa crocante", "Pollo crispy", "Huevo", "Jamón", "Queso", "Piña"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0022",
            name = "Cheese Burguer",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 11.0,
            description = "Carne artesanal y abundante queso cheddar derretido.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Queso cheddar", "Papa crocante"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0023",
            name = "Bacon Burguer",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 12.0,
            description = "Carne artesanal con tiras de tocino ahumado crocante y queso fundido.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas crocantes", "Tocino", "Queso"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0024",
            name = "La Suprema Buchi",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 15.0,
            description = "Doble carne artesanal, tocino crocante, queso, huevo frito y jamón.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Tocino", "Queso", "Huevo frito", "Jamón", "Papa crocante"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0025",
            name = "Hamburguesa a lo Pobre",
            categoryId = "C0005",
            categorySlug = "hamburguesas",
            price = 14.0,
            description = "Carne artesanal, huevo frito montado, plátano maduro frito, queso y papas.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Huevo frito", "Queso", "Jamón", "Plátano maduro", "Papa crocante"),
            cremas = defaultCremas
        ),

        // PLATOS AMAZONICOS
        ProductEntity(
            id = "PL0031",
            name = "Patacones con Chorizo Amazónico",
            categoryId = "C0007",
            categorySlug = "platos-amazonicos",
            price = 12.0,
            description = "Patacones crujientes de plátano verde con chorizo amazónico parrillero y salsa criolla.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Patacones", "Chorizo selvático", "Sarza criolla"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0032",
            name = "Tacacho con Cecina de Tarapoto",
            categoryId = "C0007",
            categorySlug = "platos-amazonicos",
            price = 12.0,
            description = "Tacacho tradicional machacado con cecina ahumada de Tarapoto, maduros fritos y sarza criolla.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Maduros fritos", "Sarza criolla", "Ají de cocona"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0033",
            name = "Juane Tradicional Selvático",
            categoryId = "C0007",
            categorySlug = "platos-amazonicos",
            price = 15.0,
            description = "Arroz selvático con mishkina, huevo duro, aceituna y presa de gallina envuelta en hoja de bijao.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Maduros fritos", "Ají de cocona"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0037",
            name = "Arroz Chaufa Amazónico",
            categoryId = "C0007",
            categorySlug = "platos-amazonicos",
            price = 15.0,
            description = "Chaufa al wok salteado al instante con cecina ahumada y chorizo amazónico.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Cecina y chorizo amazónico salteado", "Plátano frito"),
            cremas = defaultCremas
        ),

        // REFRESCOS
        ProductEntity(
            id = "PL0038",
            name = "Refresco de Maracuyá 1L",
            categoryId = "C0008",
            categorySlug = "refrescos",
            price = 3.0,
            description = "Refresco de pura maracuyá natural bien helada.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0039",
            name = "Chicha Morada Casera 1L",
            categoryId = "C0008",
            categorySlug = "refrescos",
            price = 3.0,
            description = "Chicha morada casera de maíz morado, manzana, canela y piña.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0040",
            name = "Refresco de Cocona Amazónica",
            categoryId = "C0008",
            categorySlug = "refrescos",
            price = 3.0,
            description = "Refresco amazónico de pura pulpa de cocona fresca.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0041",
            name = "Aguajina de la Selva",
            categoryId = "C0008",
            categorySlug = "refrescos",
            price = 3.0,
            description = "Bebida tradicional de pulpa fresca de aguaje amazónico.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0042",
            name = "Camu Camu Refrescante",
            categoryId = "C0008",
            categorySlug = "refrescos",
            price = 3.0,
            description = "Refresco de fruta amazónica con alto contenido de vitamina C natural.",
            available = true,
            stock = 40,
            image = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),

        // SALCHIPAPAS
        ProductEntity(
            id = "PL0043",
            name = "Salchipapa Clásica",
            categoryId = "C0009",
            categorySlug = "salchipapas",
            price = 10.0,
            description = "Papas fritas crocantes, salchichas doradas y ensalada fresca con todas las cremas.",
            available = true,
            stock = 35,
            image = "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas crocantes", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0044",
            name = "Salchipapa a lo Pobre",
            categoryId = "C0009",
            categorySlug = "salchipapas",
            price = 13.0,
            description = "Salchipapa con huevo frito montado y plátano maduro frito dulce.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas crocantes", "Huevo frito", "Plátano maduro", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0045",
            name = "Salchibroaster Pecho",
            categoryId = "C0009",
            categorySlug = "salchipapas",
            price = 20.0,
            description = "Papas crocantes con pecho broaster gigante y salchichas.",
            available = true,
            stock = 25,
            image = "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas crocantes", "Pecho broaster", "Ensalada fresca"),
            cremas = defaultCremas
        ),
        ProductEntity(
            id = "PL0046",
            name = "Salchibroaster Pierna",
            categoryId = "C0009",
            categorySlug = "salchipapas",
            price = 14.0,
            description = "Pierna broaster dorada sobre generosa base de papas crocantes y salchicha.",
            available = true,
            stock = 30,
            image = "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80",
            includesSauces = true,
            accompaniments = listOf("Papas crocantes", "Pierna broaster", "Ensalada fresca"),
            cremas = defaultCremas
        ),

        // ADICIONALES
        ProductEntity(
            id = "PL0050",
            name = "Huevo Frito Extra",
            categoryId = "C0010",
            categorySlug = "adicional",
            price = 2.0,
            description = "Huevo frito adicional preparado al momento a la plancha.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0051",
            name = "Queso Cheddar Extra",
            categoryId = "C0010",
            categorySlug = "adicional",
            price = 2.0,
            description = "Lámina extra de queso fundido.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0053",
            name = "Plátano Maduro Frito Extra",
            categoryId = "C0010",
            categorySlug = "adicional",
            price = 2.0,
            description = "Porción de plátano maduro frito dulce.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        ),
        ProductEntity(
            id = "PL0055",
            name = "Tocino Ahumado Extra",
            categoryId = "C0010",
            categorySlug = "adicional",
            price = 2.0,
            description = "Tiras de tocino ahumado crocante.",
            available = true,
            stock = 50,
            image = "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=600&auto=format&fit=crop&q=80",
            includesSauces = false,
            accompaniments = emptyList(),
            cremas = emptyList()
        )
    )

    val heroBanners = listOf(
        HeroBanner(
            id = "1",
            title = "¡Sabor Auténtico Amazónico & Broaster!",
            subtitle = "Av. La Estrella con Calle 28 de Julio, Santa Clara",
            tag = "NOCHE & MADRUGADA",
            imageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80"
        ),
        HeroBanner(
            id = "2",
            title = "Promo Buchi Dúo S/ 22.00",
            subtitle = "2 Hamburguesas artesanales + 2 Gaseosas Pepsi",
            tag = "MÁS VENDIDO",
            imageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80"
        ),
        HeroBanner(
            id = "3",
            title = "Broaster Familiar Crujiente",
            subtitle = "Pecho + Pierna + Ala + Papas + Inca Kola",
            tag = "COMBO FAMILIAR",
            imageUrl = "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80"
        )
    )

    suspend fun seedDatabase(database: AppDatabase) = withContext(Dispatchers.IO) {
        if (database.categoryDao().count() == 0) {
            database.categoryDao().insertCategories(categories)
        }
        if (database.productDao().count() == 0) {
            database.productDao().insertProducts(products)
        }
        database.businessConfigDao().saveConfig(
            BusinessConfigEntity(
                id = "principal",
                businessName = "BuchiSapa - Pollería & Sabor Amazónico",
                ruc = "10723456781",
                address = "Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate - Lima",
                phone = "+51 942 475 459",
                email = "buchisapaweb@gmail.com",
                deliveryFee = 4.00,
                printerIp = "192.168.8.100",
                printerPort = 80,
                openingHours = "Lunes a Domingo: 6:00 PM - 5:00 AM",
                isOpen = true
            )
        )

        // Seed an initial demo order so orders tracker & admin kitchen view have data
        if (database.orderDao().count() == 0) {
            val sampleItem = CartItem(
                id = "item-1",
                productId = "PL0001",
                productName = "PROMO BUCHI DUO",
                productPrice = 22.0,
                productImage = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                quantity = 1,
                selectedAccompaniments = listOf("Papa crocante", "Hamburguesa artesanal"),
                selectedCremas = listOf("Mayonesa", "Ají de Rocoto", "Tártara"),
                selectedExtras = emptyList(),
                instructions = "Sin cebolla por favor",
                itemTotal = 22.0
            )
            database.orderDao().insertOrder(
                OrderEntity(
                    id = "ORD-101",
                    orderNumber = "BS-1001",
                    customerName = "Carlos Mendoza",
                    customerPhone = "987654321",
                    customerEmail = "carlos.mendoza@gmail.com",
                    orderType = OrderType.DELIVERY.name,
                    deliveryAddress = "Calle Los Pinos 142, Santa Clara, Ate",
                    deliveryReference = "Frente al parque principal",
                    tableNumber = "",
                    paymentMethod = PaymentMethod.YAPE_PLIN.name,
                    paymentAmountCash = 0.0,
                    notes = "Tocar timbre de reja negra",
                    status = OrderStatus.PREPARANDO.name,
                    deliveryFee = 4.0,
                    subtotal = 22.0,
                    total = 26.0,
                    items = listOf(sampleItem),
                    createdAt = System.currentTimeMillis() - 15 * 60 * 1000
                )
            )
        }
    }
}
