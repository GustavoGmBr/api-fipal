import { Router } from 'express';
import multer from 'multer';
import { uploadFotosVeiculo, uploadPericiaVeiculo } from '../config/uploadVeiculo.js';

const router = Router();

router.post('/fotos', (req, res) => {
  uploadFotosVeiculo.array('fotos', 10)(req, res, (err) => {
    if (err) {
      const message = err instanceof multer.MulterError ? err.message : err.message;
      return res.status(400).json({ success: false, error: message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada' });
    }

    const files = req.files.map((file) => ({
      url: `/images/veiculos/${req.body.placa}/${file.filename}`,
      filename: file.filename,
    }));

    return res.json({ success: true, data: { files, quantidade: files.length } });
  });
});

router.post('/pericia', (req, res) => {
  uploadPericiaVeiculo.single('pericia')(req, res, (err) => {
    if (err) {
      const message = err instanceof multer.MulterError ? err.message : err.message;
      return res.status(400).json({ success: false, error: message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum PDF enviado' });
    }

    return res.json({
      success: true,
      data: {
        url: `/images/veiculos/${req.body.placa}/${req.file.filename}`,
        filename: req.file.filename,
      },
    });
  });
});

export default router;