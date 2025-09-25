// src/index.ts
import 'dotenv/config';
import app from './app.js';
import { sequelize } from './db.js';
import './models/associations.js'; // registra relaciones

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync(); // crea tablas a partir de modelos (solo dev)
    }
    console.log('✅ Conectado a MySQL');
    app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
  } catch (e) {
    console.error('❌ Error al conectar a MySQL:', e);
    process.exit(1);
  }
})();
