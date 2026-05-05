import { Router } from 'express';
import authController from '../../controllers/auth.controller.js';

const router = Router();

// Rota: POST /api/auth/login
router.post('/login', authController.login);

export default router;