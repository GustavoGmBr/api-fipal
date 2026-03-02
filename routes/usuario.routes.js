// routes/usuario.routes.js
import { Router } from 'express'
import { usuarioController } from '../controllers/usuario.controller.js'
const router = Router()
router.get('/',    usuarioController.listarTodos)
router.get('/:id', usuarioController.buscarPorId)
router.post('/',   usuarioController.criar)
router.put('/:id', usuarioController.atualizar)
router.delete('/:id', usuarioController.deletar)
export default router