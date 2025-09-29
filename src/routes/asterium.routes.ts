import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createPostSchema } from "../schemas/asterium.schema.js"; 
//import type { id } from "zod/locales";

const router = Router();

//Crear un descubriemiento (Este requiere login)
router.post("/", requireAuth, validate(createPostSchema), (req, res)=>{
    res.json({
        message: "Post creado correctamente ✅",
        data: req.body,
    });
});

//Listar todos los descubriemientos
router.get("/", (_req, res)=>{
    res.json({
        message: "Lista de descubrimientos ✅",
        data: [],
    });
});

//Obtener un descubrimiento por ID
router.get("/:id", (req,res)=> {
    res.json({
        message: "Detalle del descubrimiento ✅",
        id: req.params.id,
    });
});

//Actualizar el descubrimiento por ID
router.put("/:id", requireAuth, validate(createPostSchema), (req, res)=> {
    res.json({
        message: "Descubrimiento actualizado ✅",
        id: req.params.id,
        data: req.body,
    });
});

//Eliminar un descubrimiento por ID, esto requiere login
router.delete("/:id", requireAuth, (req, res) => {
    res.json({
        message: "Descubrimiento eliminado ✅",
        id: req.params.id
    });
});

export default router;