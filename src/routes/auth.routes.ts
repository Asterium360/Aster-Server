import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router(); 

//Registro de usuario
router.post("/resgister", validate(registerSchema), (req, res) =>{
    res.json ({
        message: "Registro válido ✅",
        data: req.body,
    });
});

//Login de usuario 
router.post("/login", validate(loginSchema), (req, res)=> {
    res.json({
        message: "Login válido ✅",
        data: req.body,
    });
});

export default router;

