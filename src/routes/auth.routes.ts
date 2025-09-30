import express, { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const authRouter = express.Router();

// Registro de usuario
authRouter.post("/register", validate(registerSchema), authController.register);

// Login de usuario
authRouter.post("/login", validate(loginSchema), authController.login);

// Bonus: promover a admin (solo un admin puede hacerlo)
authRouter.put("/promote/:id", requireAuth, requireAdmin, authController.promoteToAdmin);

export default authRouter;
