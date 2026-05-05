import { Router } from 'express';
import LocalController from '../../controllers/local.controller.js';

const router = Router();

// 🌍 Rotas Públicas
router.get('/', LocalController.index);
router.get('/:id', LocalController.show); // ✅ ADICIONE ESTA LINHA

export default router;