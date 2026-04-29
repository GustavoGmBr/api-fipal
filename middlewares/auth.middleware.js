import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
    req.usuarioId = decoded.id;
    req.nivelAcesso = decoded.nivel;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export default authMiddleware;