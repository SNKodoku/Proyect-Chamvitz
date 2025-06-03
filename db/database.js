const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Modelo de Usuario
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  nombre: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  rol: {
    type: DataTypes.STRING,
    defaultValue: 'usuario'
  },
  cart: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      return JSON.parse(this.getDataValue('cart'));
    },
    set(value) {
      this.setDataValue('cart', JSON.stringify(value));
    }
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Modelo de Producto
const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  nombre: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  precio: DataTypes.FLOAT,
  categoria: DataTypes.STRING,
  imagen: DataTypes.STRING,
  stock: DataTypes.INTEGER
}, {
  timestamps: true,
  updatedAt: 'updatedAt'
});

// Sincronizar modelos con la base de datos
async function inicializarDB() {
  try {
    await sequelize.sync({ force: true }); // force: true solo en desarrollo!
    console.log('Base de datos sincronizada');
    
    // Datos iniciales
    await Usuario.bulkCreate([
      {
        id: "1747710917459",
        nombre: "Admin",
        email: "admin@example.com",
        password: "$2b$10$Csr.A4oG45n95y6VEvyKN.u4Yse5EsZpEsvWY0A66hBibcBGAa1ly",
        rol: "admin"
      },
      {
        id: "1746699141728",
        nombre: "Jonathan Córdoba",
        email: "jonathanvcc@gmail.com",
        password: "$2b$10$nwdv59PowfL64Me5K2xyY.T8Cm1/ZcxYYLaBtqp9CLUMTWJSuO4/G",
        rol: "usuario"
      }
    ]);
    
    await Producto.bulkCreate([
      {
        id: "1",
        nombre: "Laptop HP",
        descripcion: "Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD",
        precio: 899.99,
        categoria: "Electrónicos",
        imagen: "/img/laptop.jpg",
        stock: 12
      },
      {
        id: "2",
        nombre: "Smartphone Samsung",
        descripcion: "Smartphone Samsung Galaxy S21 con 128GB de almacenamiento",
        precio: 799.99,
        categoria: "Electrónicos",
        imagen: "/img/smartphone.webp",
        stock: 15
      },
      {
        id: "3",
        nombre: "Zapatos Deportivos",
        descripcion: "Zapatos deportivos para correr, tallas disponibles del 38 al 45",
        precio: 59.99,
        categoria: "Ropa",
        imagen: "/img/tenis.webp",
        stock: 30
      },
      {
        id: "4",
        nombre: "Lavadora",
        descripcion: "Lavadora automática Mabe LMX79114WDAB0 19 kg",
        precio: 1200.99,
        categoria: "Linea Blanca",
        imagen: "/uploads/1747694783563.jpeg",
        stock: 0
      }
    ]);
    
    console.log('Datos iniciales cargados');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

module.exports = { 
  sequelize,
  Usuario,
  Producto,
  inicializarDB
};