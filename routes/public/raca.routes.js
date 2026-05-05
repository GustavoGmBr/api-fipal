import { Router } from 'express';
import racaController from '../../controllers/raca.controller.js';

const router = Router();

router.get('/', racaController.index); // Listar
router.get('/:id', racaController.show); // Buscar por ID

export default router;