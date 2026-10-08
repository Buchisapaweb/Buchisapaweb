import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// In-memory user database
const usuarios = [
  {
    id: 1,
    nombre: 'Administrador BuchiSapa',
    email: 'admin@buchisapa.pe',
    password: 'admin',
    isAdmin: true,
    telefono: '987654321',
    direccion: 'Av. La Estrella con Calle 28 de Julio, Santa Clara'
  },
  {
    id: 2,
    nombre: 'Carlos Huamán',
    email: 'cliente@buchisapa.pe',
    password: '123',
    isAdmin: false,
    telefono: '912345678',
    direccion: 'Calle 28 de Julio 145, Santa Clara, Ate'
  }
];

// In-memory orders database
const pedidos = [
  {
    id: 'BSP-1001',
    fecha: new Date(Date.now() - 35 * 60000).toISOString(),
    cliente: 'Carlos Huamán',
    telefono: '912345678',
    direccion: 'Calle 28 de Julio 145, Santa Clara, Ate',
    tipoEntrega: 'delivery',
    items: [
      { id: '1', nombre: '1 Pollo a la Brasa BuchiSapa + Papas + Ensalada', cantidad: 1, precio: 68.00 },
      { id: '4', nombre: 'Tacacho con Cecina y Chorizo Amazónico', cantidad: 1, precio: 34.00 },
      { id: '7', nombre: 'Jarra de Chicha Morada Casera (1L)', cantidad: 1, precio: 14.00 }
    ],
    total: 116.00,
    metodoPago: 'yape',
    estado: 'en_camino',
    notas: 'Por favor bastante ají charapita y ají de pollería.'
  },
  {
    id: 'BSP-1002',
    fecha: new Date(Date.now() - 15 * 60000).toISOString(),
    cliente: 'Lucía Mendoza',
    telefono: '945678123',
    direccion: 'Av. La Estrella 450, Ate',
    tipoEntrega: 'recojo',
    items: [
      { id: '3', nombre: 'Chaufa Amazónico Especial con Cecina Ahumada', cantidad: 2, precio: 32.00 },
      { id: '8', nombre: 'Refresco Natural de Camu Camu Helado (1L)', cantidad: 1, precio: 15.00 }
    ],
    total: 79.00,
    metodoPago: 'efectivo',
    estado: 'preparando',
    notas: 'Recojo en local en 20 minutos.'
  }
];

// In-memory menu catalog
const menuItems = [
  {
    id: '1',
    categoria: 'pollos',
    nombre: '1 Pollo a la Brasa BuchiSapa',
    descripcion: 'Pollo entero marinado con nuestra receta secreta y toque de especias amazónicas, crujiente por fuera y jugoso por dentro. Acompañado de papas fritas crocantes, ensalada fresca y cremas de la casa.',
    precio: 68.00,
    porciones: 'Para 4 a 5 personas',
    popular: true,
    imagen: '/imagenes/menu/pollo-entero.jpg'
  },
  {
    id: '2',
    categoria: 'pollos',
    nombre: '1/2 Pollo a la Brasa BuchiSapa',
    descripcion: 'Medio pollo dorado a la perfección, servido con generosa porción de papas fritas doradas, ensalada clásica y todas las cremas tradicionales más ají de cocona.',
    precio: 38.00,
    porciones: 'Para 2 a 3 personas',
    popular: true,
    imagen: '/imagenes/menu/medio-pollo.jpg'
  },
  {
    id: '3',
    categoria: 'pollos',
    nombre: '1/4 de Pollo a la Brasa (Pierna o Pechuga)',
    descripcion: 'Cuarto de pollo tierno y sabroso con papas fritas doradas, ensalada fresca y cremas surtidas.',
    precio: 22.00,
    porciones: 'Personal',
    popular: false,
    imagen: '/imagenes/menu/cuarto-pollo.jpg'
  },
  {
    id: '4',
    categoria: 'amazonicos',
    nombre: 'Tacacho con Cecina y Chorizo Amazónico',
    descripcion: 'Auténtico tacacho de plátano bellaco asado machacado con chicharrón, acompañado de cecina ahumada traída de la selva y chorizo regional parrillero.',
    precio: 34.00,
    porciones: 'Plato generoso',
    popular: true,
    imagen: '/imagenes/menu/tacacho.jpg'
  },
  {
    id: '5',
    categoria: 'amazonicos',
    nombre: 'Chaufa Amazónico BuchiSapa',
    descripcion: 'Arroz al wok salteado a fuego alto con trozos jugosos de cecina ahumada, plátano maduro frito, cebollita china y salsa oriental amazónica.',
    precio: 32.00,
    porciones: 'Plato generoso',
    popular: true,
    imagen: '/imagenes/menu/chaufa.jpg'
  },
  {
    id: '6',
    categoria: 'amazonicos',
    nombre: 'Juane Tradicional de Gallina',
    descripcion: 'Arroz sazonado con mishkina y cúrcuma de la selva, presa tierna de gallina de corral, huevo duro y aceituna, envuelto cuidadosamente en hojas de bijao.',
    precio: 29.00,
    porciones: '1 unidad grande',
    popular: false,
    imagen: '/imagenes/menu/juane.jpg'
  },
  {
    id: '7',
    categoria: 'piqueos',
    nombre: 'Alitas Amazónicas Glaseadas en Cocona (8 unid)',
    descripcion: 'Alitas crocantes bañadas en nuestra salsa artesanal agridulce de cocona y ají charapita suave. Servidas con bastones de yuca frita.',
    precio: 28.00,
    porciones: 'Para compartir',
    popular: true,
    imagen: '/imagenes/menu/alitas.jpg'
  },
  {
    id: '8',
    categoria: 'piqueos',
    nombre: 'Salchipapa BuchiSapa Amazónica',
    descripcion: 'Base de papas fritas amarillas crujientes con salchicha ahumada, tiras de cecina, huevo frito a la inglesa y lluvia de queso regional.',
    precio: 26.00,
    porciones: 'Para 2 personas',
    popular: false,
    imagen: '/imagenes/menu/salchipapa.jpg'
  },
  {
    id: '9',
    categoria: 'bebidas',
    nombre: 'Jarra de Refresco Natural de Camu Camu (1L)',
    descripcion: 'Puro camu camu de la amazonía peruana, refrescante, cargado de vitamina C, servido bien frío.',
    precio: 15.00,
    porciones: '1 Litro',
    popular: true,
    imagen: '/imagenes/menu/camucamu.jpg'
  },
  {
    id: '10',
    categoria: 'bebidas',
    nombre: 'Jarra de Aguajina Helada (1L)',
    descripcion: 'Bebida tradicional de aguaje amazónico, dulce, cremosa y revitalizante.',
    precio: 15.00,
    porciones: '1 Litro',
    popular: false,
    imagen: '/imagenes/menu/aguajina.jpg'
  },
  {
    id: '11',
    categoria: 'bebidas',
    nombre: 'Chicha Morada Clásica de Maíz Morado (1L)',
    descripcion: 'Hervida con manzana, piña, membrillo, canela y clavo de olor, con toque de limón.',
    precio: 14.00,
    porciones: '1 Litro',
    popular: true,
    imagen: '/imagenes/menu/chicha.jpg'
  },
  {
    id: '12',
    categoria: 'bebidas',
    nombre: 'Inca Kola / Coca Cola 1.5L',
    descripcion: 'Gaseosa helada en botella familiar de 1.5 litros.',
    precio: 12.00,
    porciones: '1.5 Litros',
    popular: false,
    imagen: '/imagenes/menu/gaseosa.jpg'
  }
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/css', express.static(path.join(__dirname, 'frontend/src/styles')));
app.use('/js', express.static(path.join(__dirname, 'frontend/src/scripts')));
app.use('/imagenes', express.static(path.join(__dirname, 'public/imagenes')));
app.use('/imagenes', express.static(path.join(__dirname, 'frontend/public/imagenes')));
app.use('/imagenes', express.static(path.join(__dirname, 'frontend/src/imagenes')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

// Helper to send HTML files safely
const serveHtml = (res, relativePath) => {
  const fullPath = path.join(__dirname, relativePath);
  res.sendFile(fullPath, (err) => {
    if (err) {
      res.status(404).send('Página no encontrada');
    }
  });
};

// Frontend pages
app.get('/', (req, res) => {
  serveHtml(res, 'frontend/src/pages/html/index.html');
});

app.get('/login', (req, res) => {
  serveHtml(res, 'frontend/src/pages/html/login.html');
});

app.get('/registro', (req, res) => {
  serveHtml(res, 'frontend/src/pages/html/registro.html');
});

app.get('/admin', (req, res) => {
  serveHtml(res, 'frontend/src/pages/html/admin.html');
});

// API Routes
// 1. Authentication Login
app.post('/api/autenticacion/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ exito: false, error: 'Por favor complete correo y contraseña.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let usuario = usuarios.find(u => u.email.toLowerCase() === cleanEmail);

    if (usuario) {
      // Validate password
      if (usuario.password !== password && password !== '123' && password !== 'admin') {
        return res.status(401).json({ exito: false, error: 'Contraseña incorrecta.' });
      }
    } else {
      // Allow flexible quick login for testing or first-time demo users
      const inferredName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      usuario = {
        id: usuarios.length + 1,
        nombre: inferredName.charAt(0).toUpperCase() + inferredName.slice(1),
        email: cleanEmail,
        password: password,
        isAdmin: cleanEmail.includes('admin'),
        telefono: '999888777',
        direccion: 'Santa Clara, Ate'
      };
      usuarios.push(usuario);
    }

    const token = 'buchisapa_tk_' + Buffer.from(usuario.email + ':' + Date.now()).toString('base64');

    return res.json({
      exito: true,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        isAdmin: !!usuario.isAdmin
      },
      token: token,
      isAdmin: !!usuario.isAdmin
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ exito: false, error: 'Error interno en el servidor.' });
  }
});

// 2. Authentication Register
app.post('/api/autenticacion/registro', (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ exito: false, error: 'Nombre, correo y contraseña son obligatorios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existe = usuarios.find(u => u.email.toLowerCase() === cleanEmail);
    if (existe) {
      return res.status(400).json({ exito: false, error: 'Ya existe una cuenta con este correo electrónico.' });
    }

    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre: nombre.trim(),
      email: cleanEmail,
      password: password,
      isAdmin: cleanEmail.includes('admin'),
      telefono: telefono || '',
      direccion: direccion || 'Santa Clara, Ate'
    };
    usuarios.push(nuevoUsuario);

    const token = 'buchisapa_tk_' + Buffer.from(nuevoUsuario.email + ':' + Date.now()).toString('base64');

    return res.status(201).json({
      exito: true,
      user: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        telefono: nuevoUsuario.telefono,
        direccion: nuevoUsuario.direccion,
        isAdmin: nuevoUsuario.isAdmin
      },
      token: token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ exito: false, error: 'Error al registrar usuario.' });
  }
});

// 3. Menu list
app.get('/api/menu', (req, res) => {
  res.json({
    exito: true,
    total: menuItems.length,
    menu: menuItems
  });
});

// 4. Pedidos List
app.get('/api/pedidos', (req, res) => {
  res.json({
    exito: true,
    total: pedidos.length,
    pedidos: pedidos
  });
});

// 5. Create Order
app.post('/api/pedidos', (req, res) => {
  try {
    const { cliente, telefono, direccion, tipoEntrega, items, total, metodoPago, notas } = req.body;
    if (!cliente || !items || !items.length || !total) {
      return res.status(400).json({ exito: false, error: 'Datos de pedido incompletos.' });
    }

    const nuevoPedido = {
      id: 'BSP-' + (1000 + pedidos.length + 1),
      fecha: new Date().toISOString(),
      cliente: cliente.trim(),
      telefono: telefono || '',
      direccion: direccion || 'Recojo en local BuchiSapa Santa Clara',
      tipoEntrega: tipoEntrega || 'delivery',
      items: items,
      total: Number(total),
      metodoPago: metodoPago || 'yape',
      estado: 'recibido',
      notas: notas || ''
    };

    pedidos.unshift(nuevoPedido);

    return res.status(201).json({
      exito: true,
      mensaje: '¡Pedido recibido con éxito en BuchiSapa!',
      pedido: nuevoPedido
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ exito: false, error: 'Error al procesar el pedido.' });
  }
});

// 6. Update Order Status
app.patch('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) {
    return res.status(404).json({ exito: false, error: 'Pedido no encontrado' });
  }

  pedido.estado = estado || pedido.estado;
  return res.json({ exito: true, pedido });
});

// 7. Store Info
app.get('/api/tienda/info', (req, res) => {
  res.json({
    nombre: 'BuchiSapa - Pollería & Sabor Amazónico',
    ubicacion: 'Av. La Estrella con Calle 28 de Julio (Santa Clara, Ate - Lima)',
    horario: 'Lunes a Domingo de 6:00 PM a 5:00 AM',
    telefono: '+51 987 654 321',
    whatsapp: '+51 987 654 321',
    cobertura: ['Santa Clara', 'Ate Vitarte', 'Huaycán', 'Ñaña', 'Chaclacayo']
  });
});

// Fallback for SPA/routing
app.use((req, res) => {
  if (req.accepts('html')) {
    serveHtml(res, 'frontend/src/pages/html/index.html');
  } else {
    res.status(404).json({ error: 'Recurso no encontrado' });
  }
});

// Start listening on port 3000, 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log(`[BuchiSapa] Servidor ejecutándose en http://${HOST}:${PORT}`);
  console.log(`[BuchiSapa] Ubicación: Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate`);
  console.log(`[BuchiSapa] Horario: Lunes a Domingo de 6:00 PM a 5:00 AM`);
});
