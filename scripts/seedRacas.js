import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  // --- 1. RAÇAS ---
  const racasData = [
    { nome: 'Demônios',    poder_base: 15, limite_treino: 5,  tipo_progressao: 'demonios' },
    { nome: 'Dragões',     poder_base: 20, limite_treino: 5,  tipo_progressao: 'padrao'   },
    { nome: 'Fadas',       poder_base: 16, limite_treino: 4,  tipo_progressao: 'padrao'   },
    { nome: 'Vampiros',    poder_base: 12, limite_treino: 8,  tipo_progressao: 'padrao'   },
    { nome: 'Lobisomens',  poder_base: 12, limite_treino: 8,  tipo_progressao: 'padrao'   },
    { nome: 'Elfos',       poder_base: 9,  limite_treino: 11, tipo_progressao: 'padrao'   },
    { nome: 'Anões',       poder_base: 9,  limite_treino: 11, tipo_progressao: 'padrao'   },
    { nome: 'Gigantes',    poder_base: 8,  limite_treino: 12, tipo_progressao: 'padrao'   },
    { nome: 'Marines',     poder_base: 5,  limite_treino: 15, tipo_progressao: 'padrao'   },
    { nome: 'Ferais',      poder_base: 5,  limite_treino: 15, tipo_progressao: 'padrao'   },
    { nome: 'Humanos',     poder_base: 1,  limite_treino: 19, tipo_progressao: 'padrao'   },
  ]

  // --- 2. PROGRESSÃO PADRÃO ---
  const progressaoPadrao = [
    { classe: 'Inferior',      nivel_min: 1,    nivel_max: 10,   ordem: 1  },
    { classe: 'Comum',         nivel_min: 10,   nivel_max: 20,   ordem: 2  },
    { classe: 'Incomum',       nivel_min: 20,   nivel_max: 50,   ordem: 3  },
    { classe: 'Avançado',      nivel_min: 50,   nivel_max: 100,  ordem: 4  },
    { classe: 'Superior',      nivel_min: 100,  nivel_max: 150,  ordem: 5  },
    { classe: 'Lendário',      nivel_min: 150,  nivel_max: 300,  ordem: 6  },
    { classe: 'Divino',        nivel_min: 300,  nivel_max: 320,  ordem: 7  },
    { classe: 'Místico',       nivel_min: 320,  nivel_max: 400,  ordem: 8  },
    { classe: 'Celestial',     nivel_min: 400,  nivel_max: 600,  ordem: 9  },
    { classe: 'Transcendente', nivel_min: 600,  nivel_max: 650,  ordem: 10 },
    { classe: 'Guardião',      nivel_min: 650,  nivel_max: 1000, ordem: 11 },
    { classe: 'Criador',       nivel_min: 1000, nivel_max: 1000, ordem: 12 },
  ]

  // --- 3. PROGRESSÃO DEMÔNIOS ---
  const progressaoDemonios = [
    { classe: 'Inferior',    nivel_min: 50,  nivel_max: 100,  ordem: 1 },
    { classe: 'Bestial',     nivel_min: 100, nivel_max: 200,  ordem: 2 },
    { classe: 'Combatente',  nivel_min: 200, nivel_max: 350,  ordem: 3 },
    { classe: 'Oculta',      nivel_min: 350, nivel_max: 500,  ordem: 4 },
    { classe: 'Superior',    nivel_min: 500, nivel_max: 700,  ordem: 5 },
    { classe: 'Desastre',    nivel_min: 600, nivel_max: 900,  ordem: 6 },
    { classe: 'Primordial',  nivel_min: 900, nivel_max: 1500, ordem: 7 },
  ]

  // --- 4. BÔNUS PADRÃO ---
  const bonusPadrao = [
    { classe: 'Inferior',      limite_pct: 50   },
    { classe: 'Comum',         limite_pct: 50   },
    { classe: 'Incomum',       limite_pct: 80   },
    { classe: 'Avançado',      limite_pct: 100  },
    { classe: 'Superior',      limite_pct: 150  },
    { classe: 'Lendário',      limite_pct: 200  },
    { classe: 'Divino',        limite_pct: 300  },
    { classe: 'Místico',       limite_pct: 400  },
    { classe: 'Celestial',     limite_pct: 500  },
    { classe: 'Transcendente', limite_pct: 1000 },
    { classe: 'Guardião',      limite_pct: 9999 },
    { classe: 'Criador',       limite_pct: 9999 },
  ]

  console.log('🌱 Iniciando seed das raças...')

  for (const racaData of racasData) {
    // Cria ou atualiza a raça
    const raca = await prisma.racas.upsert({
      where:  { nome: racaData.nome },
      update: racaData,
      create: racaData
    })

    // Define qual progressão usar
    const progressao = racaData.tipo_progressao === 'demonios'
      ? progressaoDemonios
      : progressaoPadrao

    // Define qual bônus usar (demônios usam padrão por enquanto)
    const bonus = bonusPadrao

    // Limpa progressões e bônus antigos
    await prisma.progressoes.deleteMany({ where: { raca_id: raca.id } })
    await prisma.bonus_limites.deleteMany({ where: { raca_id: raca.id } })

    // Insere progressões
    await prisma.progressoes.createMany({
      data: progressao.map(p => ({ ...p, raca_id: raca.id }))
    })

    // Insere bônus
    await prisma.bonus_limites.createMany({
      data: bonus.map(b => ({ ...b, raca_id: raca.id }))
    })

    console.log(`✅ ${raca.nome} — progressão: ${racaData.tipo_progressao}`)
  }

  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())