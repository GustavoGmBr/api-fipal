// routes/capitulos.routes.js
import { Router } from 'express'
import { capitulosController } from '../controllers/capitulos.controller.js'
const router = Router()
router.get('/',                     capitulosController.listarTodos)
router.get('/:id',                  capitulosController.buscarPorId)
router.get('/livro/:livro_id',      capitulosController.listarPorLivro)
router.post('/',                    capitulosController.criar)
router.put('/:id',                  capitulosController.atualizar)
router.delete('/:id',               capitulosController.deletar)
export default router