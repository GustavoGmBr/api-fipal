import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/',       authMiddleware, usuarioController.listarTodos)
router.get('/:id',    authMiddleware, usuarioController.buscarPorId)
router.post('/',      authMiddleware, usuarioController.criar)
router.put('/:id',    authMiddleware, usuarioController.atualizar)
router.delete('/:id', authMiddleware, usuarioController.deletar)

export default router