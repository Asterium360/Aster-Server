import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './db.js';

const app = express()

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Ruta de prueba
app.get('/', (_req, res) => {
  res.json({ message: 'AstroDiscover API 🚀 funcionando!' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);
  }
})();
