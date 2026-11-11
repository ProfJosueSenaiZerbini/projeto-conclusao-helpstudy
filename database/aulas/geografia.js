// Aulas de Geografia
module.exports = [
    {
        ordem: 1,
        titulo: 'Cartografia e localização',
        descricao: 'Linhas imaginárias, hemisférios e escala dos mapas.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Linhas imaginárias',
                texto: [
                    'Para localizar qualquer ponto da Terra, usamos linhas imaginárias. A mais importante é a **Linha do Equador**, que divide a Terra em **Hemisfério Norte** e **Hemisfério Sul**.',
                    'O **Meridiano de Greenwich** divide a Terra em **Hemisfério Leste (Oriental)** e **Oeste (Ocidental)**.'
                ]
            },
            {
                titulo: 'Latitude e longitude',
                lista: [
                    '**Latitude:** distância de um ponto até a Linha do Equador, de 0° a 90° (Norte ou Sul).',
                    '**Longitude:** distância de um ponto até o Meridiano de Greenwich, de 0° a 180° (Leste ou Oeste).'
                ]
            },
            {
                titulo: 'Escala',
                texto: [
                    'Um mapa é uma redução da realidade. A **escala** mostra quantas vezes a área foi reduzida, ou seja, a relação entre a distância no mapa e a distância real.',
                    'Na escala **1:100.000**, 1 cm no mapa corresponde a 100.000 cm na realidade, que é **1 km**.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Num mapa de escala 1:100.000, duas cidades estão a 5 cm. Qual a distância real?',
                passos: ['1 cm no mapa = 1 km no real', '5 cm no mapa = 5 × 1 km'],
                resposta: '5 km'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual linha divide a Terra em Hemisfério Norte e Sul?',
                alternativas: ['Meridiano de Greenwich', 'Linha do Equador', 'Trópico de Câncer'],
                correta: 1,
                explicacao: 'A Linha do Equador separa o Norte do Sul. Greenwich separa o Leste do Oeste.'
            },
            {
                pergunta: 'Para que serve a escala de um mapa?',
                alternativas: ['Mostrar a altitude', 'Relacionar a distância no mapa com a distância real', 'Indicar o clima'],
                correta: 1,
                explicacao: 'A escala diz quanto o mapa foi reduzido, permitindo calcular distâncias reais.'
            }
        ],
        resumo: [
            'Equador: divide Norte e Sul. Greenwich: divide Leste e Oeste.',
            'Latitude: até o Equador (0° a 90°). Longitude: até Greenwich (0° a 180°).',
            'Escala 1:100.000 → 1 cm no mapa = 1 km no real.'
        ]
    },
    {
        ordem: 2,
        titulo: 'O Brasil e o mundo',
        descricao: 'Continentes, Amazônia, clima e o fenômeno El Niño.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Continentes e o Brasil',
                texto: [
                    'A **Ásia** é o maior continente do mundo, onde ficam países como China e Índia.',
                    'O **Brasil** é o maior país da América do Sul e um dos maiores do mundo. Ele é dividido em cinco regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.'
                ]
            },
            {
                titulo: 'Amazônia e clima equatorial',
                texto: [
                    'A Amazônia é o maior bioma do Brasil. Ela é cortada pelo **Rio Amazonas**, o principal rio da Bacia Amazônica.',
                    'Na região predomina o **clima equatorial**: quente e úmido o ano todo, com muitas chuvas.'
                ]
            },
            {
                titulo: 'El Niño',
                texto: [
                    'O **El Niño** é o aquecimento fora do normal das águas do **Oceano Pacífico**, perto da Linha do Equador. Ele muda o clima em várias partes do mundo; no Brasil, costuma trazer seca ao Norte e ao Nordeste e mais chuva ao Sul.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Como é o clima de Manaus, na Amazônia?',
                passos: ['Manaus fica perto da Linha do Equador', 'Recebe muito calor do Sol o ano todo', 'A floresta e os rios deixam o ar úmido'],
                resposta: 'Clima equatorial: quente e chuvoso o ano inteiro.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é o maior continente do mundo?',
                alternativas: ['África', 'Ásia', 'América'],
                correta: 1,
                explicacao: 'A Ásia é o maior continente, tanto em área quanto em população.'
            },
            {
                pergunta: 'O El Niño é o aquecimento das águas de qual oceano?',
                alternativas: ['Atlântico', 'Índico', 'Pacífico'],
                correta: 2,
                explicacao: 'O El Niño acontece no Oceano Pacífico, na região do Equador.'
            }
        ],
        resumo: [
            'Ásia é o maior continente; o Brasil é o maior país da América do Sul.',
            'Amazônia: Rio Amazonas e clima equatorial (quente e úmido).',
            'El Niño: aquecimento anormal do Oceano Pacífico.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Sociedade e meio ambiente',
        descricao: 'Urbanização, desmatamento e fontes de energia.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Urbanização',
                texto: [
                    '**Urbanização** é o crescimento das cidades, quando a população passa a viver mais nas áreas urbanas do que no campo.',
                    'No Brasil, isso aconteceu rápido entre 1950 e 1980, com o **êxodo rural** (a saída das pessoas do campo). Hoje a maior parte dos brasileiros vive em cidades.'
                ]
            },
            {
                titulo: 'Desmatamento',
                texto: [
                    'Quando florestas são derrubadas em grande escala, muitos animais e plantas perdem seu habitat. A principal consequência é a **perda de biodiversidade**. O desmatamento também empobrece o solo e piora o aquecimento global.'
                ]
            },
            {
                titulo: 'Fontes de energia',
                lista: [
                    '**Renováveis:** se renovam na natureza e não acabam. Ex.: solar, eólica (vento), hidrelétrica (água).',
                    '**Não renováveis:** levam milhões de anos para se formar e podem acabar. Ex.: petróleo, carvão mineral, gás natural.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'A energia solar é renovável?',
                passos: ['Ela vem da luz do Sol', 'O Sol continua brilhando todos os dias', 'Usar a luz hoje não diminui a de amanhã'],
                resposta: 'Sim, é uma fonte renovável.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual destas é uma fonte de energia renovável?',
                alternativas: ['Petróleo', 'Energia eólica', 'Carvão mineral'],
                correta: 1,
                explicacao: 'A energia eólica vem do vento, que não acaba. Petróleo e carvão são não renováveis.'
            },
            {
                pergunta: 'O que é urbanização?',
                alternativas: ['O crescimento das cidades', 'O aumento das áreas rurais', 'A diminuição da população'],
                correta: 0,
                explicacao: 'Urbanização é o crescimento das cidades e da população que vive nelas.'
            }
        ],
        resumo: [
            'Urbanização = crescimento das cidades (no Brasil, com o êxodo rural).',
            'Desmatamento causa perda de biodiversidade.',
            'Renováveis: solar, eólica, hidrelétrica. Não renováveis: petróleo, carvão, gás.'
        ]
    }
];
