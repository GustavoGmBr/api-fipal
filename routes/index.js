import { Router } from 'express';
import usuarioRoutes from "./usuario.routes.js"; // 🛠️ Ajustado para o singular

const router = Router();

router.use('/usuarios', usuarioRoutes);

export default router;