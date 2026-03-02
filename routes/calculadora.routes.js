import { Router } from 'express'
import { calculadoraController } from '../controllers/calculadora.controller.js'

const router = Router()

router.get('/dados', calculadoraController.getDados)

export default router