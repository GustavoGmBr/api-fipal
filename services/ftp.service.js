import FtpDeploy from 'ftp-deploy'
import fs        from 'fs'
import path      from 'path'
import os        from 'os'
import crypto    from 'crypto' // Nativo do Node para gerar IDs únicos

const ftpService = {
  
  // Recebe o objeto file do Multer e a subpasta de destino
  async uploadFile(file, subPasta = 'personagens') {
    try {
      // 1. Gera um nome de arquivo único para evitar sobrescrever imagens
      const extensao = path.extname(file.originalname);
      const nomeUnico = `${crypto.randomUUID()}${extensao}`;

      // 2. Cria uma pasta temporária EXCLUSIVA para este upload
      // Isso evita que o ftp-deploy tente ler o /tmp inteiro do servidor
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-'));
      const tmpFile = path.join(tmpDir, nomeUnico);

      // 3. Salva o buffer do Multer no arquivo temporário
      fs.writeFileSync(tmpFile, file.buffer);

      const ftpDeploy = new FtpDeploy();

      // 4. Monta o caminho remoto na HostGator
      // Ex: /setimoelemento.com.br/uploads/personagens/rosto/
      const remotePath = `/setimoelemento.com.br/uploads/${subPasta}/`.replace(/\/+/g, '/');

      await ftpDeploy.deploy({
        user:         process.env.FTP_USER,
        password:     process.env.FTP_PASSWORD,
        host:         process.env.FTP_HOST,
        port:         21,
        localRoot:    tmpDir,
        remoteRoot:   remotePath,
        include:      ['*'],     // Envia tudo que está na nossa pasta tmpDir exclusiva
        deleteRemote: false,     // ← nunca apaga outras imagens!
        forcePasv:    true
      });

      // 5. Limpeza: Remove o arquivo e a pasta temporária do servidor Node
      fs.unlinkSync(tmpFile);
      fs.rmdirSync(tmpDir);

      // 6. Retorna a URL pública final para salvar no banco de dados
      // Ex: https://setimoelemento.com.br/uploads/personagens/rosto/1234-abcd.jpg
      const urlPublica = `https://setimoelemento.com.br/uploads/${subPasta}/${nomeUnico}`.replace(/(?<!:)\/+/g, '/');
      
      return urlPublica;

    } catch (error) {
      console.error("Erro no upload FTP:", error);
      throw new Error("Falha ao enviar imagem para o servidor de arquivos.");
    }
  }
}

export default ftpService;