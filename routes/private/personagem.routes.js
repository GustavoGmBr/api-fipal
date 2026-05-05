import { Router } from 'express';
import personagemController from '../../controllers/personagem.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.js'; // Seu middleware do Multer

const router = Router();

// Aplica o middleware de autenticação em todas as rotas deste arquivo
router.use(authMiddleware);

router.post('/', 
  upload.fields([{ name: 'corpo', maxCount: 1 }, { name: 'rosto', maxCount: 1 }]), 
  personagemController.criar
);

router.put('/:id', 
  upload.fields([{ name: 'corpo', maxCount: 1 }, { name: 'rosto', maxCount: 1 }]), 
  personagemController.atualizar
);

router.delete('/:id', personagemController.deletar);

export default router;