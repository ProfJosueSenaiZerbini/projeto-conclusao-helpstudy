// =====================================================================
// Dados da Tabela Periódica (118 elementos)
// [número atômico, símbolo, nome, massa atômica, categoria]
// Massas entre colchetes são do isótopo mais estável (elementos radioativos).
// =====================================================================
const ELEMENTOS = [
    [1, 'H', 'Hidrogênio', '1,008', 'nao-metal'],
    [2, 'He', 'Hélio', '4,003', 'gas-nobre'],
    [3, 'Li', 'Lítio', '6,94', 'alcalino'],
    [4, 'Be', 'Berílio', '9,012', 'alcalino-terroso'],
    [5, 'B', 'Boro', '10,81', 'semimetal'],
    [6, 'C', 'Carbono', '12,011', 'nao-metal'],
    [7, 'N', 'Nitrogênio', '14,007', 'nao-metal'],
    [8, 'O', 'Oxigênio', '15,999', 'nao-metal'],
    [9, 'F', 'Flúor', '18,998', 'halogenio'],
    [10, 'Ne', 'Neônio', '20,180', 'gas-nobre'],
    [11, 'Na', 'Sódio', '22,990', 'alcalino'],
    [12, 'Mg', 'Magnésio', '24,305', 'alcalino-terroso'],
    [13, 'Al', 'Alumínio', '26,982', 'outro-metal'],
    [14, 'Si', 'Silício', '28,085', 'semimetal'],
    [15, 'P', 'Fósforo', '30,974', 'nao-metal'],
    [16, 'S', 'Enxofre', '32,06', 'nao-metal'],
    [17, 'Cl', 'Cloro', '35,45', 'halogenio'],
    [18, 'Ar', 'Argônio', '39,95', 'gas-nobre'],
    [19, 'K', 'Potássio', '39,098', 'alcalino'],
    [20, 'Ca', 'Cálcio', '40,078', 'alcalino-terroso'],
    [21, 'Sc', 'Escândio', '44,956', 'transicao'],
    [22, 'Ti', 'Titânio', '47,867', 'transicao'],
    [23, 'V', 'Vanádio', '50,942', 'transicao'],
    [24, 'Cr', 'Cromo', '51,996', 'transicao'],
    [25, 'Mn', 'Manganês', '54,938', 'transicao'],
    [26, 'Fe', 'Ferro', '55,845', 'transicao'],
    [27, 'Co', 'Cobalto', '58,933', 'transicao'],
    [28, 'Ni', 'Níquel', '58,693', 'transicao'],
    [29, 'Cu', 'Cobre', '63,546', 'transicao'],
    [30, 'Zn', 'Zinco', '65,38', 'transicao'],
    [31, 'Ga', 'Gálio', '69,723', 'outro-metal'],
    [32, 'Ge', 'Germânio', '72,630', 'semimetal'],
    [33, 'As', 'Arsênio', '74,922', 'semimetal'],
    [34, 'Se', 'Selênio', '78,971', 'nao-metal'],
    [35, 'Br', 'Bromo', '79,904', 'halogenio'],
    [36, 'Kr', 'Criptônio', '83,798', 'gas-nobre'],
    [37, 'Rb', 'Rubídio', '85,468', 'alcalino'],
    [38, 'Sr', 'Estrôncio', '87,62', 'alcalino-terroso'],
    [39, 'Y', 'Ítrio', '88,906', 'transicao'],
    [40, 'Zr', 'Zircônio', '91,224', 'transicao'],
    [41, 'Nb', 'Nióbio', '92,906', 'transicao'],
    [42, 'Mo', 'Molibdênio', '95,95', 'transicao'],
    [43, 'Tc', 'Tecnécio', '[98]', 'transicao'],
    [44, 'Ru', 'Rutênio', '101,07', 'transicao'],
    [45, 'Rh', 'Ródio', '102,91', 'transicao'],
    [46, 'Pd', 'Paládio', '106,42', 'transicao'],
    [47, 'Ag', 'Prata', '107,87', 'transicao'],
    [48, 'Cd', 'Cádmio', '112,41', 'transicao'],
    [49, 'In', 'Índio', '114,82', 'outro-metal'],
    [50, 'Sn', 'Estanho', '118,71', 'outro-metal'],
    [51, 'Sb', 'Antimônio', '121,76', 'semimetal'],
    [52, 'Te', 'Telúrio', '127,60', 'semimetal'],
    [53, 'I', 'Iodo', '126,90', 'halogenio'],
    [54, 'Xe', 'Xenônio', '131,29', 'gas-nobre'],
    [55, 'Cs', 'Césio', '132,91', 'alcalino'],
    [56, 'Ba', 'Bário', '137,33', 'alcalino-terroso'],
    [57, 'La', 'Lantânio', '138,91', 'lantanideo'],
    [58, 'Ce', 'Cério', '140,12', 'lantanideo'],
    [59, 'Pr', 'Praseodímio', '140,91', 'lantanideo'],
    [60, 'Nd', 'Neodímio', '144,24', 'lantanideo'],
    [61, 'Pm', 'Promécio', '[145]', 'lantanideo'],
    [62, 'Sm', 'Samário', '150,36', 'lantanideo'],
    [63, 'Eu', 'Európio', '151,96', 'lantanideo'],
    [64, 'Gd', 'Gadolínio', '157,25', 'lantanideo'],
    [65, 'Tb', 'Térbio', '158,93', 'lantanideo'],
    [66, 'Dy', 'Disprósio', '162,50', 'lantanideo'],
    [67, 'Ho', 'Hólmio', '164,93', 'lantanideo'],
    [68, 'Er', 'Érbio', '167,26', 'lantanideo'],
    [69, 'Tm', 'Túlio', '168,93', 'lantanideo'],
    [70, 'Yb', 'Itérbio', '173,05', 'lantanideo'],
    [71, 'Lu', 'Lutécio', '174,97', 'lantanideo'],
    [72, 'Hf', 'Háfnio', '178,49', 'transicao'],
    [73, 'Ta', 'Tântalo', '180,95', 'transicao'],
    [74, 'W', 'Tungstênio', '183,84', 'transicao'],
    [75, 'Re', 'Rênio', '186,21', 'transicao'],
    [76, 'Os', 'Ósmio', '190,23', 'transicao'],
    [77, 'Ir', 'Irídio', '192,22', 'transicao'],
    [78, 'Pt', 'Platina', '195,08', 'transicao'],
    [79, 'Au', 'Ouro', '196,97', 'transicao'],
    [80, 'Hg', 'Mercúrio', '200,59', 'transicao'],
    [81, 'Tl', 'Tálio', '204,38', 'outro-metal'],
    [82, 'Pb', 'Chumbo', '207,2', 'outro-metal'],
    [83, 'Bi', 'Bismuto', '208,98', 'outro-metal'],
    [84, 'Po', 'Polônio', '[209]', 'outro-metal'],
    [85, 'At', 'Astato', '[210]', 'halogenio'],
    [86, 'Rn', 'Radônio', '[222]', 'gas-nobre'],
    [87, 'Fr', 'Frâncio', '[223]', 'alcalino'],
    [88, 'Ra', 'Rádio', '[226]', 'alcalino-terroso'],
    [89, 'Ac', 'Actínio', '[227]', 'actinideo'],
    [90, 'Th', 'Tório', '232,04', 'actinideo'],
    [91, 'Pa', 'Protactínio', '231,04', 'actinideo'],
    [92, 'U', 'Urânio', '238,03', 'actinideo'],
    [93, 'Np', 'Netúnio', '[237]', 'actinideo'],
    [94, 'Pu', 'Plutônio', '[244]', 'actinideo'],
    [95, 'Am', 'Amerício', '[243]', 'actinideo'],
    [96, 'Cm', 'Cúrio', '[247]', 'actinideo'],
    [97, 'Bk', 'Berquélio', '[247]', 'actinideo'],
    [98, 'Cf', 'Califórnio', '[251]', 'actinideo'],
    [99, 'Es', 'Einstênio', '[252]', 'actinideo'],
    [100, 'Fm', 'Férmio', '[257]', 'actinideo'],
    [101, 'Md', 'Mendelévio', '[258]', 'actinideo'],
    [102, 'No', 'Nobélio', '[259]', 'actinideo'],
    [103, 'Lr', 'Laurêncio', '[262]', 'actinideo'],
    [104, 'Rf', 'Rutherfórdio', '[267]', 'transicao'],
    [105, 'Db', 'Dúbnio', '[268]', 'transicao'],
    [106, 'Sg', 'Seabórgio', '[269]', 'transicao'],
    [107, 'Bh', 'Bóhrio', '[270]', 'transicao'],
    [108, 'Hs', 'Hássio', '[269]', 'transicao'],
    [109, 'Mt', 'Meitnério', '[278]', 'transicao'],
    [110, 'Ds', 'Darmstádtio', '[281]', 'transicao'],
    [111, 'Rg', 'Roentgênio', '[282]', 'transicao'],
    [112, 'Cn', 'Copernício', '[285]', 'transicao'],
    [113, 'Nh', 'Nihônio', '[286]', 'outro-metal'],
    [114, 'Fl', 'Fleróvio', '[289]', 'outro-metal'],
    [115, 'Mc', 'Moscóvio', '[290]', 'outro-metal'],
    [116, 'Lv', 'Livermório', '[293]', 'outro-metal'],
    [117, 'Ts', 'Tenesso', '[294]', 'halogenio'],
    [118, 'Og', 'Oganessônio', '[294]', 'gas-nobre']
];

const CATEGORIAS = {
    'alcalino': 'Metal alcalino',
    'alcalino-terroso': 'Metal alcalino-terroso',
    'transicao': 'Metal de transição',
    'outro-metal': 'Outro metal',
    'semimetal': 'Semimetal',
    'nao-metal': 'Não metal',
    'halogenio': 'Halogênio',
    'gas-nobre': 'Gás nobre',
    'lantanideo': 'Lantanídeo',
    'actinideo': 'Actinídeo'
};

// Nome das famílias mais cobradas
const FAMILIAS = {
    1: 'Família 1 (1A) — Metais alcalinos',
    2: 'Família 2 (2A) — Metais alcalino-terrosos',
    13: 'Família 13 (3A) — Família do boro',
    14: 'Família 14 (4A) — Família do carbono',
    15: 'Família 15 (5A) — Família do nitrogênio',
    16: 'Família 16 (6A) — Calcogênios',
    17: 'Família 17 (7A) — Halogênios',
    18: 'Família 18 (8A) — Gases nobres'
};

// Estado físico a 25 °C (o que não está aqui é sólido)
const GASES = ['H', 'He', 'N', 'O', 'F', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe', 'Rn'];
const LIQUIDOS = ['Br', 'Hg'];

// Curiosidades dos elementos mais conhecidos
const CURIOSIDADES = {
    H: 'É o elemento mais abundante do universo e forma a água (H₂O) junto com o oxigênio.',
    He: 'É mais leve que o ar, por isso é usado para encher balões.',
    C: 'É a base da vida: está presente em todas as moléculas orgânicas. O diamante e o grafite são feitos só de carbono.',
    N: 'Forma cerca de 78% do ar que respiramos.',
    O: 'Forma cerca de 21% do ar e é essencial para a respiração dos seres vivos.',
    F: 'Os compostos de flúor são usados nas pastas de dente para proteger os dentes contra cáries.',
    Ne: 'É usado nos letreiros luminosos de "neon", que brilham em vermelho-alaranjado.',
    Na: 'Junto com o cloro, forma o sal de cozinha (NaCl).',
    Mg: 'Queima com uma luz branca muito forte e é usado em fogos de artifício.',
    Al: 'É o metal mais abundante da crosta terrestre e é usado em latinhas, por ser leve e reciclável.',
    Si: 'É a base dos chips de computador e está presente na areia (SiO₂).',
    P: 'Está no DNA e nos ossos. Também é usado na cabeça dos palitos de fósforo.',
    S: 'Tem cheiro forte quando forma compostos como o gás sulfídrico (cheiro de ovo podre).',
    Cl: 'É usado para tratar a água e deixá-la própria para beber e para as piscinas.',
    K: 'É encontrado na banana e é importante para o funcionamento dos músculos.',
    Ca: 'Forma os ossos e os dentes. Está no leite e em seus derivados.',
    Fe: 'Está na hemoglobina do sangue, que transporta oxigênio pelo corpo. É a base do aço.',
    Cu: 'É um ótimo condutor de eletricidade, por isso é usado nos fios elétricos.',
    Zn: 'É usado para proteger o ferro da ferrugem (galvanização).',
    Ag: 'É o metal que melhor conduz eletricidade e é usado em joias e espelhos.',
    I: 'É adicionado ao sal de cozinha para prevenir problemas na tireoide (bócio).',
    Au: 'Não enferruja e é muito usado em joias e em componentes eletrônicos.',
    Hg: 'É o único metal líquido em temperatura ambiente. É tóxico e era usado em termômetros antigos.',
    Pb: 'É muito denso e é usado para proteger contra radiação, como nos aventais de raio X.',
    U: 'É usado como combustível nas usinas nucleares, como as de Angra dos Reis (RJ).',
    Nb: 'O Brasil tem as maiores reservas de nióbio do mundo.'
};

// Posição na tabela (período e grupo) a partir do número atômico
function posicaoElemento(z) {
    if (z === 1) return { periodo: 1, grupo: 1 };
    if (z === 2) return { periodo: 1, grupo: 18 };

    const inicios = [[3, 2], [11, 3], [19, 4], [37, 5], [55, 6], [87, 7]];
    let periodo = 0, inicio = 0;
    for (const [z0, p] of inicios) if (z >= z0) { inicio = z0; periodo = p; }
    const i = z - inicio;

    if (periodo <= 3) return { periodo, grupo: i < 2 ? i + 1 : i + 11 };
    if (periodo <= 5) return { periodo, grupo: i + 1 };

    // Períodos 6 e 7: lantanídeos (57–71) e actinídeos (89–103) ficam nas linhas de baixo
    if (i < 2) return { periodo, grupo: i + 1 };
    if (i <= 16) return { periodo, grupo: null, serieF: true, coluna: i + 1 };
    return { periodo, grupo: i - 13 };
}
