import * as ftp from 'basic-ftp';
import path from 'path';
import { Readable } from 'stream';

const config = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === 'true'
};

const ftpService = {
  async uploadFile(file, subPasta = 'personagens', customName = null) {
    const allowedFolders = ['personagens', 'bestiario', 'itens', 'locais'];
    
    if (!allowedFolders.includes(subPasta)) {
      console.warn(`⚠️ Pasta inválida: ${subPasta}, usando 'personagens'`);
      subPasta = 'personagens';
    }

    const client = new ftp.Client();
    // client.ftp.verbose = true; // Útil para debugar erros de permissão 550

    try {
      await client.access(config);
      
      const extensao = path.extname(file.originalname).toLowerCase();
      
      // Sanitização básica do nome: remove acentos e caracteres especiais
      const nameBase = customName 
        ? customName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
        : Date.now();

      const nomeFinal = customName 
        ? `${nameBase}_${Date.now()}${extensao}`
        : `${nameBase}${extensao}`;

      // 1. Caminho remoto (Sempre use / para FTP)
      const remoteDir = `/setimoelemento.com.br/uploads/${subPasta}`;
      await client.ensureDir(remoteDir);

      // 2. Converter Buffer em Stream
      const stream = Readable.from(file.buffer);

      // 3. Upload (Evite path.join para caminhos de servidor Linux/FTP se estiver no Windows)
      const remoteFilePath = `${remoteDir}/${nomeFinal}`;
      await client.uploadFrom(stream, remoteFilePath);

      // 4. Construção da URL pública
      const urlPublica = `https://setimoelemento.com.br/uploads/${subPasta}/${nomeFinal}`;
      
      console.log(`✅ Upload concluído: ${nomeFinal}`);
      return urlPublica;

    } catch (error) {
      console.error("❌ Erro no upload FTP:", error);
      throw new Error("Falha ao enviar imagem para o servidor.");
    } finally {
      client.close();
    }
  }
};

export default ftpService;