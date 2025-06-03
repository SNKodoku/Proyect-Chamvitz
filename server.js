const express = require('express');
const fs = require('fs').promises;
const session = require('express-session');
const multer = require('multer'); // Para subir imagenes
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { Usuario, Producto, inicializarDB } = require('./db/database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Error: Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
  }
});

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key-12345',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Middlewares de autenticación
function esAutenticado(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Debes iniciar sesión' });
}
function esAdmin(req, res, next) {
  if (req.session.user && req.session.user.rol === 'admin') return next();
  res.status(403).send('Acceso denegado. Se requieren privilegios de administrador');
}


app.use(express.static(path.join(__dirname, 'public')));

// Servir los archivos estáticos (CSS, imágenes, JS, etc.)
app.use(express.static(path.join(__dirname, 'views')));

// Redireccionar a index.html por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.send('¡Express y express-session funcionando!');
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Servir los archivos HTML, CSS, JS

const db = new sqlite3.Database('./database.sqlite'); // Cambia el nombre de la BD

// Ejemplo: Crear la tabla de profesionales si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS profesionales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    oficio TEXT,
    estado TEXT,
    ciudad TEXT,
    colonia TEXT,
    descripcion TEXT,
    experiencia TEXT,
    contacto TEXT,
    foto TEXT
  )
`);

// Ruta para registrar profesional
app.post('/api/profesionales', (req, res) => {
  const { nombre, oficio, estado, ciudad, colonia, descripcion, experiencia, contacto, foto } = req.body;
  db.run(
    `INSERT INTO profesionales (nombre, oficio, estado, ciudad, colonia, descripcion, experiencia, contacto, foto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, oficio, estado, ciudad, colonia, descripcion, experiencia, contacto, foto],
    function(err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID });
    }
  );
});

// Ruta para buscar profesionales con filtros
app.get('/api/profesionales', (req, res) => {
  const { oficio, estado, ciudad, colonia } = req.query;
  let query = `SELECT * FROM profesionales WHERE 1=1`;
  const params = [];

  if (oficio) { query += ` AND oficio LIKE ?`; params.push(`%${oficio}%`); }
  if (estado) { query += ` AND estado LIKE ?`; params.push(`%${estado}%`); }
  if (ciudad) { query += ` AND ciudad LIKE ?`; params.push(`%${ciudad}%`); }
  if (colonia) { query += ` AND colonia LIKE ?`; params.push(`%${colonia}%`); }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Ruta para obtener perfil individual
app.get('/api/profesional/:id', (req, res) => {
  db.get(`SELECT * FROM profesionales WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    res.json(row);
  });
});

// Profesionales
app.get('/profesionales.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profesionales.html'));
});

// Perfil
app.get('/perfil.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'perfil.html'));
});

// Registro
app.get('/registrar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

// Contacto
app.get('/contacto.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contacto.html'));
});

// Las rutas API y demás ya las tienes (GET /api/profesionales, etc.)


app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
