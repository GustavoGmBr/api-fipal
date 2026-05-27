import jwt from 'jsonwebtoken';

export const loginRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o header de autorização foi enviado
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  // 2. O formato esperado é: "Bearer TOKEN_AQUI"
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  // 3. Verifica e decodifica o token
  jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    // 4. Injeta o ID e o nível de acesso do usuário dentro da requisição (req)
    // para que os controllers possam usar depois
    req.userId = decoded.id;
    req.userNivel = decoded.nivel_acesso;

    return next(); // Tudo certo! Segue para o Controller
  });
};