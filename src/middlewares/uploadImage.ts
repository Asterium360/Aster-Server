import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// 🪄 Cloudinary crea la carpeta automáticamente si no existe
const storage = new CloudinaryStorage({
cloudinary,
params: {
    folder: "Asterium_Discoveries", // ✅ sin espacios, Cloudinary la crea sola
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
  } as any, // ← evita error de tipado en TypeScript
});

export const upload = multer({ storage });
