// Aulas de Português
module.exports = [
    {
        ordem: 1,
        titulo: 'Classes de palavras',
        descricao: 'Substantivo, adjetivo, verbo e os tempos verbais.',
        minutos: 8,
        secoes: [
            {
                titulo: 'Substantivo e adjetivo',
                texto: [
                    'O **substantivo** é a palavra que dá nome às coisas: seres, objetos, lugares, sentimentos e ideias. Exemplos: casa, menina, Brasil, amor.',
                    'O **adjetivo** é a palavra que dá uma característica ao substantivo. Em "a menina inteligente", **inteligente** é o adjetivo que caracteriza a menina.'
                ]
            },
            {
                titulo: 'Verbo',
                texto: [
                    'O **verbo** indica uma ação (estudar, correr), um estado (ser, estar) ou um fenômeno da natureza (chover). Uma dica: o verbo é a palavra que muda conforme o tempo.'
                ],
                lista: [
                    '**Passado:** eu estudei ontem / eu estudava quando era criança',
                    '**Presente:** eu estudo todos os dias',
                    '**Futuro:** eu estudarei amanhã'
                ]
            },
            {
                titulo: 'Advérbio',
                texto: [
                    'O **advérbio** indica uma circunstância: tempo (ontem), lugar (aqui), modo (rapidamente) ou intensidade (muito). Em "a menina é **muito** inteligente", muito intensifica o adjetivo.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Classifique as palavras de "O aluno estudou bastante"',
                passos: [
                    'aluno → substantivo (dá nome a quem estudou)',
                    'estudou → verbo (é a ação, no passado)',
                    'bastante → advérbio (indica intensidade)'
                ],
                resposta: 'O verbo da frase é "estudou".'
            }
        ],
        fixacao: [
            {
                pergunta: 'Em "Comprei um livro novo", qual palavra é um adjetivo?',
                alternativas: ['Comprei', 'livro', 'novo'],
                correta: 2,
                explicacao: '"Novo" dá uma característica ao substantivo "livro", então é adjetivo.'
            },
            {
                pergunta: 'Qual frase está no futuro?',
                alternativas: ['Nós viajaremos em julho.', 'Nós viajamos em julho.', 'Nós viajávamos em julho.'],
                correta: 0,
                explicacao: '"Viajaremos" indica algo que ainda vai acontecer. As outras estão no passado.'
            }
        ],
        resumo: [
            'Substantivo dá nome; adjetivo dá característica.',
            'Verbo indica ação, estado ou fenômeno e muda com o tempo (passado, presente, futuro).',
            'Advérbio indica tempo, lugar, modo ou intensidade.'
        ]
    },
    {
        ordem: 2,
        titulo: 'Sujeito e orações',
        descricao: 'Como encontrar o sujeito e entender as orações que caracterizam um nome.',
        minutos: 8,
        secoes: [
            {
                titulo: 'O sujeito',
                texto: [
                    'O **sujeito** é o termo sobre o qual a frase fala. Para encontrá-lo, ache o verbo e pergunte **"quem?"** ou **"o quê?"** antes dele.',
                    'Em "Maria comprou um livro": quem comprou? **Maria**. Então Maria é o sujeito.'
                ]
            },
            {
                titulo: 'Tipos de sujeito',
                lista: [
                    '**Simples:** tem um núcleo só. Ex.: "**O menino** correu."',
                    '**Composto:** tem dois ou mais núcleos. Ex.: "**Pedro e João** estudaram."',
                    '**Oculto:** não aparece, mas dá para saber pelo verbo. Ex.: "Estudamos ontem." (nós)'
                ]
            },
            {
                titulo: 'Oração subordinada adjetiva',
                texto: [
                    'Algumas orações funcionam como um adjetivo: elas caracterizam um substantivo. Geralmente começam com **"que"**.',
                    'Em "O menino, **que estava cansado**, foi dormir", o trecho destacado caracteriza o menino. Por isso, é uma **oração subordinada adjetiva**.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Qual o sujeito de "Pedro e João estudaram para a prova"?',
                passos: ['Verbo: estudaram', 'Quem estudou? Pedro e João', 'São dois núcleos (Pedro, João)'],
                resposta: 'Sujeito composto: "Pedro e João".'
            }
        ],
        fixacao: [
            {
                pergunta: 'Em "As crianças brincaram no parque", qual é o sujeito?',
                alternativas: ['brincaram', 'As crianças', 'no parque'],
                correta: 1,
                explicacao: 'Quem brincou? As crianças. Esse é o sujeito (simples, com o núcleo "crianças").'
            },
            {
                pergunta: 'Em "Chegamos cedo", o sujeito é:',
                alternativas: ['Oculto (nós)', 'Composto', '"cedo"'],
                correta: 0,
                explicacao: 'O sujeito não aparece, mas o verbo "chegamos" mostra que é "nós": sujeito oculto.'
            }
        ],
        resumo: [
            'Para achar o sujeito: encontre o verbo e pergunte "quem?".',
            'Sujeito simples tem 1 núcleo; composto tem 2 ou mais; oculto não aparece.',
            'Oração subordinada adjetiva caracteriza um substantivo e costuma começar com "que".'
        ]
    },
    {
        ordem: 3,
        titulo: 'Significado das palavras e acentuação',
        descricao: 'Sinônimos, antônimos e as regras básicas de acento.',
        minutos: 6,
        secoes: [
            {
                titulo: 'Sinônimos e antônimos',
                texto: [
                    '**Sinônimos** são palavras com sentido igual ou parecido: feliz e contente, rápido e veloz.',
                    '**Antônimos** são palavras com sentido contrário: rápido e devagar, quente e frio.',
                    'No ENEM, saber o sentido das palavras ajuda muito na interpretação de texto.'
                ]
            },
            {
                titulo: 'A sílaba mais forte',
                texto: [
                    'Toda palavra tem uma sílaba pronunciada com mais força: a **sílaba tônica**. Em "a-**ná**-li-se", a sílaba forte é "ná".',
                    'Quando a sílaba forte é a **antepenúltima** (a terceira de trás para frente), a palavra é **proparoxítona** e **sempre leva acento**: análise, médico, lâmpada, matemática.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Por que "análise" tem acento?',
                passos: ['Separe as sílabas: a-ná-li-se', 'A sílaba forte é "ná", a terceira de trás para frente', 'Toda proparoxítona é acentuada'],
                resposta: 'Porque é proparoxítona. O acento fica na sílaba forte: análise.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é o antônimo de "alegre"?',
                alternativas: ['Contente', 'Triste', 'Feliz'],
                correta: 1,
                explicacao: 'Antônimo é o contrário. "Contente" e "feliz" são sinônimos de alegre.'
            },
            {
                pergunta: 'Qual palavra está acentuada corretamente?',
                alternativas: ['Lâmpada', 'Lampáda', 'Lampadá'],
                correta: 0,
                explicacao: 'Em "lâm-pa-da" a sílaba forte é "lâm", a antepenúltima. Proparoxítona leva acento nela.'
            }
        ],
        resumo: [
            'Sinônimo = sentido parecido; antônimo = sentido contrário.',
            'Sílaba tônica é a pronunciada com mais força.',
            'Proparoxítonas (sílaba forte na antepenúltima) sempre são acentuadas.'
        ]
    }
];
