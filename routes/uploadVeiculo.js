import { Router } from 'express';
import multer from 'multer';
import { uploadFotosVeiculo, uploadPericiaVeiculo } from '../config/uploadVeiculo.js';

const router = Router();

/**
 * POST /uploadVeiculo/veiculo/fotos
 * Body: { identificador: "Onix_ABC1D23" } + campo "fotos" (multiple)
 */
router.post('/veiculo/fotos', (req, res) => {
  uploadFotosVeiculo.array('fotos', 10)(req, res, (err) => {
    if (err) {
      const message = err instanceof multer.MulterError ? err.message : err.message;
      return res.status(400).json({ success: false, error: message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada' });
    }

    const files = req.files.map((file) => ({
      url: `/images/veiculos/${req.body.identificador}/fotos/${file.filename}`,
      filename: file.filename,
    }));

    return res.json({ success: true, data: { files, quantidade: files.length } });
  });
});

/**
 * POST /uploadVeiculo/veiculo/pericia
 * Body: { identificador: "Onix_ABC1D23" } + campo "pericia" (PDF único)
 */
router.post('/veiculo/pericia', (req, res) => {
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
        url: `/images/veiculos/${req.body.identificador}/pericia.pdf`,
        filename: 'pericia.pdf',
      },
    });
  });
});

/**
 * POST /uploadVeiculo/veiculo/completo
 * Faz upload de fotos + perícia em uma única chamada
 */
router.post('/veiculo/completo', (req, res, next) => {
  const { identificador } = req.body;

  if (!identificador) {
    return res.status(400).json({ success: false, error: 'identificador é obrigatório' });
  }

  uploadPericiaVeiculo.single('pericia')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: `Erro na perícia: ${err.message}` });
    }

    uploadFotosVeiculo.array('fotos', 10)(req, res, (err2) => {
      if (err2) {
        return res.status(400).json({ success: false, error: `Erro nas fotos: ${err2.message}` });
      }

      const response = { success: true, data: { identificador } };

      if (req.file) {
        response.data.pericia = `/images/veiculos/${identificador}/pericia.pdf`;
      }

      if (req.files && req.files.length > 0) {
        response.data.fotos = req.files.map(
          (f) => `/images/veiculos/${identificador}/fotos/${f.filename}`,
        );
        response.data.quantidade_fotos = req.files.length;
      }

      return res.json(response);
    });
  });
});

export default router;