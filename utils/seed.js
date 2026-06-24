// Importe o prisma do mesmo arquivo que você usa nos seus controllers
import prisma from '../lib/prisma.js'; // Ajuste o caminho até o seu arquivo prisma.js

async function rodarAtualizacao() {
  console.log('🔄 Verificando usuários antigos sem carteira de jogos...');

  try {
    // 1. Busca todos os usuários que não possuem o registro de jogo
    const usuariosSemJogo = await prisma.usuario.findMany({
      where: {
        jogo: null
      }
    });

    console.log(`📌 Encontrados ${usuariosSemJogo.length} usuários para atualizar.`);

    if (usuariosSemJogo.length === 0) {
      console.log('✅ Todos os usuários já estão atualizados!');
      return;
    }

    // 2. Cria a carteira para cada um deles
    for (const usuario of usuariosSemJogo) {
      await prisma.jogo.create({
        data: {
          id_usuario: usuario.id_usuario,
          valor_moedas: 100.00,
          valor_total_ganho: 0.00,
          valor_total_perdido: 0.00,
          vezes_resetadas: 0,
          estatisticas_jogos: [] // JSON inicial vazio
        }
      });
      console.log(`🎰 Carteira criada para o usuário ID: ${usuario.id_usuario}`);
    }

    console.log('🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
  } finally {
    // Desconecta o Prisma para encerrar o processo no terminal
    await prisma.$disconnect();
  }
}

rodarAtualizacao();