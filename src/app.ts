// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Importa modelos para que Sequelize conozca las tablas y define asociaciones
import { User } from './models/User.js';
import { Asterium } from './models/Asterium.js';
import { ContactMessage } from './models/ContactMessage.js';

import authRoutes from './routes/auth.routes.js';
import asteriumRoutes from './routes/asterium.routes.js';
import contactRoutes from './routes/contact.routes.js';

// Asociaciones
User.hasMany(Asterium, { foreignKey: 'author_id', as: 'discoveries' });
Asterium.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

User.hasMany(ContactMessage, { foreignKey: 'user_id', as: 'contacts' });
ContactMessage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/asterium', asteriumRoutes);
app.use('/contact', contactRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'AstroDiscover API 🚀 funcionando!' });
});


app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});


export default app;
