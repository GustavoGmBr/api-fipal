// routes/blocos_texto.routes.js
import { Router } from 'express'
import { blocosTextoController } from '../controllers/blocos_texto.controller.js'
const router = Router()
router.get('/',                          blocosTextoController.listarTodos)
router.get('/:id',                       blocosTextoController.buscarPorId)
router.get('/capitulo/:capitulo_id',     blocosTextoController.listarPorCapitulo)
router.post('/',                         blocosTextoController.criar)
router.put('/reordenar',                 blocosTextoController.reordenar) // ⚠️ antes de /:id
router.put('/:id',                       blocosTextoController.atualizar)
router.delete('/:id',                    blocosTextoController.deletar)
export default router