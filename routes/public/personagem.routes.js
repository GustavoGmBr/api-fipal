import { Router } from 'express';
import personagemController from '../../controllers/personagem.controller.js';

const router = Router();

// Caminho base será definido no index.js
router.get('/', personagemController.listar);
router.get('/:id', personagemController.buscarPorId);
router.get('/:id/leitura/:capituloId', personagemController.buscarParaLeitura);
export default router;