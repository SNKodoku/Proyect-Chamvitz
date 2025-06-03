const { sequelize } = require('./db/database');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a SQLite establecida correctamente');
  } catch (error) {
    console.error('Error de conexión:', error);
  } finally {
    await sequelize.close();
  }
}

test();