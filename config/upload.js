import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(
      __dirname,        // backend/config
      '..',             // backend/
      '..',             // raiz do projeto
      'frontend',
      'public',
      'images',
      'usuarios'
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const nome = req.body.nome
      ? req.body.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
      : `usuario_${Date.now()}`;

    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${nome}_${timestamp}${ext}`);  // "joao_1712345678901.jpg"
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpeg', '.jpg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Apenas JPEG, JPG e PNG são permitidos.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;