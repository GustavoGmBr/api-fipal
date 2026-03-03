import { Router } from 'express'
import { personagemController } from '../controllers/personagem.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/upload.middleware.js'

const router = Router()

router.get('/',               authMiddleware, personagemController.listarTodos)
router.get('/comparar',       authMiddleware, personagemController.comparar)
router.get('/:id',            authMiddleware, personagemController.buscarPorId)
router.post('/',              authMiddleware, personagemController.criar)
router.put('/:id',            authMiddleware, personagemController.atualizar)
router.delete('/:id',         authMiddleware, personagemController.deletar)
router.post('/:id/progressao',authMiddleware, personagemController.adicionarProgressao)
// Aceita os dois campos de imagem
router.post('/',      authMiddleware, upload.fields([
  { name: 'imagem_full',  maxCount: 1 },
  { name: 'imagem_rosto', maxCount: 1 }
]), personagemController.criar)

router.put('/:id',    authMiddleware, upload.fields([
  { name: 'imagem_full',  maxCount: 1 },
  { name: 'imagem_rosto', maxCount: 1 }
]), personagemController.atualizar)
export default router