import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Troque 'admin' pelo seu login e 'suasenha' pela sua senha atual
  const login = 'gustavoadm'
  const novaSenha = '*A552408s'

  const hash = await bcrypt.hash(novaSenha, 10)

  const usuario = await prisma.tb_usuario.update({
    where: { login },
    data: { senha: hash }
  })

  console.log('✅ Senha atualizada com hash para:', usuario.login)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())