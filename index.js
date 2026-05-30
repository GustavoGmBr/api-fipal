import express from 'express';
import cors from 'cors';
import os from 'os'; // Módulo nativo, não caminho relativo

const app = express();
const port = process.env.PORT || 3334;
const host = '0.0.0.0'; // Escuta em todas as interfaces de rede

// Middlewares
app.use(cors());
app.use(express.json());

// Função para obter o IP da rede local (primeiro IPv4 não interno)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // fallback
}

// Corrige serialização de BigInt para JSON (evita erro "BigInt não serializável")
BigInt.prototype.toJSON = function () { return this.toString(); };

// Rotas
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando!');
});

// Rota /api de exemplo
app.get('/api', (req, res) => {
  res.json({ message: 'API online', timestamp: new Date().toISOString() });
});

// Handler 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicia o servidor em todas as interfaces
app.listen(port, host, () => {
  const localIP = getLocalIP();
  console.log(`🚀 Servidor rodando em:`);
  console.log(`   Local:    http://localhost:${port}`);
  console.log(`   Network:  http://${localIP}:${port}`);
});