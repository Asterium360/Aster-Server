import express, { Router } from "express";
import * as asteriumController from "../controllers/asterium.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {createDiscoverySchema, updateDiscoverySchema, idParamSchema,} from "../schemas/asterium.schema.js";

const asteriumRouter = express.Router();

// Listado de descubrimientos publicados (solo usuarios logueados)
asteriumRouter.get("/", requireAuth, asteriumController.listPublished);

//Obtener un descubrimiento ESPECÍFICO por ID (solo usuarios logueados)
asteriumRouter.get("/:id", requireAuth, validate(idParamSchema, "params"), asteriumController.getDiscovery);

// Crear un descubrimiento (por defecto: solo admin, aunque podrías cambiar a permitir "user")
asteriumRouter.post("/", requireAuth, validate(createDiscoverySchema), asteriumController.createDiscovery);

// Actualizar un descubrimiento
asteriumRouter.put("/:id", requireAuth,
  validate(idParamSchema, "params"),   // 👈 valida el parámetro de la URL
  validate(updateDiscoverySchema, "body"), // 👈 valida el body
  asteriumController.updateDiscovery
);

// Eliminar un descubrimiento
asteriumRouter.delete("/:id", requireAuth, validate(idParamSchema, "params"), asteriumController.deleteDiscovery);

export default asteriumRouter;
