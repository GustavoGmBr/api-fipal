import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

// ✅ CORS atualizado e completo
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://setimoelemento.com.br',
    'http://setimoelemento.com.br'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // ⚠️ FALTAVA ISSO: Libera os métodos, incluindo o OPTIONS do Preflight
  allowedHeaders: ['Content-Type', 'Authorization'], // ⚠️ Libera o Token JWT
  credentials: true
}))

app.use(express.json())
app.use('/api', router)

app.get('/', (req, res) => {
  res.json({ message: '🚀 SetimoElemento API rodando!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})