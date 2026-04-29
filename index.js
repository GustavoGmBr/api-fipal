import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

// ✅ CORS atualizado e completo
// Configuração do CORS
app.use(cors({
  origin: '*', // Na produção, substitua '*' pelo domínio do seu front-end (ex: 'https://seusite.com.br')
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <-- AQUI É O SEGREDO! Adicione o 'PATCH'
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())
app.use('/api', router)

app.get('/', (req, res) => {
  res.json({ message: '🚀 SetimoElemento API rodando!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})