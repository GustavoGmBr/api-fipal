import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sanitizarIdentificador } from '../utils/sanitize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  fotos: {
    mimes: ['image/jpeg', 'image/png', 'image/jpg'],
    ext: ['.jpeg', '.jpg', '.png'],
  },
  pericia: {
    mimes: ['application/pdf'],
    ext: ['.pdf'],
  },
};

function createUploadConfig(tipo) {
  const config = MIME_TYPES[tipo];

  if (!config) {
    throw new Error(`Tipo de upload inválido: ${tipo}. Use "fotos" ou "pericia".`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const identificadorRaw = req.body.identificador || req.params.identificador || 'temp';
      const identificador = sanitizarIdentificador(identificadorRaw);

      // Garante que o identificador sanitizado volte no body para uso posterior
      req.body.identificador = identificador;

      // Sobe: backend/config/ → backend/ → raiz → frontend/public/images/veiculos/[identificador]
      const pastaVeiculo = path.resolve(
        __dirname,        // backend/config
        '..',             // backend/
        '..',             // raiz do projeto
        'frontend',
        'public',
        'images',
        'veiculos',
        identificador,
      );

      const pastaDestino = tipo === 'fotos'
        ? path.join(pastaVeiculo, 'fotos')
        : pastaVeiculo;

      fs.mkdirSync(pastaDestino, { recursive: true });
      cb(null, pastaDestino);
    },
    filename: (req, file, cb) => {
      const identificador = req.body.identificador || 'veiculo';

      if (tipo === 'pericia') {
        cb(null, 'pericia.pdf');
      } else {
        const ext = path.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        cb(null, `${identificador}_${timestamp}${ext}`);
      }
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.ext.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Formato inválido para ${tipo}. Permitidos: ${config.ext.join(', ')}`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: tipo === 'pericia' ? 15 * 1024 * 1024 : 10 * 1024 * 1024,
    },
  });
}

export const uploadFotosVeiculo = createUploadConfig('fotos');
export const uploadPericiaVeiculo = createUploadConfig('pericia');