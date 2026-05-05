import { Router } from 'express';
import personagempublic from './public/personagem.routes.js';
import personagemprivate from './private/personagem.routes.js';
import authRoutes from './public/auth.routes.js';
import racapublic from './public/raca.routes.js';
import racaprivate from './private/raca.routes.js';
import sistemapublic from './public/sistema.routes.js';
import sistemaprivate from './private/sistema.routes.js';
import historicopublic from './public/historico.routes.js';
import historicoprivate from './private/historico.routes.js';
import livropublic from './public/livro.routes.js';
import livroprivate from './private/livro.routes.js';
import capitulopublic from './public/capitulo.routes.js';
import capituloprivate from './private/capitulo.routes.js';
import itempublic from './public/item.routes.js';
import itemprivate from './private/item.routes.js';
import localpublic from './public/locais.routes.js';
import localprivate from './private/locais.routes.js';
const router = Router();

// 🔑 Autenticação
router.use('/auth', authRoutes);

// 👥 Personagens
router.use('/public/personagens', personagempublic);
router.use('/private/personagens', personagemprivate);

// 🧌 Racas
router.use('/public/racas', racapublic);
router.use('/private/racas', racaprivate);

// 🖥️ Sistema
router.use('/public/sistemas', sistemapublic);
router.use('/private/sistemas', sistemaprivate);

// 📜 Histórico
router.use('/public/historicos', historicopublic);
router.use('/private/historicos', historicoprivate);

// 📖 Livro
router.use('/public/livros', livropublic);
router.use('/private/livros', livroprivate);


// 📄 Capitulo
router.use('/public/capitulos', capitulopublic);
router.use('/private/capitulos', capituloprivate);

// ⚔️ Itens
router.use('/public/itens', itempublic);
router.use('/private/itens', itemprivate);

// 📍 Locais
router.use('/public/locais', localpublic);
router.use('/private/locais', localprivate);

export default router;