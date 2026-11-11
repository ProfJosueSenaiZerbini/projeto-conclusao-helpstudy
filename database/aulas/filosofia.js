// Aulas de Filosofia
module.exports = [
    {
        ordem: 1,
        titulo: 'O que é Filosofia',
        descricao: 'A origem da palavra, os primeiros filósofos e o senso comum.',
        minutos: 6,
        secoes: [
            {
                titulo: 'Amor à sabedoria',
                texto: [
                    'A palavra **filosofia** vem do grego: **philo** (amor, amizade) + **sophia** (sabedoria). Ou seja, filosofia é o **amor à sabedoria**.',
                    'A filosofia surgiu na Grécia Antiga, quando algumas pessoas passaram a explicar o mundo usando a **razão**, e não só os mitos.'
                ]
            },
            {
                titulo: 'Os primeiros filósofos',
                texto: [
                    'Os primeiros filósofos queriam descobrir o princípio de todas as coisas, a **arché**. **Tales de Mileto**, considerado um dos primeiros, dizia que esse princípio era a **água**.'
                ]
            },
            {
                titulo: 'Filosofia e senso comum',
                texto: [
                    'O **senso comum** é o conhecimento do dia a dia, aprendido pela experiência e pela tradição, muitas vezes aceito sem questionar.',
                    'A filosofia faz o contrário: **questiona** as ideias e busca justificá-las com **argumentos** e reflexão crítica.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: '"Sempre foi assim, então está certo." É senso comum ou filosofia?',
                passos: ['A frase aceita uma ideia sem questionar', 'Ela se apoia só na tradição, sem argumentos'],
                resposta: 'É senso comum. A filosofia perguntaria: por que está certo?'
            }
        ],
        fixacao: [
            {
                pergunta: 'O que significa a palavra "filosofia"?',
                alternativas: ['Estudo dos números', 'Amor à sabedoria', 'Arte de falar bem'],
                correta: 1,
                explicacao: 'Philo (amor) + sophia (sabedoria) = amor à sabedoria.'
            },
            {
                pergunta: 'Para Tales de Mileto, qual era a origem de todas as coisas?',
                alternativas: ['O fogo', 'A água', 'O ar'],
                correta: 1,
                explicacao: 'Tales dizia que a água era a arché, o princípio de tudo.'
            }
        ],
        resumo: [
            'Filosofia = amor à sabedoria (philo + sophia).',
            'Surgiu na Grécia Antiga, explicando o mundo pela razão.',
            'Tales de Mileto: a água é a origem de tudo.',
            'Senso comum aceita; filosofia questiona e argumenta.'
        ]
    },
    {
        ordem: 2,
        titulo: 'Sócrates, Platão e Aristóteles',
        descricao: 'Os três grandes filósofos da Grécia Antiga.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Sócrates',
                texto: [
                    '**Sócrates** ensinava conversando nas ruas de Atenas e não deixou nada escrito. Seu método, a **maiêutica**, consistia em fazer **perguntas** para que a própria pessoa chegasse ao conhecimento.',
                    'É famosa a frase atribuída a ele: **"Só sei que nada sei"**.'
                ]
            },
            {
                titulo: 'Platão',
                texto: [
                    '**Platão** foi aluno de Sócrates e fundou a **Academia**. Na obra **A República**, ele conta o **Mito da Caverna**: pessoas presas numa caverna acham que as sombras na parede são a realidade. A história mostra a passagem da ignorância para o conhecimento.'
                ]
            },
            {
                titulo: 'Aristóteles',
                texto: [
                    '**Aristóteles** foi aluno de Platão por muitos anos. Ele estudou quase tudo: lógica, ética, política, biologia e física. É considerado o criador da **lógica** como estudo organizado.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Organize a "linha de professores"',
                passos: ['Sócrates ensinou Platão', 'Platão ensinou Aristóteles', 'Aristóteles depois foi professor de Alexandre, o Grande'],
                resposta: 'Sócrates → Platão → Aristóteles.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual filósofo criou o Mito da Caverna?',
                alternativas: ['Sócrates', 'Platão', 'Aristóteles'],
                correta: 1,
                explicacao: 'O Mito da Caverna está na obra A República, de Platão.'
            },
            {
                pergunta: 'O que é a maiêutica?',
                alternativas: ['O método de perguntas de Sócrates', 'A escola de Aristóteles', 'Um livro de Platão'],
                correta: 0,
                explicacao: 'Na maiêutica, Sócrates fazia perguntas para a pessoa descobrir o conhecimento por si.'
            }
        ],
        resumo: [
            'Sócrates: maiêutica (perguntas) e "só sei que nada sei".',
            'Platão: aluno de Sócrates, fundou a Academia, Mito da Caverna.',
            'Aristóteles: aluno de Platão, organizou a lógica.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Filosofia moderna, ética e lógica',
        descricao: 'Descartes, Rousseau e duas áreas da filosofia.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Descartes',
                texto: [
                    '**René Descartes**, filósofo francês do século XVII, decidiu duvidar de tudo para encontrar uma certeza absoluta. Concluiu que, se ele estava duvidando, estava pensando, e se pensava, existia: **"Penso, logo existo"**.'
                ]
            },
            {
                titulo: 'Rousseau',
                texto: [
                    '**Jean-Jacques Rousseau**, pensador do Iluminismo, escreveu **O Contrato Social**. Para ele, o poder legítimo vem de um **acordo entre as pessoas**, e não da vontade de um rei.'
                ]
            },
            {
                titulo: 'Ética e lógica',
                lista: [
                    '**Ética:** reflete sobre o **certo e o errado** e sobre como devemos agir.',
                    '**Lógica:** estuda as **regras do raciocínio correto**, para construir argumentos válidos.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Um raciocínio lógico clássico',
                passos: ['Todo ser humano é mortal.', 'Sócrates é um ser humano.', 'Logo, Sócrates é mortal.'],
                resposta: 'Se as duas primeiras frases são verdadeiras, a conclusão também é: o argumento é válido.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Quem escreveu "O Contrato Social"?',
                alternativas: ['René Descartes', 'Jean-Jacques Rousseau', 'Platão'],
                correta: 1,
                explicacao: 'Rousseau, pensador do Iluminismo, escreveu O Contrato Social.'
            },
            {
                pergunta: 'A ética é a área da filosofia que estuda:',
                alternativas: ['O certo e o errado nas ações', 'Os astros', 'As formas da Terra'],
                correta: 0,
                explicacao: 'A ética reflete sobre os valores e sobre como devemos agir.'
            }
        ],
        resumo: [
            'Descartes: "Penso, logo existo".',
            'Rousseau: O Contrato Social; o poder vem do acordo entre as pessoas.',
            'Ética = certo e errado. Lógica = raciocínio correto.'
        ]
    }
];
