import { Router } from 'express';
import personagemPublic from './Public/personagem.routes.js';
import personagemPrivate from './Private/personagem.routes.js';
import authRoutes from './Public/auth.routes.js';
import racaPublic from './Public/raca.routes.js';
import racaPrivate from './Private/raca.routes.js';
import sistemaPublic from './Public/sistema.routes.js';
import sistemaPrivate from './Private/sistema.routes.js';
import historicoPublic from './Public/historico.routes.js';
import historicoPrivate from './Private/historico.routes.js';
import livroPublic from './Public/livro.routes.js';
import livroPrivate from './Private/livro.routes.js';
import capituloPublic from './Public/capitulo.routes.js';
import capituloPrivate from './Private/capitulo.routes.js';
import itemPublic from './Public/item.routes.js';
import itemPrivate from './Private/item.routes.js';
import localPublic from './Public/locais.routes.js';
import localPrivate from './Private/locais.routes.js';
const router = Router();

// 🔑 Autenticação
router.use('/auth', authRoutes);

// 👥 Personagens
router.use('/public/personagens', personagemPublic);
router.use('/private/personagens', personagemPrivate);

// 🧌 Racas
router.use('/public/racas', racaPublic);
router.use('/private/racas', racaPrivate);

// 🖥️ Sistema
router.use('/public/sistemas', sistemaPublic);
router.use('/private/sistemas', sistemaPrivate);

// 📜 Histórico
router.use('/public/historicos', historicoPublic);
router.use('/private/historicos', historicoPrivate);

// 📖 Livro
router.use('/public/livros', livroPublic);
router.use('/private/livros', livroPrivate);


// 📄 Capitulo
router.use('/public/capitulos', capituloPublic);
router.use('/private/capitulos', capituloPrivate);

// ⚔️ Itens
router.use('/public/itens', itemPublic);
router.use('/private/itens', itemPrivate);

// 📍 Locais
router.use('/public/locais', localPublic);
router.use('/private/locais', localPrivate);

export default router;