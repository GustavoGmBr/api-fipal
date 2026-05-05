import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('⚠️ Tentativa de acesso sem token');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
    
    // ✅ Injeta os dados do usuário na requisição para uso nos controllers
    req.usuarioId = decoded.id;
    req.nivelAcesso = decoded.nivel;
    
    return next();
  } catch (err) {
    console.error('❌ Erro na validação do Token:', err.message);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export default authMiddleware;