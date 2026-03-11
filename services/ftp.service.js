import FtpDeploy from 'ftp-deploy'
import fs        from 'fs'
import path      from 'path'
import os        from 'os'
import crypto    from 'crypto'

const ftpService = {
  
  // Recebe o objeto file do Multer, a subpasta de destino e um nome customizado opcional
  async uploadFile(file, subPasta = 'personagens', customName = null) {
    try {
      const extensao = path.extname(file.originalname);
      
      // 1. Define o nome final do arquivo
      let nomeFinal;
      if (customName) {
        // Ex: Goku_SuperSaiyajin_Rosto_171562888.png
        nomeFinal = `${customName}_${Date.now()}${extensao}`;
      } else {
        // Fallback de segurança
        nomeFinal = `${crypto.randomUUID()}${extensao}`;
      }

      // 2. Cria uma pasta temporária EXCLUSIVA para este upload
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-'));
      const tmpFile = path.join(tmpDir, nomeFinal);

      // 3. Salva o buffer do Multer no arquivo temporário
      fs.writeFileSync(tmpFile, file.buffer);

      const ftpDeploy = new FtpDeploy();

      // 4. Monta o caminho remoto na HostGator
      const remotePath = `/setimoelemento.com.br/uploads/${subPasta}/`.replace(/\/+/g, '/');

      await ftpDeploy.deploy({
        user:         process.env.FTP_USER,
        password:     process.env.FTP_PASSWORD,
        host:         process.env.FTP_HOST,
        port:         21,
        localRoot:    tmpDir,
        remoteRoot:   remotePath,
        include:      ['*'],     
        deleteRemote: false,     // ← nunca apaga outras imagens!
        forcePasv:    true
      });

      // 5. Limpeza: Remove o arquivo e a pasta temporária do servidor Node
      fs.unlinkSync(tmpFile);
      fs.rmdirSync(tmpDir);

      // 6. Retorna a URL pública final para salvar no banco de dados
      const urlPublica = `https://setimoelemento.com.br/uploads/${subPasta}/${nomeFinal}`.replace(/(?<!:)\/+/g, '/');
      
      return urlPublica;

    } catch (error) {
      console.error("Erro no upload FTP:", error);
      throw new Error("Falha ao enviar imagem para o servidor de arquivos.");
    }
  }
}

export default ftpService;