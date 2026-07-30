import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// 📋 LISTA DE ARQUIVOS A SEREM PROCESSADOS
// Edite esta lista conforme necessário
const ARQUIVOS_PLANILHAS = [
  'dados_estoque4.xlsx',
  'dados_estoque5.xlsx',
];

/**
 * Processa uma única planilha
 */
async function processarPlanilha(nomeArquivo) {
  console.log(`\n📂 Processando: ${nomeArquivo}`);
  
  const caminhoPlanilha = path.join(process.cwd(), nomeArquivo);
  
  // Verifica se o arquivo existe
  if (!fs.existsSync(caminhoPlanilha)) {
    console.log(`⚠️ Arquivo não encontrado: ${nomeArquivo}`);
    return { 
      totalInserido: 0, 
      itensIgnorados: [], 
      nomeArquivo,
      erro: 'Arquivo não encontrado'
    };
  }

  try {
    const workbook = xlsx.readFile(caminhoPlanilha);
    const primeiraAba = workbook.SheetNames[0];
    const planilha = workbook.Sheets[primeiraAba];

    const dados = xlsx.utils.sheet_to_json(planilha, { header: 1 });
    const linhas = dados.slice(1); // Pula o cabeçalho

    let totalInserido = 0;
    const itensIgnorados = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      const numeroLinhaExcel = i + 2; // +2 porque pulamos o cabeçalho e o Excel começa em 1

      const localizacao = linha[0]?.toString().trim() || null;
      const descricao = linha[1]?.toString().trim() || '';
      const referencia = linha[2]?.toString().trim() || '';
      const estoqueSistema = parseInt(linha[3]) || 0;

      // 1. Validação se a linha inteira está vazia
      if (!localizacao && !descricao && !referencia && linha[3] === undefined) {
        itensIgnorados.push({
          linha: numeroLinhaExcel,
          referencia: 'Vazia',
          motivo: 'Linha completamente em branco no Excel.'
        });
        continue;
      }

      // 2. Validação se falta a Referência ou Descrição
      if (!referencia || !descricao) {
        let motivoErro = '';
        if (!referencia && !descricao) motivoErro = 'Falta a Referência e a Descrição.';
        else if (!referencia) motivoErro = 'Falta o código de Referência.';
        else if (!descricao) motivoErro = 'Falta a Descrição do produto.';

        itensIgnorados.push({
          linha: numeroLinhaExcel,
          referencia: referencia || 'N/A',
          motivo: motivoErro
        });
        continue;
      }

      try {
        await prisma.estoque.upsert({
          where: { referencia: referencia },
          update: {
            descricao,
            localizacao,
            estoqueSistema,
          },
          create: {
            referencia,
            descricao,
            localizacao,
            estoqueSistema,
            estoqueFisico: 0
          }
        });

        totalInserido++;
      } catch (error) {
        itensIgnorados.push({
          linha: numeroLinhaExcel,
          referencia: referencia,
          motivo: `Erro no Banco de Dados: ${error.message}`
        });
      }
    }

    return { totalInserido, itensIgnorados, nomeArquivo };

  } catch (error) {
    console.error(`❌ Erro ao ler o arquivo ${nomeArquivo}:`, error.message);
    return { 
      totalInserido: 0, 
      itensIgnorados: [], 
      nomeArquivo,
      erro: error.message
    };
  }
}

/**
 * Função principal que processa todos os arquivos da lista
 */
async function rodarImportacaoMultipla() {
  console.log('🚀 Iniciando a importação múltipla de planilhas...');
  console.log('==================================================');
  console.log(`📋 Arquivos a processar: ${ARQUIVOS_PLANILHAS.length} arquivo(s)`);
  ARQUIVOS_PLANILHAS.forEach((arquivo, index) => {
    console.log(`   ${index + 1}. ${arquivo}`);
  });
  console.log('==================================================\n');

  let totalGeralInserido = 0;
  let totalGeralIgnorados = 0;
  const todosIgnorados = [];
  const arquivosComErro = [];

  // Processa cada arquivo da lista
  for (const arquivo of ARQUIVOS_PLANILHAS) {
    const resultado = await processarPlanilha(arquivo);
    
    if (resultado.erro) {
      arquivosComErro.push({
        arquivo: resultado.nomeArquivo,
        erro: resultado.erro
      });
      continue;
    }
    
    totalGeralInserido += resultado.totalInserido;
    totalGeralIgnorados += resultado.itensIgnorados.length;
    
    // Adiciona o nome do arquivo em cada item ignorado
    resultado.itensIgnorados.forEach(item => {
      todosIgnorados.push({
        arquivo: resultado.nomeArquivo,
        ...item
      });
    });

    console.log(`✅ ${arquivo}: ${resultado.totalInserido} itens processados, ${resultado.itensIgnorados.length} ignorados`);
  }

  // --- RELATÓRIO FINAL ---
  console.log('\n' + '='.repeat(50));
  console.log('🏁 IMPORTACÃO CONCLUÍDA!');
  console.log('='.repeat(50));
  
  console.log('\n📊 RESUMO GERAL:');
  console.log(`   ✅ Total inseridos/atualizados: ${totalGeralInserido} itens`);
  console.log(`   ⚠️ Total ignorados/erros: ${totalGeralIgnorados} itens`);
  console.log(`   📁 Total de arquivos processados: ${ARQUIVOS_PLANILHAS.length - arquivosComErro.length}`);
  
  if (arquivosComErro.length > 0) {
    console.log(`   ❌ Arquivos com erro: ${arquivosComErro.length}`);
    console.log('\n📋 ARQUIVOS COM ERRO:');
    arquivosComErro.forEach(item => {
      console.log(`   ❌ ${item.arquivo}: ${item.erro}`);
    });
  }

  console.log('\n' + '='.repeat(50));

  // Exibe detalhes dos itens ignorados se houver
  if (todosIgnorados.length > 0) {
    console.log('\n📋 DETALHES DOS ITENS IGNORADOS POR ARQUIVO:');
    console.table(todosIgnorados);
    
    // Exibe um resumo por arquivo
    console.log('\n📊 RESUMO POR ARQUIVO:');
    const resumoPorArquivo = todosIgnorados.reduce((acc, item) => {
      if (!acc[item.arquivo]) {
        acc[item.arquivo] = 0;
      }
      acc[item.arquivo]++;
      return acc;
    }, {});
    
    Object.entries(resumoPorArquivo).forEach(([arquivo, total]) => {
      console.log(`   ⚠️ ${arquivo}: ${total} itens ignorados`);
    });
  }
}

// Executa a importação
rodarImportacaoMultipla()
  .catch((e) => {
    console.error('❌ Erro crítico na importação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão com o banco de dados encerrada.');
  });