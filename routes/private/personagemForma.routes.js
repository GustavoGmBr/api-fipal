import { Router } from 'express';
import personagemFormaController from '../../controllers/personagemForma.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
// Importe seu middleware do multer que lida com upload de múltiplos arquivos, ex: upload.fields()
import upload from '../../middlewares/upload.js';
const router = Router();

router.use(authMiddleware);

// Configuração do multer para aceitar os dois arquivos de imagem
const uploadCampos = upload.fields([
  { name: 'rosto', maxCount: 1 },
  { name: 'corpo', maxCount: 1 }
]);

// CRUD Privado de Formas/Transformações
router.post('/', uploadCampos, personagemFormaController.criar);
router.put('/:id', uploadCampos, personagemFormaController.atualizar);
router.delete('/:id', personagemFormaController.deletar);

export default router;