import 'dotenv/config';
import { sequelize } from './db.js';
import app from './app.js';
import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    await sequelize.sync({});
    console.log('📦 Tablas sincronizadas');

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
    }
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    process.exit(1);
  }
})();
