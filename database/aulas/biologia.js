// Aulas de Biologia
module.exports = [
    {
        ordem: 1,
        titulo: 'A célula',
        descricao: 'A unidade básica da vida, as organelas e o DNA.',
        minutos: 7,
        secoes: [
            {
                titulo: 'A unidade da vida',
                texto: [
                    'Todos os seres vivos são formados por **células**. Algumas bactérias têm uma célula só; o corpo humano tem trilhões delas. Por isso dizemos que a célula é a **unidade básica dos seres vivos**.'
                ]
            },
            {
                titulo: 'Organelas importantes',
                lista: [
                    '**Núcleo:** guarda o DNA e comanda a célula.',
                    '**Mitocôndria:** faz a respiração celular e produz grande parte da energia. É a "usina de energia" da célula.',
                    '**Ribossomo:** produz proteínas.',
                    '**Cloroplasto:** existe nas células das plantas e faz a fotossíntese.'
                ]
            },
            {
                titulo: 'O DNA',
                texto: [
                    'O **DNA** é a molécula que guarda as **informações genéticas**: as instruções que definem as características de cada ser vivo e que passam de pais para filhos (hereditariedade).'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Por que a mitocôndria é chamada de "usina de energia"?',
                passos: ['A célula precisa de energia para funcionar', 'Na mitocôndria acontece a respiração celular', 'Ela transforma a glicose em energia que a célula usa'],
                resposta: 'Porque produz grande parte da energia da célula.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual molécula guarda as informações genéticas?',
                alternativas: ['Glicose', 'DNA', 'Água'],
                correta: 1,
                explicacao: 'O DNA guarda as instruções genéticas e passa as características hereditárias.'
            },
            {
                pergunta: 'Qual é a unidade básica dos seres vivos?',
                alternativas: ['Órgão', 'Tecido', 'Célula'],
                correta: 2,
                explicacao: 'Todo ser vivo é formado por uma ou mais células.'
            }
        ],
        resumo: [
            'Célula = unidade básica dos seres vivos.',
            'Mitocôndria produz energia; núcleo guarda o DNA; cloroplasto faz fotossíntese.',
            'DNA = informação genética (hereditariedade).'
        ]
    },
    {
        ordem: 2,
        titulo: 'O corpo humano',
        descricao: 'Sistema circulatório, sangue e defesa do organismo.',
        minutos: 7,
        secoes: [
            {
                titulo: 'Sistema circulatório',
                texto: [
                    'O **sistema circulatório** transporta o sangue por todo o corpo, levando nutrientes e oxigênio às células e retirando os resíduos.',
                    'O **coração** é o órgão que **bombeia** o sangue, e os vasos sanguíneos (artérias, veias e capilares) são os "caminhos" por onde ele passa.'
                ]
            },
            {
                titulo: 'Os componentes do sangue',
                lista: [
                    '**Glóbulos vermelhos (hemácias):** transportam o oxigênio, graças à hemoglobina.',
                    '**Glóbulos brancos (leucócitos):** defendem o corpo contra vírus e bactérias.',
                    '**Plaquetas:** ajudam na coagulação, fechando machucados.'
                ]
            },
            {
                titulo: 'Sistema imunológico',
                texto: [
                    'O **sistema imunológico** é o sistema de defesa do corpo contra os agentes que causam doenças. As **vacinas** treinam esse sistema para reconhecer um invasor antes de a pessoa ter contato com ele.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Qual o caminho do oxigênio até uma célula do pé?',
                passos: ['O oxigênio entra pelos pulmões', 'Ele se liga aos glóbulos vermelhos', 'O coração bombeia o sangue pelas artérias até o pé'],
                resposta: 'Pulmões → glóbulos vermelhos → coração bombeia → células do pé.'
            }
        ],
        fixacao: [
            {
                pergunta: 'Qual é a principal função dos glóbulos vermelhos?',
                alternativas: ['Transportar oxigênio', 'Combater vírus', 'Fechar machucados'],
                correta: 0,
                explicacao: 'Os glóbulos vermelhos levam o oxigênio pelo corpo. Os brancos defendem; as plaquetas coagulam.'
            },
            {
                pergunta: 'Qual órgão bombeia o sangue pelo corpo?',
                alternativas: ['Pulmão', 'Coração', 'Fígado'],
                correta: 1,
                explicacao: 'O coração é a "bomba" do sistema circulatório.'
            }
        ],
        resumo: [
            'Sistema circulatório: coração + vasos sanguíneos.',
            'Glóbulos vermelhos levam oxigênio; brancos defendem; plaquetas coagulam.',
            'Sistema imunológico defende o corpo; vacinas o treinam.'
        ]
    },
    {
        ordem: 3,
        titulo: 'Plantas e ecologia',
        descricao: 'Fotossíntese, produtores e ecossistemas.',
        minutos: 6,
        secoes: [
            {
                titulo: 'Fotossíntese',
                texto: [
                    'As plantas produzem o próprio alimento pela **fotossíntese**. Elas usam **luz do Sol**, **água** e **gás carbônico (CO₂)** para produzir **glicose** (alimento) e liberam **oxigênio**.',
                    'Isso acontece nos cloroplastos, graças à **clorofila**, o pigmento verde das folhas.'
                ]
            },
            {
                titulo: 'Produtores e consumidores',
                lista: [
                    '**Produtores:** fazem o próprio alimento (plantas e algas). São os seres autótrofos.',
                    '**Consumidores:** se alimentam de outros seres (animais).',
                    '**Decompositores:** decompõem restos de seres vivos (fungos e bactérias).'
                ]
            },
            {
                titulo: 'Ecossistema',
                texto: [
                    'Um **ecossistema** é a interação entre os **seres vivos** de um lugar e o **ambiente** onde vivem: água, solo, ar, luz e temperatura. Um lago, uma floresta e até um aquário são ecossistemas.'
                ]
            }
        ],
        exemplos: [
            {
                titulo: 'Monte uma cadeia alimentar simples',
                passos: ['Capim: produtor (faz fotossíntese)', 'Gafanhoto: come o capim (consumidor primário)', 'Sapo: come o gafanhoto (consumidor secundário)'],
                resposta: 'Capim → gafanhoto → sapo.'
            }
        ],
        fixacao: [
            {
                pergunta: 'O que as plantas liberam na fotossíntese?',
                alternativas: ['Gás carbônico', 'Oxigênio', 'Nitrogênio'],
                correta: 1,
                explicacao: 'Na fotossíntese as plantas absorvem CO₂ e liberam oxigênio.'
            },
            {
                pergunta: 'Os fungos que decompõem folhas caídas são:',
                alternativas: ['Produtores', 'Consumidores', 'Decompositores'],
                correta: 2,
                explicacao: 'Fungos e bactérias decompõem restos de seres vivos e devolvem nutrientes ao solo.'
            }
        ],
        resumo: [
            'Fotossíntese: luz + água + CO₂ → glicose + oxigênio.',
            'Produtores (plantas) → consumidores (animais) → decompositores (fungos, bactérias).',
            'Ecossistema = seres vivos + ambiente.'
        ]
    }
];
