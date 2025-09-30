import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

// tiempo de vida del token
const TOKEN_TTL = "15m";

function sendSequelizeError(err, res) {
  if (err?.name === "SequelizeUniqueConstraintError") {
    const field = err?.errors?.[0]?.path || "dato";
    return res.status(409).json({ error: `${field} en uso` });
  }
  if (err?.name === "SequelizeValidationError") {
    const msg = err?.errors?.[0]?.message || "Datos inválidos";
    return res.status(400).json({ error: msg });
  }
  console.error("[AUTH] Error no controlado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}

export const registerController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email y password son obligatorios." });
    }

    // Comprobación previa de duplicado (evita chocar con unique)
    const prev = await UserModel.findOne({ where: { email: String(email).toLowerCase().trim() } });
    if (prev) return res.status(409).json({ error: "email en uso" });

    // Creamos: el modelo hashea automáticamente el password si viene en texto plano
    const user = await UserModel.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password), // <-- texto plano; el hook lo hashea
      role: role === "admin" ? "admin" : "user",
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[CONFIG] Falta JWT_SECRET");
      return res.status(500).json({ error: "Configuración JWT faltante" });
    }

    const payload = { sub: String(user.id), role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: TOKEN_TTL });

    // user está bajo defaultScope, no incluye password
    return res.status(201).json({
      message: "usuario registrado exitosamente",
      token,
      user,
    });
  } catch (error) {
    return sendSequelizeError(error, res);
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios." });
    }

    // Necesitamos el hash → usar scope que incluya password
    const user = await UserModel.scope("withPassword").findOne({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[CONFIG] Falta JWT_SECRET");
      return res.status(500).json({ error: "Configuración JWT faltante" });
    }

    const payload = { sub: String(user.id), role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: TOKEN_TTL });

    // Devuelve el usuario sin el hash (aplicamos defaultScope de nuevo)
    const safeUser = await UserModel.findByPk(user.id); // defaultScope oculta password
    return res.json({ message: "login exitoso", token, user: safeUser });
  } catch (error) {
    return sendSequelizeError(error, res);
  }
};
