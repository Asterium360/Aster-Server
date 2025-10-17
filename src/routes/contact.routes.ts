import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { postContact } from '../controllers/contact.controller.js';
import { optionalAuth } from '../middlewares/optionalAuth.js';


const router = Router();

// Anti-spam sencillo: 10 peticiones / 10 min por IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', optionalAuth, limiter, postContact);

export default router;
