import multer from 'multer'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const tipos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    tipos.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Apenas JPG, PNG ou WEBP são permitidos'))
  }
})