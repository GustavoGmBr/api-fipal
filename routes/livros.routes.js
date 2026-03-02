// routes/livros.routes.js
import { Router } from 'express'
import { livrosController } from '../controllers/livros.controller.js'
const router = Router()
router.get('/',    livrosController.listarTodos)
router.get('/:id', livrosController.buscarPorId)
router.post('/',   livrosController.criar)
router.put('/:id', livrosController.atualizar)
router.delete('/:id', livrosController.deletar)
export default router