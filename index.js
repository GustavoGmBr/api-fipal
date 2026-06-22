import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import router from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Setimo Elemento API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', router);
app.use('/', router);

app.use((req, res) => {
  console.log(`⚠️ Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Rota ${req.method} ${req.url} não encontrada no servidor.` });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const port = process.env.PORT || 3334;
const host = '0.0.0.0';

app.listen(port, host, () => {
  const localIP = getLocalIP();
  console.log(`🚀 Server running on:`);
  console.log(`   Local:    http://localhost:${port}`);
  console.log(`   Network:  http://${localIP}:${port}`);
});