import { Router } from 'express'
import { personagemController } from '../controllers/personagem.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/',               authMiddleware, personagemController.listarTodos)
router.get('/comparar',       authMiddleware, personagemController.comparar)
router.get('/:id',            authMiddleware, personagemController.buscarPorId)
router.post('/',              authMiddleware, personagemController.criar)
router.put('/:id',            authMiddleware, personagemController.atualizar)
router.delete('/:id',         authMiddleware, personagemController.deletar)
router.post('/:id/progressao',authMiddleware, personagemController.adicionarProgressao)

export default router