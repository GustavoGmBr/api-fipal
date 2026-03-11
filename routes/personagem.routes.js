import { Router } from 'express'
import { personagemController } from '../controllers/personagem.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/upload.middleware.js'

const router = Router()

// Rotas de leitura (GET)
router.get('/', authMiddleware, personagemController.listarTodos)
router.get('/comparar', authMiddleware, personagemController.comparar)
router.get('/:id', authMiddleware, personagemController.buscarPorId)

// Rota de criação (POST) com upload de múltiplas imagens
router.post('/', authMiddleware, upload.fields([
  { name: 'imagem_full', maxCount: 1 },
  { name: 'imagem_rosto', maxCount: 1 }
]), personagemController.criar)

// Rota de atualização (PUT) com upload de múltiplas imagens
router.put('/:id', authMiddleware, upload.fields([
  { name: 'imagem_full', maxCount: 1 },
  { name: 'imagem_rosto', maxCount: 1 }
]), personagemController.atualizar)

// Outras rotas (DELETE, POST progressão)
router.delete('/:id', authMiddleware, personagemController.deletar)
router.post('/:id/progressao', authMiddleware, personagemController.adicionarProgressao)

export default router