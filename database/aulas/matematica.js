// Aulas de Matemática
module.exports = [
    {
        ordem: 1,
        titulo: 'Operações, potências e expressões',
        descricao: 'A ordem certa para resolver uma conta e como calcular potências.',
        minutos: 7,
        secoes: [
            {
                titulo: 'A ordem das operações',
                texto: [
                    'Quando uma expressão tem várias operações, não dá para resolver da esquerda para a direita de qualquer jeito. Existe uma **ordem** que todo mundo segue, e é por isso que a conta dá o mesmo resultado para qualquer pessoa.'
                ],
                lista: [
                    '1º: o que está dentro de **parênteses**',
                    '2º: **potências** e raízes',
                    '3º: **multiplicações e divisões**, na ordem em que aparecem',
                    '4º: **somas e subtrações**, na ordem em que aparecem'
                ]
            },
            {
                titulo: 'Potências',
                texto: [
                    'Uma potência é uma multiplicação repetida. Em **3²** (lê-se "três ao quadrado"), o 3 é a **base** e o 2 é o **expoente**: multiplicamos o 3 por ele mesmo 2 vezes.',
                    'Assim, 3² = 3 × 3 = 9 e 2³ = 2 × 2 × 2 = 8. Cuidado com um erro comum: 3² **não** é 3 × 2.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Resolva 12 + 8 × 2',
                passos: [
                    'Primeiro a multiplicação: 8 × 2 = 16',
                    'Depois a soma: 12 + 16 = 28'
                ],
                resposta: '28 (e não 40, que seria o resultado somando primeiro)'
            },
            {
                titulo: 'Resolva 3² + 4²',
                passos: ['Calcule as potências: 3² = 9 e 4² = 16', 'Some os resultados: 9 + 16 = 25'],
                resposta: '25'
            }
        ],
        fixacao: [
            {
                pergunta: 'Quanto é 10 − 2 × 3?',
                alternativas: ['24', '4', '16'],
                correta: 1,
                explicacao: 'A multiplicação vem antes: 2 × 3 = 6. Depois, 10 − 6 = 4.'
            },
            {
                pergunta: 'Quanto vale 5²?',
                alternativas: ['10', '25', '7'],
                correta: 1,
                explicacao: '5² = 5 × 5 = 25. O expoente diz quantas vezes a base se multiplica.'
            }
        ],
        resumo: [
            'Ordem: parênteses → potências → multiplicação e divisão → soma e subtração.',
            'Potência é multiplicação repetida: 2³ = 2 × 2 × 2 = 8.',
            '3² é 3 × 3, e não 3 × 2.'
        ]
    },
    {
        ordem: 2,
        titulo: 'Frações, decimais e porcentagem',
        descricao: 'Como transformar números decimais em frações e calcular descontos.',
        minutos: 8,
        secoes: [
            {
                titulo: 'Frações',
                texto: [
                    'Uma fração representa **partes de um inteiro**. Em 3/4, o inteiro foi dividido em 4 partes iguais (o **denominador**) e pegamos 3 delas (o **numerador**).',
                    '**Frações equivalentes** representam a mesma quantidade. Para encontrar uma, multiplique (ou divida) o numerador e o denominador pelo mesmo número: 1/2 = 2/4 = 3/6.'
                ]
            },
            {
                titulo: 'De decimal para fração',
                texto: [
                    'Todo número decimal pode virar fração. Escreva o número sem a vírgula em cima e, embaixo, 10, 100 ou 1000, conforme a quantidade de casas depois da vírgula. Depois, simplifique.',
                    'Exemplo: 0,25 tem duas casas → 25/100 → dividindo os dois por 25 → **1/4**.'
                ]
            },
            {
                titulo: 'Porcentagem',
                texto: [
                    'Porcentagem é uma fração com denominador 100. **25%** é o mesmo que 25/100, ou 0,25.',
                    'Para calcular x% de um valor, multiplique o valor por x e divida por 100. Um atalho útil: **10%** de um número é só dividir por 10.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Um produto de R$ 80,00 tem 10% de desconto. Quanto fica?',
                passos: ['10% de 80 = 80 ÷ 10 = 8', 'Preço final: 80 − 8 = 72'],
                resposta: 'R$ 72,00'
            },
            {
                titulo: 'Transforme 0,5 em fração',
                passos: ['Uma casa decimal → 5/10', 'Dividindo os dois por 5 → 1/2'],
                resposta: '1/2'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual fração é equivalente a 1/3?',
                alternativas: ['2/6', '2/3', '3/1'],
                correta: 0,
                explicacao: 'Multiplicando o numerador e o denominador por 2: 1 × 2 = 2 e 3 × 2 = 6, então 1/3 = 2/6.'
            },
            {
                pergunta: 'Quanto é 20% de 50?',
                alternativas: ['20', '5', '10'],
                correta: 2,
                explicacao: '50 × 20 ÷ 100 = 10. Ou: 10% de 50 é 5, então 20% é o dobro, 10.'
            }
        ],
        resumo: [
            'Fração = partes de um inteiro (numerador em cima, denominador embaixo).',
            'Frações equivalentes: multiplique em cima e embaixo pelo mesmo número.',
            '0,25 = 25/100 = 1/4.',
            '10% de um número = o número dividido por 10.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Equações e funções do 1º grau',
        descricao: 'Como descobrir o valor de x e calcular o valor de uma função.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Equações',
                texto: [
                    'Uma equação é uma igualdade com um valor desconhecido, chamado de **incógnita** (normalmente x). Resolver a equação é descobrir qual número deixa a igualdade verdadeira.',
                    'A ideia principal é deixar o x sozinho de um lado. Para isso, usamos a **operação inversa**: o que está somando passa subtraindo, o que está multiplicando passa dividindo.'
                ]
            },
            {
                titulo: 'Funções',
                texto: [
                    'Uma função é uma regra que transforma um número em outro. Em **f(x) = 2x + 3**, a regra é: "multiplique por 2 e some 3".',
                    'Para calcular f(4), basta **substituir** o x por 4 na regra.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Resolva x + 8 = 20',
                passos: ['O 8 está somando, então passa subtraindo: x = 20 − 8', 'x = 12', 'Conferindo: 12 + 8 = 20 ✔'],
                resposta: 'x = 12'
            },
            {
                titulo: 'Se f(x) = 2x + 3, quanto vale f(4)?',
                passos: ['Troque o x por 4: f(4) = 2 × 4 + 3', 'f(4) = 8 + 3 = 11'],
                resposta: 'f(4) = 11'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é o valor de x em 3x = 21?',
                alternativas: ['7', '18', '24'],
                correta: 0,
                explicacao: 'O 3 está multiplicando, então passa dividindo: x = 21 ÷ 3 = 7.'
            },
            {
                pergunta: 'Se f(x) = x + 5, quanto vale f(10)?',
                alternativas: ['50', '15', '5'],
                correta: 1,
                explicacao: 'Substituindo x por 10: f(10) = 10 + 5 = 15.'
            }
        ],
        resumo: [
            'Resolver uma equação = descobrir o valor de x.',
            'Use a operação inversa para isolar o x (soma ↔ subtração, multiplicação ↔ divisão).',
            'Para calcular f(número), troque o x pelo número.',
            'Sempre dá para conferir: coloque o resultado no lugar do x.'
        ]
    },
    {
        ordem: 4,
        titulo: 'Geometria: área, perímetro e velocidade média',
        descricao: 'Medidas de figuras planas e uma aplicação de divisão no dia a dia.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Perímetro',
                texto: [
                    'O **perímetro** é a soma das medidas de todos os lados de uma figura, como se fosse a "cerca" em volta dela.',
                    'Num quadrado, os 4 lados são iguais, então o perímetro é **4 × lado**.'
                ]
            },
            {
                titulo: 'Área',
                texto: ['A **área** é o tamanho da superfície de dentro da figura. É medida em unidades ao quadrado, como cm² e m².'],
                lista: [
                    'Retângulo: **base × altura**',
                    'Quadrado: **lado × lado**',
                    'Triângulo: **(base × altura) ÷ 2**'
                ]
            },
            {
                titulo: 'Velocidade média',
                texto: [
                    'A velocidade média diz quanto se percorre, em média, a cada unidade de tempo. A conta é **distância ÷ tempo**.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Área de um retângulo com base 6 cm e altura 4 cm',
                passos: ['Área = base × altura', 'Área = 6 × 4 = 24'],
                resposta: '24 cm²'
            },
            {
                titulo: 'Um carro percorre 240 km em 4 horas. Qual a velocidade média?',
                passos: ['Velocidade = distância ÷ tempo', '240 ÷ 4 = 60'],
                resposta: '60 km/h'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é o perímetro de um quadrado de lado 5 cm?',
                alternativas: ['25 cm', '20 cm', '10 cm'],
                correta: 1,
                explicacao: 'O quadrado tem 4 lados iguais: 4 × 5 = 20 cm. (25 cm² seria a área.)'
            },
            {
                pergunta: 'Qual é a área de um triângulo de base 10 m e altura 4 m?',
                alternativas: ['40 m²', '14 m²', '20 m²'],
                correta: 2,
                explicacao: '(base × altura) ÷ 2 = (10 × 4) ÷ 2 = 40 ÷ 2 = 20 m².'
            }
        ],
        resumo: [
            'Perímetro = soma dos lados. Quadrado: 4 × lado.',
            'Área do retângulo = base × altura (em cm², m²...).',
            'Área do triângulo = (base × altura) ÷ 2.',
            'Velocidade média = distância ÷ tempo.'
        ]
    }
];
