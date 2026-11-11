// Aulas de Inglês
module.exports = [
    {
        ordem: 1,
        titulo: 'Verb to be',
        descricao: 'Quando usar am, is e are.',
        minutos: 6,
        secoes: [
            {
                titulo: 'O que é o verb to be',
                texto: [
                    'O **verb to be** significa **ser** ou **estar**. Ele é um dos verbos mais usados do inglês e muda conforme a pessoa (o pronome).'
                ]
            },
            {
                titulo: 'Am, is e are',
                lista: [
                    '**I am** → eu sou / estou',
                    '**He is / She is / It is** → ele, ela é / está',
                    '**You are / We are / They are** → você(s), nós, eles são / estão'
                ]
            },
            {
                titulo: 'Também no presente contínuo',
                texto: [
                    'O to be também aparece no **presente contínuo** (ações acontecendo agora): to be + verbo com **-ing**. Ex.: "They **are** playing soccer" (Eles estão jogando futebol).'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Complete: "She ___ a student."',
                passos: ['O sujeito é "she" (ela)', 'Com he, she e it usamos "is"'],
                resposta: 'She is a student. (Ela é uma estudante.)'
            }
        ],
        fixacao: [
            {
                pergunta: 'Complete: "We ___ friends."',
                alternativas: ['is', 'am', 'are'],
                correta: 2,
                explicacao: 'Com "we" (nós) usamos "are": We are friends.'
            },
            {
                pergunta: 'Complete: "I ___ from Brazil."',
                alternativas: ['am', 'is', 'are'],
                correta: 0,
                explicacao: 'Com "I" usamos sempre "am": I am from Brazil.'
            }
        ],
        resumo: [
            'To be = ser / estar.',
            'I → am · he, she, it → is · you, we, they → are.',
            'Presente contínuo: to be + verbo-ing (They are playing).'
        ]
    },
    {
        ordem: 2,
        titulo: 'Plural dos substantivos',
        descricao: 'Plurais regulares e os irregulares mais cobrados.',
        minutos: 5,
        secoes: [
            {
                titulo: 'Plural regular',
                texto: [
                    'Na maioria das palavras, basta acrescentar **-s**: book → books, car → cars.',
                    'Palavras terminadas em s, sh, ch, x ou o costumam ganhar **-es**: box → boxes, watch → watches.'
                ]
            },
            {
                titulo: 'Plurais irregulares',
                texto: ['Algumas palavras mudam totalmente no plural. Essas é preciso memorizar:'],
                lista: [
                    'child → **children** (criança → crianças)',
                    'man → **men** (homem → homens)',
                    'woman → **women** (mulher → mulheres)',
                    'foot → **feet** (pé → pés)',
                    'tooth → **teeth** (dente → dentes)'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Qual o plural de "child"?',
                passos: ['"Child" tem plural irregular', 'Não se acrescenta -s ("childs" está errado)'],
                resposta: 'Children.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é o plural de "woman"?',
                alternativas: ['Womans', 'Women', 'Womens'],
                correta: 1,
                explicacao: '"Woman" tem plural irregular: women.'
            },
            {
                pergunta: 'Qual é o plural de "box"?',
                alternativas: ['Boxs', 'Boxes', 'Boxen'],
                correta: 1,
                explicacao: 'Palavras terminadas em x ganham -es: boxes.'
            }
        ],
        resumo: [
            'Regra geral: acrescente -s (books).',
            'Terminadas em s, sh, ch, x, o: acrescente -es (boxes).',
            'Irregulares: children, men, women, feet, teeth.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Vocabulário do dia a dia',
        descricao: 'Cumprimentos, opostos, cores e o verbo like.',
        minutos: 5,
        secoes: [
            {
                titulo: 'Cumprimentos',
                lista: [
                    '**Good morning** → Bom dia',
                    '**Good afternoon** → Boa tarde',
                    '**Good evening / Good night** → Boa noite (ao chegar / ao se despedir)'
                ]
            },
            {
                titulo: 'Opostos e cores',
                lista: [
                    'hot (quente) × **cold** (frio)',
                    'big (grande) × **small** (pequeno)',
                    'fast (rápido) × **slow** (devagar)',
                    'Cores: **blue** (azul), **red** (vermelho), **green** (verde), **yellow** (amarelo)'
                ]
            },
            {
                titulo: 'O verbo like',
                texto: [
                    '**Like** significa **gostar**. "I like music" = Eu gosto de música. Cuidado: em inglês não existe o "de" depois do like.',
                    'Outras palavras úteis: **book** (livro), **school** (escola), **house** (casa).'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Traduza: "I like books, but I don’t like cold days."',
                passos: ['I like books → Eu gosto de livros', 'but → mas', 'I don’t like cold days → Eu não gosto de dias frios'],
                resposta: 'Eu gosto de livros, mas não gosto de dias frios.'
            }
        ],
        fixacao: [
            {
                pergunta: 'O que significa "Good afternoon"?',
                alternativas: ['Bom dia', 'Boa tarde', 'Boa noite'],
                correta: 1,
                explicacao: '"Afternoon" é a tarde: Good afternoon = Boa tarde.'
            },
            {
                pergunta: 'Qual é o oposto de "big"?',
                alternativas: ['Small', 'Fast', 'Blue'],
                correta: 0,
                explicacao: 'Big = grande; small = pequeno.'
            }
        ],
        resumo: [
            'Good morning (bom dia), good afternoon (boa tarde), good night (boa noite).',
            'Opostos: hot × cold, big × small, fast × slow.',
            'Like = gostar: I like music (eu gosto de música).'
        ]
    }
];
