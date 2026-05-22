import { Router } from 'express';
import personagemFormaController from '../../controllers/personagemForma.controller.js';

const router = Router();

// Listar todas as formas de um determinado personagem (público)
router.get('/personagem/:personagemId', personagemFormaController.listarPorPersonagem);

export default router;