import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './db.js';
// 🔑 importa los modelos para que Sequelize los conozca
import { User } from './models/User.js';
import { Asterium } from './models/Asterium.js';
//importa routes
import authRoutes from "./routes/auth.routes.js";
import asteriumRoutes from "./routes/asterium.routes.js";



// asociaciones (ejemplo: un usuario puede tener muchos descubrimientos)
User.hasMany(Asterium, { foreignKey: 'author_id', as: 'discoveries' });
Asterium.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use("/auth", authRoutes);
app.use("/asterium", asteriumRoutes);

// Ruta de prueba
app.get('/', (_req, res) => {
  res.json({ message: 'AstroDiscover API 🚀 funcionando!' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    // 🔑 crea las tablas si no existen
    await sequelize.sync({});
    console.log('📦 Tablas sincronizadas');

    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);
  }
})();

export default app; // para los tests
