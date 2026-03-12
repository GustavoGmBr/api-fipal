import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  // 1. Libera a passagem livre para requisições de segurança do navegador (Preflight)
  if (req.method === 'OPTIONS') {
    return next()
  }


  const authHeader = req.headers.authorization

  // 4. Extrai apenas o token (tira a palavra "Bearer ")
  const token = authHeader.split(' ')[1]

  try {
    // 5. Verifica se o token é válido e não expirou
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Salva os dados do usuário na requisição para podermos usar nos controllers se precisar
    req.usuario = decoded
    
    console.log('[AUTH] ✅ Token válido! Passando para o controller...')
    next()
  } catch (error) {
    console.log('[AUTH] ❌ Erro: Token inválido ou expirado')
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}