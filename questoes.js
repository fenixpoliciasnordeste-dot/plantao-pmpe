// Plantão PMPE — ocorrências e questões do protótipo
// RASCUNHO: o Rodolpho precisa revisar antes de mostrar para os alunos.
//
// Como editar sem mexer no jogo:
// - bairro: "Olinda", "Marco Zero", "Boa Viagem" ou "Av. Agamenon" (define onde a ocorrência aparece no mapa)
// - alternativas: 4 opções; "correta" é a posição da certa (0 = primeira, 3 = última)
// - explicacao: aparece depois que o jogador responde, acertando ou errando

window.QUESTOES = [
  {
    bairro: "Marco Zero",
    tipo: "Instrução de recruta",
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
    bairro: "Boa Viagem",
    tipo: "Violência contra a mulher",
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
    bairro: "Olinda",
    tipo: "Idosa lesada",
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
    bairro: "Av. Agamenon",
    tipo: "Roubo de celular",
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
    bairro: "Boa Viagem",
    tipo: "Abordagem na orla",
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
    bairro: "Olinda",
    tipo: "Maus-tratos a animal",
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
    bairro: "Marco Zero",
    tipo: "Tráfico de drogas",
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
    bairro: "Av. Agamenon",
    tipo: "Denúncia de tortura",
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
    bairro: "Boa Viagem",
    tipo: "Abuso de autoridade",
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
    bairro: "Marco Zero",
    tipo: "Evento no Marco Zero",
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
  }
];
