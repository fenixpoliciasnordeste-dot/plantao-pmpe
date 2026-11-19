// Plantão PMPE — banco de ocorrências e questões
// RASCUNHO: o Rodolpho precisa revisar antes de mostrar para os alunos.
//
// A cada plantão o jogo sorteia 10 questões: 6 de RLM e 4 das outras matérias
// (dá para mudar em index.html: POR_PLANTAO e RLM_POR_PLANTAO).
//
// Como editar sem mexer no jogo:
// - area: "RLM", "Direito", "Português", "Informática" ou "História"
// - bairro (opcional): "Olinda", "Marco Zero", "Boa Viagem" ou "Av. Agamenon".
//   Sem bairro, o jogo sorteia o local. Use {local} na narrativa para o jogo
//   escrever o lugar ("em Olinda", "no Marco Zero", "em Boa Viagem", "na Av. Agamenon").
// - alternativas: 4 opções; "correta" é a posição da certa (0 = primeira, 3 = última).
//   O jogo embaralha a ordem na hora, então tanto faz onde a certa está aqui.
// - explicacao: aparece depois que o jogador responde.

window.QUESTOES = [
  // ===================== RLM =====================
  {
    area: "RLM", tipo: "Desafio do sargento",
    narrativa: "Durante a ronda {local}, o sargento testa a guarnição: \"Todo policial do pelotão é pontual.\" E pede a negação da frase.",
    materia: "RLM · Negação de quantificadores",
    enunciado: "A negação de \"Todo policial é pontual\" é:",
    alternativas: [
      "Algum policial não é pontual.",
      "Nenhum policial é pontual.",
      "Todo policial não é pontual.",
      "Algum policial é pontual."
    ],
    correta: 0,
    explicacao: "Para negar \"todo\", basta mostrar que existe pelo menos um que não é: \"algum policial não é pontual\". \"Nenhum\" é exagero, não é negação."
  },
  {
    area: "RLM", tipo: "Identidade funcional",
    narrativa: "Na abordagem {local}, o comandante lembra a regra: \"Se o policial está de serviço, então ele porta a identidade funcional.\"",
    materia: "RLM · Equivalência da condicional",
    enunciado: "Uma frase logicamente equivalente a essa regra é:",
    alternativas: [
      "Se o policial porta a identidade funcional, então está de serviço.",
      "Se o policial não está de serviço, então não porta a identidade funcional.",
      "Se o policial não porta a identidade funcional, então não está de serviço.",
      "O policial está de serviço e não porta a identidade funcional."
    ],
    correta: 2,
    explicacao: "\"Se P, então Q\" equivale a \"se não Q, então não P\" (contrapositiva). Inverter a ordem (recíproca) ou só negar os dois (inversa) não garante a mesma coisa."
  },
  {
    area: "RLM", tipo: "Previsão do tempo",
    narrativa: "Antes de sair {local}, o rádio avisa: \"Chove e a viatura sai para a ronda.\" O soldado precisa dizer o contrário disso.",
    materia: "RLM · Negação da conjunção (De Morgan)",
    enunciado: "A negação de \"Chove e a viatura sai\" é:",
    alternativas: [
      "Não chove e a viatura não sai.",
      "Não chove ou a viatura não sai.",
      "Chove ou a viatura sai.",
      "Se chove, a viatura não sai."
    ],
    correta: 1,
    explicacao: "Para negar \"P e Q\", nega as duas partes e troca o \"e\" pelo \"ou\": \"não P ou não Q\". Basta uma das partes falhar."
  },
  {
    area: "RLM", tipo: "Ronda adiada",
    narrativa: "{local}, o oficial de dia afirma: \"Se chover, a ronda será adiada.\" Um recruta quer provar que ele está errado.",
    materia: "RLM · Negação da condicional",
    enunciado: "A negação de \"Se chover, a ronda será adiada\" é:",
    alternativas: [
      "Se não chover, a ronda não será adiada.",
      "Não chove e a ronda é adiada.",
      "Chove e a ronda não é adiada.",
      "Não chove ou a ronda não é adiada."
    ],
    correta: 2,
    explicacao: "A negação de \"se P, então Q\" é \"P e não Q\": choveu e mesmo assim a ronda não foi adiada. É o único caso que derruba a condicional."
  },
  {
    area: "RLM", tipo: "Conversa no quartel",
    narrativa: "Na pausa da ronda {local}, alguém comenta: \"Alguns policiais são instrutores\" e \"Nenhum instrutor é sedentário\".",
    materia: "RLM · Silogismo",
    enunciado: "Considerando as duas frases verdadeiras, pode-se concluir que:",
    alternativas: [
      "Nenhum policial é sedentário.",
      "Alguns policiais não são sedentários.",
      "Todo instrutor é policial.",
      "Alguns sedentários são instrutores."
    ],
    correta: 1,
    explicacao: "Os policiais que são instrutores não são sedentários. Então pelo menos alguns policiais não são sedentários. Sobre os outros policiais, não dá para concluir nada."
  },
  {
    area: "RLM", tipo: "Código do rádio",
    narrativa: "{local}, a central passa uma sequência de códigos: 2, 5, 11, 23, 47, ... A guarnição precisa descobrir o próximo.",
    materia: "RLM · Sequências",
    enunciado: "O próximo número da sequência 2, 5, 11, 23, 47 é:",
    alternativas: ["94", "95", "93", "71"],
    correta: 1,
    explicacao: "Cada número é o anterior vezes 2, mais 1: 2→5→11→23→47→95."
  },
  {
    area: "RLM", tipo: "Senha do armário",
    narrativa: "O armário da base {local} abre com o próximo número da sequência 1, 1, 2, 3, 5, 8, ...",
    materia: "RLM · Sequências",
    enunciado: "Qual é o próximo número?",
    alternativas: ["11", "12", "13", "16"],
    correta: 2,
    explicacao: "Cada número é a soma dos dois anteriores (sequência de Fibonacci): 5 + 8 = 13."
  },
  {
    area: "RLM", tipo: "Relatório de ocorrências",
    narrativa: "O relatório do batalhão {local} mostra que as ocorrências do mês passaram de 80 para 100.",
    materia: "RLM · Porcentagem",
    enunciado: "O aumento percentual foi de:",
    alternativas: ["20%", "25%", "80%", "125%"],
    correta: 1,
    explicacao: "Aumento de 20 sobre o valor inicial de 80: 20 ÷ 80 = 0,25 = 25%. A pegadinha é dividir por 100."
  },
  {
    area: "RLM", tipo: "Preço do combustível",
    narrativa: "O abastecimento das viaturas {local} subiu 20% num mês e caiu 20% no mês seguinte.",
    materia: "RLM · Porcentagem sucessiva",
    enunciado: "Em relação ao preço inicial, o preço final ficou:",
    alternativas: ["Igual ao inicial.", "4% menor.", "4% maior.", "2% menor."],
    correta: 1,
    explicacao: "1,20 × 0,80 = 0,96. O preço final é 96% do inicial, ou seja, 4% menor. Aumento e queda de mesma porcentagem não se anulam."
  },
  {
    area: "RLM", tipo: "Escala da operação",
    narrativa: "Para cobrir uma área {local}, 6 policiais levam 4 horas, todos no mesmo ritmo. O comando mandou 8 policiais.",
    materia: "RLM · Regra de três inversa",
    enunciado: "Com 8 policiais no mesmo ritmo, a área é coberta em:",
    alternativas: ["3 horas", "5 horas", "5 horas e 20 minutos", "2 horas"],
    correta: 0,
    explicacao: "Mais policiais, menos tempo: é inversamente proporcional. 6 × 4 = 24 horas de trabalho; 24 ÷ 8 = 3 horas."
  },
  {
    area: "RLM", tipo: "Placa suspeita",
    narrativa: "{local}, a guarnição anota que os códigos de acesso de um sistema têm 2 letras (de 26) seguidas de 3 algarismos (de 0 a 9), podendo repetir.",
    materia: "RLM · Princípio fundamental da contagem",
    enunciado: "Quantos códigos diferentes são possíveis?",
    alternativas: ["67.600", "676.000", "468.000", "6.760"],
    correta: 1,
    explicacao: "Multiplica as opções de cada posição: 26 × 26 × 10 × 10 × 10 = 676 × 1.000 = 676.000."
  },
  {
    area: "RLM", tipo: "Montando a guarnição",
    narrativa: "{local}, o sargento precisa escolher 3 dos 6 soldados disponíveis para uma guarnição. A ordem não importa.",
    materia: "RLM · Combinação",
    enunciado: "De quantas maneiras ele pode montar a guarnição?",
    alternativas: ["18", "20", "120", "216"],
    correta: 1,
    explicacao: "Como a ordem não importa, é combinação: C(6,3) = 6 × 5 × 4 ÷ (3 × 2 × 1) = 120 ÷ 6 = 20."
  },
  {
    area: "RLM", tipo: "Anagrama no quadro",
    narrativa: "Num treinamento {local}, o instrutor escreve PMPE no quadro e pergunta quantos anagramas a palavra tem.",
    materia: "RLM · Permutação com repetição",
    enunciado: "Quantos anagramas tem a palavra PMPE?",
    alternativas: ["24", "12", "6", "16"],
    correta: 1,
    explicacao: "São 4 letras com o P repetido 2 vezes: 4! ÷ 2! = 24 ÷ 2 = 12."
  },
  {
    area: "RLM", tipo: "Sorteio de folga",
    narrativa: "{local}, há 5 policiais do 1º BPM, 4 do 2º e 3 do 3º. Dois serão sorteados para a folga, um depois do outro, sem repetir.",
    materia: "RLM · Probabilidade",
    enunciado: "A probabilidade de os dois sorteados serem do 1º BPM é:",
    alternativas: ["5/33", "25/144", "5/12", "1/6"],
    correta: 0,
    explicacao: "São 12 policiais. Primeiro: 5/12. Sem repor, sobram 4 do 1º BPM em 11: 4/11. Multiplicando: 20/132 = 5/33."
  },
  {
    area: "RLM", tipo: "Três suspeitos",
    narrativa: "{local}, três suspeitos dão versões. A: \"B mente.\" B: \"C mente.\" C: \"A e B mentem.\"",
    materia: "RLM · Verdades e mentiras",
    enunciado: "Sabendo que cada um só fala verdade ou só mente, quem diz a verdade?",
    alternativas: ["Só A", "Só B", "Só C", "A e C"],
    correta: 1,
    explicacao: "Se A falasse a verdade, B mentiria, C falaria a verdade e diria que A mente: contradição. Então A mente, B fala a verdade e C mente (C diz que B mente, o que é falso). Só B."
  },
  {
    area: "RLM", tipo: "Quem é de qual batalhão",
    narrativa: "{local}, Ana, Bruno e Carla são de batalhões diferentes: 1º, 2º e 3º BPM. Bruno não é do 1º nem do 2º. Ana não é do 1º.",
    materia: "RLM · Associação lógica",
    enunciado: "Carla é do:",
    alternativas: ["1º BPM", "2º BPM", "3º BPM", "Não dá para saber"],
    correta: 0,
    explicacao: "Bruno só pode ser do 3º. Ana não é do 1º e o 3º já é do Bruno, então Ana é do 2º. Sobra o 1º para Carla."
  },
  {
    area: "RLM", tipo: "Tabela-verdade",
    narrativa: "No curso de formação {local}, o instrutor pergunta quando a frase \"Se P, então Q\" é falsa.",
    materia: "RLM · Condicional",
    enunciado: "A condicional \"P → Q\" é falsa somente quando:",
    alternativas: [
      "P é falsa e Q é verdadeira.",
      "P e Q são falsas.",
      "P é verdadeira e Q é falsa.",
      "P e Q são verdadeiras."
    ],
    correta: 2,
    explicacao: "A condicional só é falsa no caso \"Vera Fischer\": Verdadeiro → Falso. Em todos os outros casos ela é verdadeira."
  },
  {
    area: "RLM", tipo: "Turma de estudo",
    narrativa: "{local}, numa turma de 40 candidatos, 25 estudam RLM, 20 estudam Penal e 8 estudam as duas.",
    materia: "RLM · Conjuntos",
    enunciado: "Quantos candidatos não estudam nenhuma das duas?",
    alternativas: ["3", "5", "8", "13"],
    correta: 0,
    explicacao: "Quem estuda pelo menos uma: 25 + 20 − 8 = 37 (tira os 8 contados duas vezes). Nenhuma: 40 − 37 = 3."
  },
  {
    area: "RLM", tipo: "Frase do recruta",
    narrativa: "{local}, um recruta diz: \"Ou a viatura está na base, ou não está na base.\" O sargento diz que essa frase nunca erra.",
    materia: "RLM · Tautologia",
    enunciado: "Uma frase que é sempre verdadeira, qualquer que seja o valor de suas partes, é chamada de:",
    alternativas: ["Contradição", "Contingência", "Tautologia", "Equivalência"],
    correta: 2,
    explicacao: "\"P ou não P\" é sempre verdadeira: tautologia. Contradição é sempre falsa; contingência depende dos valores."
  },
  {
    area: "RLM", tipo: "Efetivo do evento",
    narrativa: "No evento {local}, a razão entre policiais homens e mulheres é de 3 para 2, e são 30 policiais no total.",
    materia: "RLM · Razão e proporção",
    enunciado: "Quantas policiais mulheres estão no evento?",
    alternativas: ["10", "12", "18", "20"],
    correta: 1,
    explicacao: "3 + 2 = 5 partes. 30 ÷ 5 = 6 por parte. Mulheres: 2 × 6 = 12 (e homens 18)."
  },
  {
    area: "RLM", tipo: "Empréstimo do colega",
    narrativa: "{local}, um soldado conta que pegou R$ 1.000 emprestados a juros simples de 2% ao mês, por 6 meses.",
    materia: "RLM · Juros simples",
    enunciado: "Quanto ele vai pagar só de juros?",
    alternativas: ["R$ 12", "R$ 120", "R$ 126", "R$ 200"],
    correta: 1,
    explicacao: "Juros simples: 1.000 × 0,02 × 6 = 120 reais."
  },
  {
    area: "RLM", tipo: "Contagem para a prova",
    narrativa: "{local}, um candidato percebe que hoje é segunda-feira e faltam exatamente 100 dias para a prova.",
    materia: "RLM · Calendário",
    enunciado: "A prova vai cair em que dia da semana?",
    alternativas: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Sexta-feira"],
    correta: 2,
    explicacao: "A cada 7 dias a semana se repete. 100 ÷ 7 = 14 semanas e sobram 2 dias. Segunda + 2 dias = quarta-feira."
  },

  // ===================== DIREITO =====================
  {
    area: "Direito", bairro: "Marco Zero", tipo: "Instrução de recruta",
    narrativa: "No Marco Zero, um recruta em estágio pergunta por que precisa prestar continência e seguir a cadeia de comando até no meio do policiamento.",
    materia: "Estatuto dos Militares de PE (Lei 6.783/1974)",
    enunciado: "De acordo com o Estatuto dos Militares do Estado de Pernambuco, é correto afirmar:",
    alternativas: [
      "A disciplina só precisa ser observada durante o serviço e deixa de valer na reserva remunerada.",
      "Hierarquia e disciplina são a base institucional da Corporação, e a autoridade e a responsabilidade crescem com o grau hierárquico.",
      "Dentro do mesmo posto ou graduação, quem é mais velho de idade é sempre o mais antigo.",
      "A responsabilidade do militar diminui à medida que ele sobe na hierarquia, porque as decisões passam a ser coletivas."
    ],
    correta: 1,
    explicacao: "Hierarquia e disciplina são a base da Corporação, e quanto maior o grau, maior a autoridade e a responsabilidade. Dentro do mesmo posto ou graduação, quem define a ordem é a antiguidade, não a idade."
  },
  {
    area: "Direito", bairro: "Boa Viagem", tipo: "Violência contra a mulher",
    narrativa: "Em Boa Viagem, uma jovem relata que o ex-namorado, com quem namorou dois anos sem nunca morar junto, está com os documentos dela e ameaça não devolver.",
    materia: "Lei Maria da Penha (Lei 11.340/2006)",
    enunciado: "Sobre a aplicação da Lei Maria da Penha nesse caso, é correto afirmar:",
    alternativas: [
      "Não se aplica, porque a lei exige que o casal tenha morado junto.",
      "Não se aplica, porque namoro não é relação íntima de afeto.",
      "Aplica-se, e reter os documentos da vítima é forma de violência patrimonial.",
      "Aplica-se só se houver lesão corporal comprovada por exame."
    ],
    correta: 2,
    explicacao: "A lei vale para qualquer relação íntima de afeto, mesmo sem morar junto (Súmula 600 do STJ). Reter documentos pessoais da mulher é violência patrimonial, prevista no art. 7º da lei."
  },
  {
    area: "Direito", bairro: "Olinda", tipo: "Idosa lesada",
    narrativa: "No Sítio Histórico de Olinda, uma senhora de 78 anos conta que o neto pega a aposentadoria dela e gasta com outras coisas. Ela diz que não quer ver o neto processado.",
    materia: "Estatuto da Pessoa Idosa (Lei 10.741/2003)",
    enunciado: "Considerando o Estatuto da Pessoa Idosa, é correto afirmar:",
    alternativas: [
      "Por ser neto da vítima, ele tem a imunidade dos crimes patrimoniais entre parentes, prevista no Código Penal.",
      "A ação penal depende de representação, e a vítima pode desistir dela na hora do atendimento.",
      "A conduta é só um problema de família, resolvido na esfera cível.",
      "Os crimes do Estatuto são de ação penal pública incondicionada, e não se aplicam as imunidades dos arts. 181 e 182 do Código Penal."
    ],
    correta: 3,
    explicacao: "Os crimes do Estatuto da Pessoa Idosa são de ação penal pública incondicionada (art. 95). O processo não depende da vontade da vítima, e o parentesco não livra o neto."
  },
  {
    area: "Direito", bairro: "Av. Agamenon", tipo: "Roubo de celular",
    narrativa: "Na Av. Agamenon Magalhães, um homem rouba um celular e sai correndo. Um ambulante o segura até a viatura chegar.",
    materia: "Prisão em flagrante (CPP, arts. 301 e 302)",
    enunciado: "Sobre a prisão em flagrante, é correto afirmar:",
    alternativas: [
      "Só a polícia pode prender em flagrante, então o ambulante cometeu crime ao segurar o suspeito.",
      "Qualquer pessoa do povo pode prender quem está em flagrante, e as autoridades policiais e seus agentes devem fazê-lo.",
      "Para prender em flagrante é preciso mandado judicial, salvo à noite.",
      "Só existe flagrante enquanto a pessoa está cometendo o crime; se fugiu, acabou o flagrante."
    ],
    correta: 1,
    explicacao: "Pelo art. 301 do CPP, qualquer do povo pode e a polícia deve prender quem esteja em flagrante. E o flagrante não acaba na fuga: quem é perseguido logo após o crime continua em flagrante (art. 302)."
  },
  {
    area: "Direito", bairro: "Boa Viagem", tipo: "Abordagem na orla",
    narrativa: "Na orla de Boa Viagem, a guarnição aborda um suspeito de furto. Ele está calmo, colabora e não tenta fugir.",
    materia: "Uso de algemas (Súmula Vinculante 11 do STF)",
    enunciado: "Sobre o uso de algemas, é correto afirmar:",
    alternativas: [
      "Toda pessoa conduzida deve ser algemada, por segurança da guarnição.",
      "Só é lícito em caso de resistência, de fundado receio de fuga ou de perigo à integridade física, com a justificativa por escrito.",
      "Só pode algemar com autorização do delegado de plantão.",
      "É proibido algemar em via pública em qualquer situação."
    ],
    correta: 1,
    explicacao: "A Súmula Vinculante 11 só permite algemas em caso de resistência, fundado receio de fuga ou perigo à integridade física de alguém, com justificativa por escrito. Algemar sem motivo pode gerar responsabilização do agente."
  },
  {
    area: "Direito", bairro: "Olinda", tipo: "Maus-tratos a animal",
    narrativa: "Em Olinda, vizinhos denunciam um cachorro preso numa corrente curta, sem água nem comida, no sol forte.",
    materia: "Crimes ambientais (Lei 9.605/1998, art. 32)",
    enunciado: "Sobre a conduta do dono do cachorro, é correto afirmar:",
    alternativas: [
      "É só infração administrativa, sem repercussão criminal.",
      "É crime, e quando o animal é cão ou gato a pena é de reclusão de 2 a 5 anos, multa e proibição da guarda.",
      "É contravenção penal, punida só com multa.",
      "Só vira crime se o animal morrer."
    ],
    correta: 1,
    explicacao: "Maus-tratos a animais é crime (art. 32 da Lei 9.605/1998). Desde a Lei 14.064/2020, se o animal for cão ou gato, a pena é de reclusão de 2 a 5 anos, multa e proibição da guarda."
  },
  {
    area: "Direito", bairro: "Marco Zero", tipo: "Tráfico de drogas",
    narrativa: "Perto do Marco Zero, a guarnição flagra um rapaz vendendo drogas para turistas. Na viatura, ele pergunta se vai sair pagando fiança.",
    materia: "Crimes hediondos (Lei 8.072/1990)",
    enunciado: "Sobre o tráfico de drogas, é correto afirmar:",
    alternativas: [
      "Está na lista de crimes hediondos do art. 1º da Lei 8.072/1990.",
      "É equiparado a hediondo e é insuscetível de anistia, graça, indulto e fiança.",
      "Admite fiança se o preso for réu primário.",
      "Não tem tratamento diferente dos demais crimes."
    ],
    correta: 1,
    explicacao: "O tráfico não está na lista do art. 1º: ele é equiparado a hediondo, junto com tortura e terrorismo. Pelo art. 2º da Lei 8.072/1990, é insuscetível de anistia, graça, indulto e fiança."
  },
  {
    area: "Direito", bairro: "Av. Agamenon", tipo: "Denúncia de tortura",
    narrativa: "Perto da Av. Agamenon, um homem denuncia que foi agredido por horas por um segurança que queria arrancar dele uma confissão de furto.",
    materia: "Lei de Tortura (Lei 9.455/1997)",
    enunciado: "Sobre a Lei de Tortura, é correto afirmar:",
    alternativas: [
      "Tortura é crime afiançável.",
      "Só agente público pode cometer crime de tortura.",
      "Se o condenado for agente público, perde o cargo e fica impedido de exercê-lo pelo dobro do prazo da pena.",
      "O crime de tortura é imprescritível."
    ],
    correta: 2,
    explicacao: "A condenação gera a perda do cargo e a interdição pelo dobro do prazo da pena (art. 1º, § 5º). Tortura é inafiançável, pode ser cometida por qualquer pessoa e não é imprescritível."
  },
  {
    area: "Direito", bairro: "Boa Viagem", tipo: "Abuso de autoridade",
    narrativa: "Em Boa Viagem, um morador pergunta à guarnição se o agente público condenado pela primeira vez por abuso de autoridade perde o cargo na hora.",
    materia: "Abuso de autoridade (Lei 13.869/2019)",
    enunciado: "Sobre a perda do cargo na Lei de Abuso de Autoridade, é correto afirmar:",
    alternativas: [
      "É automática em qualquer condenação.",
      "Depende de reincidência em crime de abuso de autoridade e precisa ser declarada de forma motivada na sentença.",
      "Nunca acontece, porque a lei só prevê multa.",
      "É decidida pelo comandante da unidade, depois da sentença."
    ],
    correta: 1,
    explicacao: "Pelo art. 4º da Lei 13.869/2019, a perda do cargo não é automática: exige reincidência em crime de abuso de autoridade e tem que ser declarada motivadamente na sentença."
  },
  {
    area: "Direito", bairro: "Marco Zero", tipo: "Evento no Marco Zero",
    narrativa: "No réveillon do Marco Zero, um turista pergunta qual é, afinal, o papel da Polícia Militar e o da Polícia Civil.",
    materia: "Constituição Federal (art. 144)",
    enunciado: "Segundo a Constituição Federal, cabem às polícias militares:",
    alternativas: [
      "A polícia ostensiva e a preservação da ordem pública.",
      "As funções de polícia judiciária e a apuração de infrações penais.",
      "O policiamento das rodovias federais.",
      "A execução de atividades de defesa civil, exclusivamente."
    ],
    correta: 0,
    explicacao: "Pelo art. 144, § 5º, da Constituição, às polícias militares cabem a polícia ostensiva e a preservação da ordem pública. Polícia judiciária e apuração de infrações são da Polícia Civil."
  },
  {
    area: "Direito", tipo: "Gritos dentro de casa",
    narrativa: "De madrugada {local}, a guarnição ouve gritos de socorro e barulho de agressão dentro de uma casa. O morador não abre a porta.",
    materia: "Constituição Federal (art. 5º, XI)",
    enunciado: "Sobre a entrada da polícia na casa, é correto afirmar:",
    alternativas: [
      "Só pode entrar com mandado judicial, e só durante o dia.",
      "Pode entrar sem consentimento, a qualquer hora, em caso de flagrante delito, desastre ou para prestar socorro.",
      "Pode entrar à noite só com autorização do delegado.",
      "Nunca pode entrar sem o consentimento do morador."
    ],
    correta: 1,
    explicacao: "A casa é asilo inviolável, mas a Constituição abre exceção para flagrante delito, desastre ou socorro, a qualquer hora. Por ordem judicial, só durante o dia."
  },
  {
    area: "Direito", tipo: "Menor na madrugada",
    narrativa: "{local}, a guarnição encontra um jovem de 13 anos pichando um prédio público.",
    materia: "ECA (Lei 8.069/1990, art. 2º)",
    enunciado: "Pelo Estatuto da Criança e do Adolescente, esse jovem é considerado:",
    alternativas: [
      "Criança, porque tem menos de 14 anos.",
      "Adolescente, porque tem entre 12 e 18 anos incompletos.",
      "Adulto para fins penais, porque já tem 12 anos.",
      "Criança, porque tem menos de 16 anos."
    ],
    correta: 1,
    explicacao: "Criança é até 12 anos incompletos; adolescente vai dos 12 aos 18 anos incompletos (art. 2º do ECA). Com 13 anos, ele é adolescente."
  },
  {
    area: "Direito", tipo: "Blitz da Lei Seca",
    narrativa: "Numa blitz {local}, o bafômetro de um motorista marca 0,35 miligrama de álcool por litro de ar alveolar.",
    materia: "Código de Trânsito (art. 306)",
    enunciado: "Considerando o Código de Trânsito, é correto afirmar:",
    alternativas: [
      "É só infração administrativa, porque o limite para crime é 1 mg/L.",
      "Configura o crime de embriaguez ao volante, que se caracteriza a partir de 0,3 mg/L de ar alveolar.",
      "Não há infração, porque o limite tolerado é 0,5 mg/L.",
      "Só é crime se o motorista tiver causado acidente."
    ],
    correta: 1,
    explicacao: "O art. 306 do CTB considera crime dirigir com 0,3 mg ou mais de álcool por litro de ar alveolar (ou 6 dg por litro de sangue). Não precisa haver acidente."
  },
  {
    area: "Direito", tipo: "Preso por dívida?",
    narrativa: "{local}, um comerciante quer que a guarnição prenda um cliente que não pagou uma dívida de cartão.",
    materia: "Direitos Humanos (Pacto de San José da Costa Rica)",
    enunciado: "Segundo a Convenção Americana sobre Direitos Humanos, a prisão por dívida:",
    alternativas: [
      "É permitida em qualquer dívida acima de um salário mínimo.",
      "É proibida, salvo no caso de inadimplemento de obrigação alimentar.",
      "É permitida para o depositário infiel e para dívidas de cartão.",
      "É sempre proibida, inclusive para pensão alimentícia."
    ],
    correta: 1,
    explicacao: "O Pacto (art. 7º, 7) proíbe prisão por dívida, exceto pelo não pagamento de pensão alimentícia. Por isso a prisão do depositário infiel é ilícita (Súmula Vinculante 25)."
  },

  // ===================== PORTUGUÊS =====================
  {
    area: "Português", tipo: "Boletim de ocorrência",
    narrativa: "{local}, o soldado está terminando o boletim e fica em dúvida sobre a crase.",
    materia: "Português · Crase",
    enunciado: "Em qual frase a crase está correta?",
    alternativas: [
      "A guarnição seguiu à pé até o local.",
      "A vítima foi levada à delegacia.",
      "O suspeito começou à correr.",
      "Entreguei o relatório à ele."
    ],
    correta: 1,
    explicacao: "\"Levada a + a delegacia\" = à. Não há crase antes de palavra masculina (pé), de verbo (correr) nem de pronome pessoal (ele)."
  },
  {
    area: "Português", tipo: "Mensagem no grupo",
    narrativa: "{local}, um soldado escreve no grupo da companhia e o sargento corrige a concordância.",
    materia: "Português · Concordância verbal",
    enunciado: "A frase de acordo com a norma-padrão é:",
    alternativas: [
      "Fazem dois anos que entrei na PM.",
      "Houveram muitas ocorrências no fim de semana.",
      "Faz dois anos que entrei na PM.",
      "Existe muitas viaturas paradas na base."
    ],
    correta: 2,
    explicacao: "\"Fazer\" indicando tempo e \"haver\" com sentido de existir são impessoais: ficam no singular (faz, houve). Já \"existir\" concorda: existem muitas viaturas."
  },
  {
    area: "Português", tipo: "Jogo no Arruda",
    narrativa: "Depois do policiamento {local}, a guarnição comenta o jogo e alguém pergunta qual frase está certa.",
    materia: "Português · Regência verbal",
    enunciado: "A frase de acordo com a norma-padrão é:",
    alternativas: [
      "O soldado obedeceu o sargento.",
      "Prefiro estudar do que dormir.",
      "Assistimos ao jogo no Arruda.",
      "Chegamos no quartel cedo."
    ],
    correta: 2,
    explicacao: "\"Assistir\" no sentido de ver pede \"a\": assistir ao jogo. O certo seria: obedeceu ao sargento, prefiro estudar a dormir, chegamos ao quartel."
  },

  // ===================== INFORMÁTICA =====================
  {
    area: "Informática", tipo: "Computador da base",
    narrativa: "{local}, o soldado precisa sair rápido da mesa e não quer deixar o computador da base aberto.",
    materia: "Informática · Windows",
    enunciado: "No Windows, o atalho que bloqueia a tela na hora é:",
    alternativas: ["Ctrl + L", "Windows + L", "Windows + D", "Alt + F4"],
    correta: 1,
    explicacao: "Windows + L bloqueia a tela. Windows + D mostra a área de trabalho e Alt + F4 fecha a janela ativa."
  },
  {
    area: "Informática", tipo: "Arquivos sequestrados",
    narrativa: "{local}, os arquivos dos computadores de uma empresa foram criptografados de repente, e apareceu uma mensagem pedindo pagamento em criptomoeda.",
    materia: "Informática · Segurança",
    enunciado: "Esse tipo de praga virtual é chamado de:",
    alternativas: ["Spyware", "Ransomware", "Phishing", "Firewall"],
    correta: 1,
    explicacao: "Ransomware sequestra os dados (criptografa) e pede resgate. Spyware espiona, phishing é golpe para roubar dados e firewall é proteção, não praga."
  },

  // ===================== HISTÓRIA DE PE =====================
  {
    area: "História", bairro: "Olinda", tipo: "Turista curioso",
    narrativa: "Em Olinda, um turista pergunta à guarnição quem governou Pernambuco durante o domínio holandês.",
    materia: "História de Pernambuco · Brasil holandês",
    enunciado: "Sobre o domínio holandês em Pernambuco, é correto afirmar:",
    alternativas: [
      "Durou de 1500 a 1530 e terminou com a fundação de Olinda.",
      "Começou em 1630, teve Maurício de Nassau como governante e terminou em 1654.",
      "Foi encerrado pela Revolução Pernambucana de 1817.",
      "Foi pacífico e terminou por um acordo sem batalhas."
    ],
    correta: 1,
    explicacao: "Os holandeses ocuparam Olinda e Recife em 1630, Nassau governou de 1637 a 1644 e eles foram expulsos em 1654, depois das Batalhas dos Guararapes (1648 e 1649)."
  },
  {
    area: "História", bairro: "Marco Zero", tipo: "Placa histórica",
    narrativa: "No Marco Zero, uma placa fala de Frei Caneca, e um estudante pergunta a qual movimento ele está ligado.",
    materia: "História de Pernambuco · Movimentos",
    enunciado: "Frei Caneca foi uma das principais lideranças da:",
    alternativas: [
      "Confederação do Equador (1824).",
      "Guerra dos Mascates (1710).",
      "Insurreição Pernambucana (1645).",
      "Revolução de 1930."
    ],
    correta: 0,
    explicacao: "Frei Caneca liderou a Confederação do Equador, em 1824, contra a Constituição imposta por D. Pedro I, e foi executado em 1825. Ele também participou da Revolução de 1817."
  }
];
