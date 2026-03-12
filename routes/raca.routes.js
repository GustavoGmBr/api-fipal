import { Router } from 'express';
import { racaController } from '../controllers/raca.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', racaController.listar);

export default router;