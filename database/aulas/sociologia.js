// Aulas de Sociologia
module.exports = [
    {
        ordem: 1,
        titulo: 'O que é Sociologia',
        descricao: 'O estudo da sociedade, a socialização e as instituições sociais.',
        minutos: 6,
        secoes: [
            {
                titulo: 'A ciência da sociedade',
                texto: [
                    'A **Sociologia** é a ciência que estuda a **sociedade** e as **relações sociais**: como as pessoas vivem em grupo, se organizam e influenciam umas às outras.',
                    'O termo "Sociologia" foi criado por **Auguste Comte**, no século XIX. Por isso ele é chamado de pai da Sociologia.'
                ]
            },
            {
                titulo: 'Socialização',
                texto: [
                    '**Socialização** é o processo pelo qual a pessoa aprende as **normas, os valores e os costumes** da sociedade. Ela começa na infância, com a família, e continua por toda a vida, na escola, no trabalho e com os amigos.'
                ]
            },
            {
                titulo: 'Instituições sociais',
                texto: [
                    'As **instituições sociais** são estruturas criadas pelas pessoas para organizar a vida em sociedade e ensinar regras. Exemplos: **família**, **escola**, igreja e **Estado**.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Uma criança aprende em casa a dizer "obrigado". O que é isso?',
                passos: ['Ela está aprendendo uma regra de convivência', 'Quem ensina é a família, uma instituição social'],
                resposta: 'É um exemplo de socialização.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Quem criou o termo "Sociologia"?',
                alternativas: ['Auguste Comte', 'Karl Marx', 'Charles Darwin'],
                correta: 0,
                explicacao: 'Auguste Comte criou o termo no século XIX.'
            },
            {
                pergunta: 'Qual destes é uma instituição social?',
                alternativas: ['Escola', 'Montanha', 'Chuva'],
                correta: 0,
                explicacao: 'A escola foi criada pelas pessoas e organiza a vida em sociedade. Montanha e chuva são naturais.'
            }
        ],
        resumo: [
            'Sociologia estuda a sociedade e as relações sociais.',
            'Auguste Comte criou o termo e é o pai da Sociologia.',
            'Socialização: aprender as normas e valores da sociedade.',
            'Instituições sociais: família, escola, igreja, Estado.'
        ]
    },
    {
        ordem: 2,
        titulo: 'Os clássicos: Durkheim, Marx e Weber',
        descricao: 'Fato social, luta de classes e ação social.',
        minutos: 8,
        secoes: [
            {
                titulo: 'Émile Durkheim: o fato social',
                texto: [
                    'Para o francês **Émile Durkheim**, a Sociologia estuda os **fatos sociais**: maneiras de agir, pensar e sentir que existem **fora do indivíduo** e exercem **pressão** sobre ele. Exemplos: leis, regras de etiqueta e a língua que falamos.'
                ]
            },
            {
                titulo: 'Karl Marx: a luta de classes',
                texto: [
                    '**Karl Marx**, autor de **O Capital**, via a história como marcada pela **luta de classes**. No capitalismo, a disputa principal seria entre a **burguesia** (donos dos meios de produção) e o **proletariado** (trabalhadores).'
                ]
            },
            {
                titulo: 'Max Weber: a ação social',
                texto: [
                    'O alemão **Max Weber** estudou a **ação social**: toda ação que leva em conta o comportamento de outras pessoas. Para entender a sociedade, dizia ele, é preciso entender o **sentido** que as pessoas dão às suas ações.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Usar uniforme na escola é um fato social?',
                passos: ['A regra já existia antes de o aluno chegar (está fora dele)', 'Quem não segue sofre pressão (advertência)'],
                resposta: 'Sim, segundo Durkheim é um fato social.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual pensador é conhecido pela ideia de "luta de classes"?',
                alternativas: ['Max Weber', 'Karl Marx', 'Émile Durkheim'],
                correta: 1,
                explicacao: 'Marx explicava a história pelo conflito entre classes, como burguesia e proletariado.'
            },
            {
                pergunta: 'O conceito de "fato social" é de qual sociólogo?',
                alternativas: ['Émile Durkheim', 'Max Weber', 'Auguste Comte'],
                correta: 0,
                explicacao: 'Durkheim definiu fato social como algo externo ao indivíduo que exerce pressão sobre ele.'
            }
        ],
        resumo: [
            'Durkheim: fato social (externo e que pressiona o indivíduo).',
            'Marx: luta de classes (burguesia x proletariado).',
            'Weber: ação social (ação orientada pelo outro).'
        ]
    },
    {
        ordem: 3,
        titulo: 'Cultura e desigualdade',
        descricao: 'Cultura, etnocentrismo e desigualdade social.',
        minutos: 6,
        secoes: [
            {
                titulo: 'Cultura',
                texto: [
                    'Para a Sociologia, **cultura** é o conjunto de **costumes, crenças, valores, saberes e modos de vida** de um grupo. Não é só arte de museu: a comida, o jeito de falar e as festas também são cultura. Toda sociedade tem cultura.'
                ]
            },
            {
                titulo: 'Etnocentrismo',
                texto: [
                    '**Etnocentrismo** é considerar a **própria cultura superior** e julgar as outras a partir dela, vendo-as como estranhas ou inferiores. O contrário é o **relativismo cultural**: entender cada cultura dentro do seu próprio contexto.'
                ]
            },
            {
                titulo: 'Desigualdade social',
                texto: [
                    'A **desigualdade social** acontece quando grupos têm **acesso diferente a renda, educação, saúde e outros direitos**. Ela está ligada à **mobilidade social**, que é a chance de uma pessoa mudar de posição na sociedade.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: '"A comida daquele país é nojenta, a nossa é a certa." Que atitude é essa?',
                passos: ['A pessoa usa a própria cultura como padrão', 'E julga a outra como inferior'],
                resposta: 'É etnocentrismo.'
            }
        ],
        fixacao: [
            {
                pergunta: 'O que é etnocentrismo?',
                alternativas: ['Respeitar todas as culturas', 'Julgar outras culturas tomando a sua como superior', 'Estudar a história de um país'],
                correta: 1,
                explicacao: 'O etnocentrismo coloca a própria cultura no centro e julga as outras a partir dela.'
            },
            {
                pergunta: 'Para a Sociologia, cultura é:',
                alternativas: ['Só obras de arte e museus', 'Os costumes, crenças e valores de um grupo', 'A quantidade de livros de um país'],
                correta: 1,
                explicacao: 'Cultura inclui todos os modos de vida de um grupo, não só a arte.'
            }
        ],
        resumo: [
            'Cultura = costumes, crenças, valores e modos de vida de um grupo.',
            'Etnocentrismo: achar a própria cultura superior. Contrário: relativismo cultural.',
            'Desigualdade social: acesso desigual a renda, educação, saúde e direitos.'
        ]
    }
];
