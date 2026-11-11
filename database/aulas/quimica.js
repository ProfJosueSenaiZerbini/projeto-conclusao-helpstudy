// Aulas de Química
module.exports = [
    {
        ordem: 1,
        titulo: 'Matéria e estados físicos',
        descricao: 'Sólido, líquido, gasoso e as mudanças de estado.',
        minutos: 6,
        secoes: [
            {
                titulo: 'Os três estados físicos',
                lista: [
                    '**Sólido:** forma e volume fixos. Ex.: gelo.',
                    '**Líquido:** volume fixo, mas toma a forma do recipiente. Ex.: água.',
                    '**Gasoso:** sem forma e sem volume fixos, ocupa todo o espaço. Ex.: vapor d’água.'
                ]
            },
            {
                titulo: 'Mudanças de estado',
                lista: [
                    '**Fusão:** sólido → líquido (o gelo derretendo)',
                    '**Vaporização:** líquido → gasoso (a água fervendo)',
                    '**Condensação:** gasoso → líquido (gotinhas na tampa da panela)',
                    '**Solidificação:** líquido → sólido (a água virando gelo)'
                ]
            },
            {
                titulo: 'Transformação física e química',
                texto: [
                    'Mudar de estado é uma **transformação física**: a água continua sendo água. Já numa **transformação química** surgem **substâncias novas**, como na ferrugem e na queima de papel.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'A água fervendo numa panela: qual mudança de estado acontece?',
                passos: ['A água começa no estado líquido', 'Com o calor, vira vapor (gasoso)', 'Líquido → gasoso'],
                resposta: 'Vaporização (uma transformação física).'
            }
        ],
        fixacao: [
            {
                pergunta: 'Como se chama a passagem do estado líquido para o sólido?',
                alternativas: ['Fusão', 'Solidificação', 'Condensação'],
                correta: 1,
                explicacao: 'Solidificação é quando o líquido vira sólido, como a água virando gelo.'
            },
            {
                pergunta: 'Qual destas é uma transformação química?',
                alternativas: ['Gelo derretendo', 'Prego enferrujando', 'Água evaporando'],
                correta: 1,
                explicacao: 'Na ferrugem o ferro vira uma substância nova. As outras são só mudanças de estado.'
            }
        ],
        resumo: [
            'Estados físicos: sólido, líquido e gasoso.',
            'Fusão (S→L), vaporização (L→G), condensação (G→L), solidificação (L→S).',
            'Transformação química forma substâncias novas; a física não.'
        ]
    },
    {
        ordem: 2,
        titulo: 'Átomo e tabela periódica',
        descricao: 'Prótons, nêutrons, elétrons e os símbolos dos elementos.',
        minutos: 7,
        secoes: [
            {
                titulo: 'As partes do átomo',
                texto: ['O átomo é a menor parte de um elemento químico. Ele tem um **núcleo** no centro e uma região em volta, a **eletrosfera**.'],
                lista: [
                    '**Prótons:** carga positiva (+), ficam no núcleo.',
                    '**Nêutrons:** sem carga, ficam no núcleo.',
                    '**Elétrons:** carga negativa (−), ficam na eletrosfera, em volta do núcleo.'
                ]
            },
            {
                titulo: 'Número atômico e símbolos',
                texto: [
                    'O **número atômico (Z)** é a quantidade de **prótons** do átomo, e é ele que identifica o elemento. Todo átomo com 8 prótons é oxigênio.',
                    'Cada elemento tem um **símbolo**: geralmente a primeira letra do nome, às vezes com mais uma. Ex.: O (oxigênio), H (hidrogênio), Cu (cobre), Na (sódio).'
                ]
            },
            {
                titulo: 'Metais e condutividade',
                texto: [
                    'Os **metais**, como o cobre, são bons **condutores de eletricidade**. É por isso que os fios elétricos são de cobre. Já madeira, plástico e borracha são isolantes.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Um átomo tem 6 prótons e 6 nêutrons. Qual o número atômico?',
                passos: ['O número atômico é a quantidade de prótons', 'Os nêutrons não entram nessa conta'],
                resposta: 'Z = 6 (é o carbono).'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual partícula tem carga elétrica negativa?',
                alternativas: ['Próton', 'Nêutron', 'Elétron'],
                correta: 2,
                explicacao: 'O elétron tem carga negativa e fica na eletrosfera.'
            },
            {
                pergunta: 'O número atômico indica a quantidade de:',
                alternativas: ['Prótons', 'Nêutrons', 'Moléculas'],
                correta: 0,
                explicacao: 'Número atômico = número de prótons. É o que identifica cada elemento.'
            }
        ],
        resumo: [
            'Próton (+) e nêutron (sem carga) no núcleo; elétron (−) na eletrosfera.',
            'Número atômico = quantidade de prótons.',
            'Símbolos: O, H, C, Cu, Na... Metais conduzem eletricidade.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Substâncias, ácidos, bases e reações',
        descricao: 'Fórmulas químicas, escala de pH e combustão.',
        minutos: 8,
        secoes: [
            {
                titulo: 'Fórmulas químicas',
                texto: [
                    'A fórmula mostra quais átomos formam uma substância e quantos de cada. Em **H₂O** (água) há **2 hidrogênios** e **1 oxigênio**. Em **CO₂** (gás carbônico) há 1 carbono e 2 oxigênios.'
                ]
            },
            {
                titulo: 'Ácidos, bases e pH',
                texto: ['A escala de **pH** vai de 0 a 14 e mostra se uma solução é ácida, neutra ou básica:'],
                lista: [
                    '**pH menor que 7:** ácido (ex.: suco de limão, HCl)',
                    '**pH igual a 7:** neutro (ex.: água pura)',
                    '**pH maior que 7:** básico (ex.: sabão, NaOH)'
                ]
            },
            {
                titulo: 'Combustão',
                texto: [
                    'A **combustão** é uma reação química de queima. Quando um combustível com carbono (gasolina, madeira, gás de cozinha) queima completamente, ele produz **gás carbônico (CO₂)** e água.',
                    'O excesso de CO₂ na atmosfera aumenta o **efeito estufa**.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Como identificar uma base pela fórmula?',
                passos: ['Muitas bases têm o grupo OH (hidroxila) no final da fórmula', 'NaOH termina em OH', 'Então NaOH (hidróxido de sódio, a soda cáustica) é uma base'],
                resposta: 'NaOH é uma base (pH maior que 7).'
            }
        ],
        fixacao: [
            {
                pergunta: 'Uma solução com pH 3 é:',
                alternativas: ['Ácida', 'Neutra', 'Básica'],
                correta: 0,
                explicacao: 'pH menor que 7 indica solução ácida.'
            },
            {
                pergunta: 'Quantos átomos de hidrogênio existem em uma molécula de H₂O?',
                alternativas: ['1', '2', '3'],
                correta: 1,
                explicacao: 'O número pequeno depois do H indica 2 hidrogênios. O oxigênio aparece 1 vez.'
            }
        ],
        resumo: [
            'H₂O = 2 hidrogênios + 1 oxigênio. CO₂ = 1 carbono + 2 oxigênios.',
            'pH < 7 ácido, = 7 neutro, > 7 básico.',
            'Combustão completa de combustíveis com carbono gera CO₂ e água.'
        ]
    }
];
