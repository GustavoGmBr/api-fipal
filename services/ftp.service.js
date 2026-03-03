import FtpDeploy from 'ftp-deploy'
import fs        from 'fs'
import path      from 'path'
import os        from 'os'

export async function uploadImagemFTP(buffer, nomeArquivo) {
  const tmpDir  = os.tmpdir()
  const tmpFile = path.join(tmpDir, nomeArquivo)

  // Salva buffer em arquivo temporário
  fs.writeFileSync(tmpFile, buffer)

  const ftpDeploy = new FtpDeploy()

  await ftpDeploy.deploy({
    user:         process.env.FTP_USER,
    password:     process.env.FTP_PASSWORD,
    host:         process.env.FTP_HOST,
    port:         21,
    localRoot:    tmpDir,
    remoteRoot:   '/setimoelemento.com.br/uploads/personagens/',
    include:      [nomeArquivo],
    deleteRemote: false,   // ← nunca apaga outras imagens!
    forcePasv:    true
  })

  // Remove o temporário
  fs.unlinkSync(tmpFile)

  return `https://setimoelemento.com.br/uploads/personagens/${nomeArquivo}`
}