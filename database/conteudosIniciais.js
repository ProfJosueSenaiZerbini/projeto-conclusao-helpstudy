// =====================================================================
// Conteúdo inicial dos Flashcards e do Glossário
// É inserido no banco automaticamente pelas migrações (config/migracoes.js)
// quando as tabelas estão vazias. Para adicionar mais, é só incluir aqui
// ou cadastrar direto nas tabelas `flashcards` e `glossario`.
// =====================================================================

// Flashcards: [slug da matéria, frente (pergunta), verso (resposta)]
const FLASHCARDS = [
    // Matemática
    ['matematica', 'Qual é a fórmula da área do triângulo?', 'Área = (base × altura) ÷ 2'],
    ['matematica', 'O que diz o Teorema de Pitágoras?', 'Em um triângulo retângulo: a² = b² + c² (o quadrado da hipotenusa é igual à soma dos quadrados dos catetos).'],
    ['matematica', 'Quanto é 25% de 80?', '20. Para calcular, faça 80 × 25 ÷ 100.'],
    ['matematica', 'Qual é a fórmula de Bhaskara?', 'x = (−b ± √Δ) ÷ 2a, com Δ = b² − 4ac'],
    ['matematica', 'O que é um número primo?', 'Um número maior que 1 que só pode ser dividido por 1 e por ele mesmo. Ex.: 2, 3, 5, 7, 11.'],
    ['matematica', 'Qual é a fórmula da área do círculo?', 'Área = π × r² (π ≈ 3,14 e r é o raio).'],
    ['matematica', 'Quanto é 2³ (dois ao cubo)?', '8, porque 2 × 2 × 2 = 8.'],
    ['matematica', 'O que é o MMC de dois números?', 'O Mínimo Múltiplo Comum: o menor número que é múltiplo dos dois ao mesmo tempo. Ex.: MMC(4, 6) = 12.'],
    ['matematica', 'Quanto vale a soma dos ângulos internos de um triângulo?', '180°.'],
    ['matematica', 'Como se calcula a média aritmética?', 'Soma todos os valores e divide pela quantidade. Ex.: (6 + 8 + 10) ÷ 3 = 8.'],

    // Português
    ['portugues', 'O que é um substantivo?', 'A palavra que dá nome a seres, objetos, lugares, sentimentos e ideias. Ex.: casa, amor, Brasil.'],
    ['portugues', 'Qual a diferença entre "mas" e "mais"?', '"Mas" indica oposição (= porém). "Mais" indica quantidade (contrário de menos).'],
    ['portugues', 'O que é uma metáfora?', 'Uma comparação feita sem usar "como". Ex.: "Aquele aluno é uma fera em Matemática."'],
    ['portugues', 'Quando se usa a crase?', 'Quando a preposição "a" se junta ao artigo "a". Ex.: "Vou à escola" (vou a + a escola).'],
    ['portugues', 'O que é o sujeito da oração?', 'O termo sobre o qual se declara alguma coisa. Ex.: em "Ana estudou muito", o sujeito é "Ana".'],
    ['portugues', 'O que é um texto dissertativo-argumentativo?', 'O tipo de texto pedido na redação do ENEM: defende um ponto de vista com argumentos e termina com uma proposta de intervenção.'],
    ['portugues', 'O que é um pronome?', 'Palavra que substitui ou acompanha um nome. Ex.: eu, ele, nosso, este.'],
    ['portugues', 'Qual a diferença entre "por que" e "porque"?', '"Por que" (separado) é usado em perguntas. "Porque" (junto) é usado em respostas, com sentido de "pois".'],
    ['portugues', 'O que é uma hipérbole?', 'Figura de linguagem que exagera uma ideia. Ex.: "Já te falei isso um milhão de vezes."'],
    ['portugues', 'O que é um advérbio?', 'Palavra que indica uma circunstância: tempo, lugar, modo ou intensidade. Ex.: ontem, aqui, rapidamente, muito.'],

    // História
    ['historia', 'Em que ano foi proclamada a Independência do Brasil?', 'Em 1822, por D. Pedro I.'],
    ['historia', 'O que foi a Lei Áurea?', 'A lei assinada pela Princesa Isabel em 1888 que aboliu a escravidão no Brasil.'],
    ['historia', 'Quando começou e terminou a Segunda Guerra Mundial?', 'Começou em 1939 e terminou em 1945.'],
    ['historia', 'O que foi a Revolução Francesa?', 'Movimento iniciado em 1789 que derrubou a monarquia absolutista na França. Lema: "Liberdade, Igualdade, Fraternidade".'],
    ['historia', 'Quando foi proclamada a República no Brasil?', 'Em 15 de novembro de 1889, por Marechal Deodoro da Fonseca.'],
    ['historia', 'O que foi a Ditadura Militar no Brasil?', 'Período de 1964 a 1985 em que o país foi governado por militares, com censura e perda de direitos políticos.'],
    ['historia', 'Quem foi Tiradentes?', 'Joaquim José da Silva Xavier, líder da Inconfidência Mineira (1789). Foi enforcado em 1792.'],
    ['historia', 'O que foi a Era Vargas?', 'O período de 1930 a 1945 em que Getúlio Vargas governou o Brasil, incluindo a ditadura do Estado Novo (1937–1945).'],
    ['historia', 'Quando caiu o Muro de Berlim?', 'Em 1989. A queda simbolizou o fim da Guerra Fria.'],
    ['historia', 'O que foi a Revolução Industrial?', 'A troca da produção manual pelas máquinas, que começou na Inglaterra no século XVIII.'],

    // Geografia
    ['geografia', 'Quais são os biomas brasileiros?', 'Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal.'],
    ['geografia', 'O que é latitude?', 'A distância, em graus, de um ponto até a Linha do Equador (de 0° a 90° Norte ou Sul).'],
    ['geografia', 'O que é o efeito estufa?', 'Fenômeno natural em que gases da atmosfera retêm o calor do Sol. O excesso desses gases causa o aquecimento global.'],
    ['geografia', 'Qual é a maior região do Brasil em área?', 'A Região Norte.'],
    ['geografia', 'O que é urbanização?', 'O crescimento das cidades, com a população saindo do campo para viver nas áreas urbanas.'],
    ['geografia', 'O que é uma escala cartográfica?', 'A relação entre o tamanho no mapa e o tamanho real. Ex.: 1:100.000 quer dizer que 1 cm no mapa = 1 km no real.'],
    ['geografia', 'Quais são as cinco regiões do Brasil?', 'Norte, Nordeste, Centro-Oeste, Sudeste e Sul.'],
    ['geografia', 'O que é longitude?', 'A distância, em graus, de um ponto até o Meridiano de Greenwich (de 0° a 180° Leste ou Oeste).'],
    ['geografia', 'O que é o IDH?', 'O Índice de Desenvolvimento Humano: mede a qualidade de vida pela renda, educação e expectativa de vida. Vai de 0 a 1.'],
    ['geografia', 'Qual é o maior bioma do Brasil?', 'A Amazônia, que ocupa quase metade do território brasileiro.'],

    // Química
    ['quimica', 'O que é um átomo?', 'A menor parte de um elemento químico. É formado por prótons, nêutrons e elétrons.'],
    ['quimica', 'Qual é a fórmula química da água?', 'H₂O: dois átomos de hidrogênio e um de oxigênio.'],
    ['quimica', 'O que indica o pH de uma substância?', 'Se ela é ácida (pH < 7), neutra (pH = 7) ou básica (pH > 7).'],
    ['quimica', 'Quais são os três estados físicos da matéria?', 'Sólido, líquido e gasoso.'],
    ['quimica', 'O que é uma reação química?', 'Um processo em que substâncias (reagentes) se transformam em outras substâncias (produtos).'],
    ['quimica', 'O que é a tabela periódica?', 'A tabela que organiza todos os elementos químicos pelo número atômico.'],
    ['quimica', 'O que são isótopos?', 'Átomos do mesmo elemento (mesmo número de prótons) com número de nêutrons diferente. Ex.: carbono-12 e carbono-14.'],
    ['quimica', 'O que é uma ligação iônica?', 'A ligação em que um átomo doa elétrons e outro recebe, formando íons de cargas opostas. Ex.: NaCl (sal de cozinha).'],
    ['quimica', 'Qual é a fórmula do gás carbônico?', 'CO₂: um átomo de carbono e dois de oxigênio.'],
    ['quimica', 'O que é um cátion?', 'Um íon com carga positiva, formado quando o átomo perde elétrons. Ex.: Na⁺.'],

    // Física
    ['fisica', 'O que diz a 1ª Lei de Newton (Inércia)?', 'Um corpo continua parado ou em movimento retilíneo uniforme se nenhuma força agir sobre ele.'],
    ['fisica', 'Qual é a fórmula da velocidade média?', 'Vm = ΔS ÷ Δt (distância percorrida dividida pelo tempo).'],
    ['fisica', 'O que diz a 2ª Lei de Newton?', 'F = m × a (força é igual à massa vezes a aceleração).'],
    ['fisica', 'Qual é a unidade de medida da força?', 'O Newton (N).'],
    ['fisica', 'O que é energia cinética?', 'A energia do movimento: Ec = (m × v²) ÷ 2.'],
    ['fisica', 'Qual é a velocidade da luz no vácuo?', 'Aproximadamente 300.000 km/s.'],
    ['fisica', 'O que diz a 3ª Lei de Newton (Ação e Reação)?', 'Toda ação tem uma reação de mesma intensidade, mesma direção e sentido oposto.'],
    ['fisica', 'O que é a refração da luz?', 'A mudança de velocidade e de direção da luz ao passar de um meio para outro. Ex.: o lápis que parece "quebrado" dentro de um copo com água.'],
    ['fisica', 'Qual é a fórmula da Lei de Ohm?', 'U = R × i (tensão = resistência × corrente).'],
    ['fisica', 'Qual é a diferença entre massa e peso?', 'Massa é a quantidade de matéria (em kg). Peso é a força da gravidade sobre o corpo (em N): P = m × g.'],

    // Biologia
    ['biologia', 'O que é a fotossíntese?', 'O processo em que as plantas usam luz, água e gás carbônico para produzir glicose e liberar oxigênio.'],
    ['biologia', 'Qual organela é chamada de "usina de energia" da célula?', 'A mitocôndria, onde acontece a respiração celular.'],
    ['biologia', 'O que é o DNA?', 'A molécula que guarda as informações genéticas (hereditárias) de um ser vivo.'],
    ['biologia', 'Qual a diferença entre célula procarionte e eucarionte?', 'A procarionte não tem núcleo organizado (ex.: bactérias). A eucarionte tem núcleo envolvido por membrana.'],
    ['biologia', 'O que é uma cadeia alimentar?', 'A sequência de quem come quem: produtores → consumidores → decompositores.'],
    ['biologia', 'O que são vacinas?', 'Preparações que estimulam o corpo a produzir defesas (anticorpos) contra uma doença antes do contato com ela.'],
    ['biologia', 'O que é a mitose?', 'A divisão celular que forma duas células iguais à célula original.'],
    ['biologia', 'Qual é a função dos glóbulos brancos?', 'Defender o corpo contra vírus, bactérias e outros invasores.'],
    ['biologia', 'O que são seres autótrofos?', 'Seres que produzem o próprio alimento, como as plantas, pela fotossíntese.'],
    ['biologia', 'O que diz a teoria da evolução de Darwin?', 'Os seres mais adaptados ao ambiente sobrevivem e se reproduzem mais. Esse processo é a seleção natural.'],

    // Inglês
    ['ingles', 'Como se forma o Simple Present na 3ª pessoa?', 'Acrescenta-se -s ou -es ao verbo. Ex.: She plays, He watches.'],
    ['ingles', 'O que significa "however"?', 'Porém, no entanto.'],
    ['ingles', 'O que são "false friends" (falsos cognatos)?', 'Palavras parecidas com o português, mas com outro significado. Ex.: "pretend" = fingir, não "pretender".'],
    ['ingles', 'Qual é o passado de "go"?', '"Went". Ex.: I went to school yesterday.'],
    ['ingles', 'O que significa "actually"?', 'Na verdade (e não "atualmente", que é "currently").'],
    ['ingles', 'Quando usar "much" e "many"?', '"Much" com o que não se conta (much water). "Many" com o que se conta (many books).'],
    ['ingles', 'Qual é o passado de "eat"?', '"Ate". Ex.: I ate pizza yesterday.'],
    ['ingles', 'O que significa "library"?', 'Biblioteca. Livraria, em inglês, é "bookstore".'],
    ['ingles', 'Como se forma o futuro com "will"?', 'Will + verbo sem o "to". Ex.: I will study tomorrow.'],
    ['ingles', 'Quando usar "a" e "an"?', '"A" antes de som de consoante (a book). "An" antes de som de vogal (an apple, an hour).'],

    // Filosofia
    ['filosofia', 'Quem disse "Só sei que nada sei"?', 'Sócrates, filósofo grego.'],
    ['filosofia', 'O que é ética?', 'A parte da Filosofia que reflete sobre o que é certo e errado e sobre como devemos agir.'],
    ['filosofia', 'O que significa "Penso, logo existo"?', 'Frase de Descartes: a única certeza que não dá para duvidar é a de que estamos pensando.'],
    ['filosofia', 'O que é o Mito da Caverna?', 'Alegoria de Platão: pessoas presas numa caverna acham que sombras são a realidade. Mostra a passagem da ignorância para o conhecimento.'],
    ['filosofia', 'O que é o senso comum?', 'O conhecimento do dia a dia, aprendido pela experiência e pela tradição, sem comprovação científica.'],
    ['filosofia', 'O que é o Iluminismo?', 'Movimento do século XVIII que defendia a razão, a liberdade e a ciência contra o absolutismo.'],
    ['filosofia', 'Quem foi Aristóteles?', 'Filósofo grego, aluno de Platão, que estudou lógica, ética, política e ciências naturais.'],
    ['filosofia', 'O que é a maiêutica?', 'O método de Sócrates: fazer perguntas para a pessoa chegar ao conhecimento por si mesma.'],
    ['filosofia', 'O que defendia Thomas Hobbes?', 'Que, sem um Estado forte, as pessoas viveriam em guerra de todos contra todos. Frase famosa: "O homem é o lobo do homem."'],
    ['filosofia', 'O que significa "a existência precede a essência" (Sartre)?', 'Que o ser humano não nasce pronto: ele se define pelas próprias escolhas.'],

    // Sociologia
    ['sociologia', 'O que estuda a Sociologia?', 'A sociedade e as relações entre as pessoas e os grupos.'],
    ['sociologia', 'O que é cultura?', 'Tudo que um povo cria e transmite: costumes, crenças, arte, língua e valores.'],
    ['sociologia', 'O que é etnocentrismo?', 'Julgar outras culturas tendo a sua própria como a "certa" ou superior.'],
    ['sociologia', 'Quem é considerado o pai da Sociologia?', 'Auguste Comte, que criou o termo "Sociologia".'],
    ['sociologia', 'O que é desigualdade social?', 'A diferença no acesso a renda, educação, saúde e oportunidades entre grupos da sociedade.'],
    ['sociologia', 'O que é cidadania?', 'O conjunto de direitos e deveres de uma pessoa na sociedade.'],
    ['sociologia', 'Quem foi Émile Durkheim?', 'Sociólogo francês que criou o conceito de fato social.'],
    ['sociologia', 'O que é fato social, segundo Durkheim?', 'Maneiras de agir, pensar e sentir que existem fora da pessoa e exercem pressão sobre ela. Ex.: leis e costumes.'],
    ['sociologia', 'O que Max Weber chamou de ação social?', 'Toda ação que leva em conta o comportamento de outras pessoas.'],
    ['sociologia', 'O que é mobilidade social?', 'A mudança de posição de uma pessoa ou grupo na sociedade, subindo ou descendo de classe social.']
];

// Glossário: [slug da matéria, termo, definição, exemplo]
const GLOSSARIO = [
    // Matemática
    ['matematica', 'Hipotenusa', 'O maior lado de um triângulo retângulo, o oposto ao ângulo de 90°.', 'Num triângulo com catetos 3 e 4, a hipotenusa mede 5.'],
    ['matematica', 'Fração', 'Representa uma parte de um inteiro. O número de cima é o numerador e o de baixo, o denominador.', '3/4 significa 3 partes de um inteiro dividido em 4.'],
    ['matematica', 'Porcentagem', 'Uma razão com denominador 100, indicada pelo símbolo %.', '50% = 50/100 = metade.'],
    ['matematica', 'Equação', 'Uma igualdade que tem um ou mais valores desconhecidos (incógnitas).', 'Em 2x + 4 = 10, o valor de x é 3.'],
    ['matematica', 'Média aritmética', 'A soma de todos os valores dividida pela quantidade de valores.', 'A média de 6, 7 e 8 é (6 + 7 + 8) ÷ 3 = 7.'],
    ['matematica', 'Perímetro', 'A soma das medidas de todos os lados de uma figura.', 'Um quadrado de lado 5 cm tem perímetro de 20 cm.'],

    // Português
    ['portugues', 'Verbo', 'Palavra que indica ação, estado ou fenômeno da natureza.', 'correr, ser, chover'],
    ['portugues', 'Adjetivo', 'Palavra que dá característica a um substantivo.', 'casa grande, dia bonito'],
    ['portugues', 'Sinônimo', 'Palavra com significado igual ou parecido ao de outra.', 'feliz e contente'],
    ['portugues', 'Antônimo', 'Palavra com significado contrário ao de outra.', 'alto e baixo'],
    ['portugues', 'Coesão', 'A ligação entre as partes de um texto, feita com conectivos e retomadas.', 'Uso de "além disso", "portanto", "ele" para retomar um nome.'],
    ['portugues', 'Ironia', 'Figura de linguagem que diz o contrário do que se pensa, geralmente com humor.', '"Que ótimo, choveu bem no dia da viagem!"'],

    // História
    ['historia', 'Absolutismo', 'Sistema de governo em que o rei tem poder total, sem limites.', 'Luís XIV, na França: "O Estado sou eu".'],
    ['historia', 'Colonização', 'Ocupação e exploração de um território por outro país.', 'A colonização do Brasil por Portugal a partir de 1500.'],
    ['historia', 'Feudalismo', 'Sistema da Idade Média baseado na terra, com senhores feudais e servos.', 'Os servos trabalhavam nas terras do senhor em troca de proteção.'],
    ['historia', 'Abolicionismo', 'Movimento que lutava pelo fim da escravidão.', 'No Brasil, terminou com a Lei Áurea, em 1888.'],
    ['historia', 'Guerra Fria', 'Disputa entre EUA (capitalismo) e URSS (socialismo) de 1947 a 1991, sem confronto direto entre os dois.', 'A construção do Muro de Berlim, em 1961.'],
    ['historia', 'Renascimento', 'Movimento cultural dos séculos XIV a XVI que valorizou a razão, a arte e o ser humano.', 'Leonardo da Vinci e Michelangelo.'],

    // Geografia
    ['geografia', 'Bioma', 'Grande área com clima, vegetação e animais parecidos.', 'O Cerrado e a Caatinga são biomas brasileiros.'],
    ['geografia', 'Globalização', 'A integração econômica, cultural e tecnológica entre os países do mundo.', 'Comprar um produto feito em outro continente pela internet.'],
    ['geografia', 'Relevo', 'As formas da superfície da Terra.', 'Montanhas, planaltos, planícies e depressões.'],
    ['geografia', 'Clima', 'O comportamento do tempo (temperatura, chuvas) de um lugar ao longo de muitos anos.', 'O clima equatorial da Amazônia é quente e úmido.'],
    ['geografia', 'Êxodo rural', 'A saída de muitas pessoas do campo para as cidades.', 'Aconteceu com força no Brasil entre 1950 e 1980.'],
    ['geografia', 'Hemisfério', 'Cada metade da Terra, dividida pela Linha do Equador (Norte e Sul) ou pelo Meridiano de Greenwich (Leste e Oeste).', 'O Brasil fica quase todo no Hemisfério Sul.'],

    // Química
    ['quimica', 'Molécula', 'Conjunto de átomos ligados entre si.', 'A molécula de água (H₂O) tem 3 átomos.'],
    ['quimica', 'Elemento químico', 'Conjunto de átomos com o mesmo número de prótons.', 'Oxigênio (O), Carbono (C), Ferro (Fe).'],
    ['quimica', 'Ácido', 'Substância que libera íons H⁺ na água e tem pH menor que 7.', 'O suco de limão é ácido.'],
    ['quimica', 'Base', 'Substância que libera íons OH⁻ na água e tem pH maior que 7.', 'O sabão e a soda cáustica são básicos.'],
    ['quimica', 'Mistura homogênea', 'Mistura que tem uma só fase, ou seja, não dá para ver as partes separadas.', 'Água com sal dissolvido.'],
    ['quimica', 'Oxidação', 'Reação em que uma substância perde elétrons, muitas vezes ao reagir com o oxigênio.', 'A ferrugem em um prego de ferro.'],

    // Física
    ['fisica', 'Aceleração', 'A mudança da velocidade de um corpo com o passar do tempo.', 'Um carro que vai de 0 a 100 km/h está acelerando.'],
    ['fisica', 'Força', 'Ação capaz de mudar o movimento ou a forma de um corpo. Medida em Newtons (N).', 'Empurrar uma porta para abri-la.'],
    ['fisica', 'Gravidade', 'A força de atração entre corpos com massa. Na Terra, puxa tudo para o centro do planeta.', 'Uma maçã caindo da árvore.'],
    ['fisica', 'Energia potencial', 'Energia guardada por causa da posição de um corpo.', 'Uma pedra no alto de um morro.'],
    ['fisica', 'Frequência', 'Quantas vezes algo se repete por segundo. Medida em Hertz (Hz).', 'Uma onda de 10 Hz vibra 10 vezes por segundo.'],
    ['fisica', 'Corrente elétrica', 'O movimento ordenado de elétrons em um condutor. Medida em Ampères (A).', 'A energia que passa pelo fio até a lâmpada.'],

    // Biologia
    ['biologia', 'Célula', 'A menor unidade viva que forma os seres vivos.', 'O corpo humano tem trilhões de células.'],
    ['biologia', 'Ecossistema', 'O conjunto dos seres vivos de um lugar e do ambiente onde vivem.', 'Um lago, com peixes, plantas, água e luz.'],
    ['biologia', 'Gene', 'Trecho do DNA que guarda a informação de uma característica.', 'O gene que influencia a cor dos olhos.'],
    ['biologia', 'Mitose', 'Divisão celular que forma duas células iguais à original.', 'Acontece no crescimento e na cicatrização.'],
    ['biologia', 'Seleção natural', 'Teoria de Darwin: os seres mais adaptados ao ambiente sobrevivem e se reproduzem mais.', 'Mariposas escuras sobrevivendo mais em árvores cheias de fuligem.'],
    ['biologia', 'Homeostase', 'A capacidade do corpo de manter o equilíbrio interno.', 'O suor ajuda a manter a temperatura do corpo.'],

    // Inglês
    ['ingles', 'Cognate', 'Palavra em inglês parecida com o português e com o mesmo significado.', 'important = importante'],
    ['ingles', 'Phrasal verb', 'Verbo + preposição ou advérbio que forma um novo significado.', 'give up = desistir'],
    ['ingles', 'Simple Past', 'Tempo verbal usado para ações que já terminaram no passado.', 'I studied yesterday.'],
    ['ingles', 'Pronoun', 'Pronome: palavra que substitui um nome.', 'I, you, he, she, it, we, they'],
    ['ingles', 'Modal verb', 'Verbo auxiliar que indica possibilidade, permissão ou obrigação.', 'can, must, should'],
    ['ingles', 'Skimming', 'Técnica de leitura rápida para pegar a ideia geral do texto.', 'Ler o título, o primeiro parágrafo e as palavras em destaque.'],

    // Filosofia
    ['filosofia', 'Metafísica', 'Parte da Filosofia que estuda o que existe além do que vemos, como o ser e a realidade.', 'Perguntas como "o que é a alma?".'],
    ['filosofia', 'Moral', 'O conjunto de regras e costumes que um grupo considera certo.', 'Respeitar os mais velhos.'],
    ['filosofia', 'Empirismo', 'Corrente que diz que o conhecimento vem da experiência e dos sentidos.', 'John Locke e David Hume.'],
    ['filosofia', 'Racionalismo', 'Corrente que diz que o conhecimento vem principalmente da razão.', 'René Descartes.'],
    ['filosofia', 'Dialética', 'Forma de pensar que avança pelo confronto de ideias opostas.', 'Tese + antítese → síntese.'],
    ['filosofia', 'Lógica', 'Estudo das regras do raciocínio correto.', 'Todo homem é mortal; Sócrates é homem; logo, Sócrates é mortal.'],

    // Sociologia
    ['sociologia', 'Instituição social', 'Estrutura que organiza a vida em sociedade e passa normas às pessoas.', 'Família, escola, igreja e Estado.'],
    ['sociologia', 'Socialização', 'O processo de aprender as regras e os costumes da sociedade.', 'Uma criança aprendendo a falar e a se comportar com a família.'],
    ['sociologia', 'Preconceito', 'Opinião formada antes de conhecer, geralmente negativa, sobre pessoas ou grupos.', 'Julgar alguém pelo sotaque.'],
    ['sociologia', 'Movimento social', 'Grupo organizado que luta por mudanças ou direitos.', 'O movimento estudantil e o movimento feminista.'],
    ['sociologia', 'Estratificação social', 'A divisão da sociedade em camadas (classes), com diferentes níveis de renda e poder.', 'Classe alta, média e baixa.'],
    ['sociologia', 'Alienação', 'Conceito de Marx: quando o trabalhador não se reconhece no que produz.', 'Um operário que faz só uma peça e nunca vê o produto pronto.']
];

module.exports = { FLASHCARDS, GLOSSARIO };
