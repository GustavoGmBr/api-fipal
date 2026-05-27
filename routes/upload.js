import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import upload from '../config/upload.js';

const router = Router();

// Mudei de '/upload' para '/' porque o index já monta em '/upload'
router.post('/', (req, res) => {
  upload.single('foto')(req, res, (err) => {
    if (err) {
      const message =
        err instanceof multer.MulterError
          ? `Erro no upload: ${err.message}`
          : err.message;
      return res.status(400).json({ success: false, error: message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada' });
    }

    const nome = req.body.nome
      ? req.body.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
      : `usuario_${Date.now()}`;

    const ext = path.extname(req.file.originalname);
    const novoNome = `${nome}${ext}`;
    const novoPath = path.join(req.file.destination, novoNome);

    if (req.file.filename !== novoNome) {
      try {
        fs.renameSync(req.file.path, novoPath);
      } catch (renameErr) {
        return res.status(500).json({ success: false, error: 'Erro ao renomear arquivo' });
      }
    }

    const url = `/images/usuarios/${novoNome}`;

    return res.json({
      success: true,
      data: { url, filename: novoNome },
    });
  });
});

export default router;