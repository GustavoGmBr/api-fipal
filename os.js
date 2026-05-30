import os from 'os';
import express from 'express';

// Configuração do app Express
const app = express();

// ... outras configurações (rotas, middlewares) podem ser adicionadas aqui

/**
 * Obtém o IP local da máquina na rede (não loopback).
 * @returns {string} Endereço IPv4 local ou 'localhost' caso não encontre.
 */
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
const localIP = getLocalIP();

app.listen(port, host, () => {
  console.log(`🚀 Server running on:`);
  console.log(`   Local:    http://localhost:${port}`);
  console.log(`   Network:  http://${localIP}:${port}`);
});