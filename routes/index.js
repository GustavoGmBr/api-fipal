import { Router } from 'express'
import authRoutes      from './auth.routes.js'
import usuarioRoutes   from './usuario.routes.js'
import livrosRoutes    from './livros.routes.js'
import capitulosRoutes from './capitulos.routes.js'
import blocosTextoRoutes from './blocos_texto.routes.js'
import calculadoraRoutes  from './calculadora.routes.js'
import personagemRoutes from './personagem.routes.js'
import racaRoutes from './raca.routes.js'; // <-- Importe aqui

const router = Router()

router.use('/auth',        authRoutes)      
router.use('/usuarios',    usuarioRoutes)
router.use('/livros',      livrosRoutes)
router.use('/capitulos',   capitulosRoutes)
router.use('/blocos-texto', blocosTextoRoutes)
router.use('/calculadora', calculadoraRoutes)
router.use('/personagens', personagemRoutes)
router.use('/racas', racaRoutes)
export default router