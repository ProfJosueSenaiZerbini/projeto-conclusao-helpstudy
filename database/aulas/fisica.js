// Aulas de Física
module.exports = [
    {
        ordem: 1,
        titulo: 'Movimento: velocidade e aceleração',
        descricao: 'Como medir a rapidez de um movimento e suas mudanças.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Velocidade média',
                texto: [
                    'A **velocidade média** mostra a distância percorrida em cada unidade de tempo. A fórmula é **v = d ÷ t** (distância dividida pelo tempo).',
                    'No Sistema Internacional (SI), a velocidade é medida em **metros por segundo (m/s)**. No dia a dia também usamos km/h.'
                ]
            },
            {
                titulo: 'Aceleração',
                texto: [
                    'A **aceleração** é a **variação da velocidade** com o passar do tempo. Um carro que sai do sinal e vai de 0 a 60 km/h está acelerando. Quando ele freia, a velocidade diminui.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Uma pessoa corre 100 m em 20 s. Qual a velocidade média?',
                passos: ['v = d ÷ t', 'v = 100 ÷ 20 = 5'],
                resposta: '5 m/s'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é a unidade de velocidade no Sistema Internacional?',
                alternativas: ['Metro por segundo (m/s)', 'Newton (N)', 'Quilograma (kg)'],
                correta: 0,
                explicacao: 'No SI, a velocidade é medida em metros por segundo.'
            },
            {
                pergunta: 'Um ônibus percorre 180 km em 3 horas. Qual sua velocidade média?',
                alternativas: ['60 km/h', '540 km/h', '90 km/h'],
                correta: 0,
                explicacao: 'v = d ÷ t = 180 ÷ 3 = 60 km/h.'
            }
        ],
        resumo: [
            'Velocidade média: v = distância ÷ tempo.',
            'Unidade no SI: metro por segundo (m/s).',
            'Aceleração = variação da velocidade no tempo.'
        ]
    },
    {
        ordem: 2,
        titulo: 'Forças e as Leis de Newton',
        descricao: 'Inércia, força, gravidade e a unidade Newton.',
        minutos: 8,
        secoes: [
            {
                titulo: 'O que é força',
                texto: [
                    '**Força** é tudo aquilo que pode mudar o movimento ou a forma de um corpo: empurrar, puxar, chutar. Ela é medida em **Newton (N)**, em homenagem a Isaac Newton.'
                ]
            },
            {
                titulo: 'As três Leis de Newton',
                lista: [
                    '**1ª Lei (Inércia):** se nenhuma força resultante agir sobre um corpo, ele continua parado ou em movimento retilíneo e constante. É por isso que o corpo vai para frente quando o ônibus freia.',
                    '**2ª Lei:** F = m × a. Quanto maior a força, maior a aceleração.',
                    '**3ª Lei (Ação e Reação):** toda ação tem uma reação de mesma intensidade e sentido oposto.'
                ]
            },
            {
                titulo: 'Gravidade',
                texto: [
                    'A **força gravitacional** é a atração entre corpos com massa. É ela que faz os objetos caírem em direção ao centro da Terra e mantém a Lua girando em volta do planeta.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Qual força é necessária para acelerar 10 kg a 2 m/s²?',
                passos: ['F = m × a', 'F = 10 × 2 = 20'],
                resposta: '20 N'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é a unidade de força no Sistema Internacional?',
                alternativas: ['Joule', 'Newton', 'Watt'],
                correta: 1,
                explicacao: 'A força é medida em Newton (N).'
            },
            {
                pergunta: 'Quando o ônibus freia, o passageiro vai para frente. Qual lei explica isso?',
                alternativas: ['1ª Lei (Inércia)', '2ª Lei', '3ª Lei (Ação e Reação)'],
                correta: 0,
                explicacao: 'Pela inércia, o corpo do passageiro tende a continuar em movimento mesmo com o ônibus parando.'
            }
        ],
        resumo: [
            'Força muda o movimento ou a forma; unidade: Newton (N).',
            '1ª Lei: inércia. 2ª Lei: F = m × a. 3ª Lei: ação e reação.',
            'Gravidade: força que atrai os corpos para a Terra.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Energia, luz e calor',
        descricao: 'Energia cinética, reflexão da luz e medição de temperatura.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Energia do movimento',
                texto: [
                    'A **energia cinética** é a energia que um corpo tem por estar **em movimento**. Quanto maior a massa e a velocidade, maior essa energia: Ec = (m × v²) ÷ 2.'
                ]
            },
            {
                titulo: 'A luz',
                texto: [
                    'A luz é a coisa mais rápida que existe: no vácuo, ela viaja a cerca de **300.000 km/s**.',
                    'Quando a luz bate numa superfície e volta, acontece a **reflexão**. É ela que nos deixa ver nossa imagem no espelho. Quando a luz muda de meio (do ar para a água), ela muda de direção: é a **refração**.'
                ]
            },
            {
                titulo: 'Temperatura',
                texto: [
                    'O instrumento que mede a temperatura é o **termômetro**. No Brasil, usamos a escala Celsius (°C): a água congela a 0 °C e ferve a 100 °C (ao nível do mar).'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Um corpo de 2 kg se move a 3 m/s. Qual sua energia cinética?',
                passos: ['Ec = (m × v²) ÷ 2', 'Ec = (2 × 3²) ÷ 2 = (2 × 9) ÷ 2', 'Ec = 18 ÷ 2 = 9'],
                resposta: '9 J (joules)'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual fenômeno permite que a gente veja nossa imagem no espelho?',
                alternativas: ['Refração', 'Reflexão', 'Gravitação'],
                correta: 1,
                explicacao: 'O espelho reflete a luz de volta para os nossos olhos: é a reflexão.'
            },
            {
                pergunta: 'Qual energia está ligada ao movimento?',
                alternativas: ['Cinética', 'Térmica', 'Química'],
                correta: 0,
                explicacao: 'Energia cinética é a energia de um corpo em movimento.'
            }
        ],
        resumo: [
            'Energia cinética = energia do movimento.',
            'Velocidade da luz no vácuo ≈ 300.000 km/s.',
            'Reflexão: a luz volta (espelho). Refração: a luz muda de meio e de direção.',
            'Termômetro mede temperatura.'
        ]
    }
];
