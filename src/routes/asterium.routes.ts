import express, { Router } from "express";
import * as asteriumController from "../controllers/asterium.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {createDiscoverySchema, updateDiscoverySchema, idParamSchema,} from "../schemas/asterium.schema.js";

const asteriumRouter = express.Router();

// Listado público de descubrimientos publicados
asteriumRouter.get("/", asteriumController.listPublished);

// Crear un descubrimiento (por defecto: solo admin, aunque podrías cambiar a permitir "user")
asteriumRouter.post("/", requireAuth, validate(createDiscoverySchema), asteriumController.createDiscovery);

// Actualizar un descubrimiento
asteriumRouter.put("/:id", requireAuth, validate(idParamSchema), validate(updateDiscoverySchema), asteriumController.updateDiscovery);

// Eliminar un descubrimiento
asteriumRouter.delete("/:id", requireAuth, validate(idParamSchema), asteriumController.deleteDiscovery);

export default asteriumRouter;
