import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod/v3";


//middleware de validacion con zod
export function validate(schema: AnyZodObject) {
return (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        next();
    } catch (err:any){
        return res.status(400).json({
            error: "Error de validación",
            details: err.errors.map((e:any) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    } 
};
}