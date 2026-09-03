/*
-- =====================================================================
-- 1. APAGAR O BANCO ANTIGO
-- =====================================================================

DROP DATABASE IF EXISTS helpstudy;

CREATE DATABASE helpstudy
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE helpstudy;
*/

-- =====================================================================
-- 2. TABELA DE USUÁRIOS
-- =====================================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    serie VARCHAR(50) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =====================================================================
-- 3. TABELA DE MATÉRIAS
-- =====================================================================

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(255) DEFAULT NULL,
    icone VARCHAR(60) DEFAULT 'fa-book',
    cor VARCHAR(20) DEFAULT '#8B5CF6'
) ENGINE=InnoDB;


-- =====================================================================
-- 4. TABELA DE QUESTÕES
-- =====================================================================

CREATE TABLE questoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    enunciado TEXT NOT NULL,
    imagem VARCHAR(255) DEFAULT NULL,
    alternativa_a VARCHAR(255) NOT NULL,
    alternativa_b VARCHAR(255) NOT NULL,
    alternativa_c VARCHAR(255) NOT NULL,
    alternativa_d VARCHAR(255) NOT NULL,
    correta ENUM('a','b','c','d') NOT NULL,
    explicacao TEXT DEFAULT NULL,
    nivel ENUM('facil','medio','dificil') DEFAULT 'facil',
    dica VARCHAR(255) DEFAULT NULL,

    FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- 5. TABELA DE RESPOSTAS
-- =====================================================================

CREATE TABLE respostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    questao_id INT NOT NULL,
    alternativa_marcada ENUM('a','b','c','d') NOT NULL,
    correta TINYINT(1) NOT NULL,
    tempo_gasto INT DEFAULT 0,
    respondido_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (questao_id)
        REFERENCES questoes(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- 6. TABELA DE PROGRESSO
-- =====================================================================

CREATE TABLE progresso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    materia_id INT NOT NULL,
    questoes_respondidas INT DEFAULT 0,
    questoes_corretas INT DEFAULT 0,
    percentual_acerto DECIMAL(5,2) DEFAULT 0.00,
    nivel_dificuldade ENUM('facil','medio','dificil') DEFAULT 'facil',
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_usuario_materia (usuario_id, materia_id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- 7. PLANO DE ESTUDOS
-- =====================================================================

CREATE TABLE plano_estudos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    materia_id INT NOT NULL,
    motivo VARCHAR(255) DEFAULT NULL,
    prioridade ENUM('baixa','media','alta') DEFAULT 'media',
    concluido TINYINT(1) DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- 8. CONQUISTAS
-- =====================================================================

CREATE TABLE conquistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(60) NOT NULL UNIQUE,
    titulo VARCHAR(120) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    icone VARCHAR(60) DEFAULT 'fa-star'
) ENGINE=InnoDB;


-- =====================================================================
-- 9. CONQUISTAS DOS USUÁRIOS
-- =====================================================================

CREATE TABLE usuario_conquistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conquista_id INT NOT NULL,
    obtido_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_usuario_conquista (usuario_id, conquista_id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (conquista_id)
        REFERENCES conquistas(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- 10. MATÉRIAS
-- =====================================================================
-- IMPORTANTE:
-- Aqui os IDs serão exatamente:
-- 1 Matemática
-- 2 Português
-- 3 História
-- 4 Geografia
-- 5 Química
-- 6 Física
-- 7 Biologia
-- 8 Inglês
--
-- NÃO EXISTE "Ciências".
-- =====================================================================

INSERT INTO materias
(id, nome, slug, descricao, icone, cor)
VALUES

(1, 'Matemática', 'matematica',
 'Números, operações, geometria e lógica',
 'fa-square-root-variable', '#4A6CF7'),

(2, 'Português', 'portugues',
 'Interpretação de texto, gramática e redação',
 'fa-language', '#9B59B6'),

(3, 'História', 'historia',
 'Fatos históricos e formação da sociedade',
 'fa-landmark', '#F39C12'),

(4, 'Geografia', 'geografia',
 'Espaço geográfico, clima e cartografia',
 'fa-earth-americas', '#16A085'),

(5, 'Química', 'quimica',
 'Matéria, reações e transformações',
 'fa-flask', '#27AE60'),

(6, 'Física', 'fisica',
 'Leis do universo, forças e energia',
 'fa-atom', '#3498DB'),

(7, 'Biologia', 'biologia',
 'Seres vivos, células e biodiversidade',
 'fa-dna', '#2ECC71'),

(8, 'Inglês', 'ingles',
 'Vocabulário, gramática e compreensão em inglês',
 'fa-comments', '#E91E8C');


-- =====================================================================
-- 11. CONQUISTAS
-- =====================================================================

INSERT INTO conquistas
(codigo, titulo, descricao, icone)
VALUES

('primeira_questao',
 'Primeiro Passo',
 'Respondeu sua primeira questão',
 'fa-shoe-prints'),

('dez_acertos',
 'Em Chamas',
 'Acertou 10 questões seguidas',
 'fa-fire'),

('materia_completa',
 'Dedicação Total',
 'Completou todas as questões de uma matéria',
 'fa-trophy'),

('semana_ativa',
 'Constância',
 'Estudou 7 dias seguidos',
 'fa-calendar-check');


-- =====================================================================
-- 12. MATEMÁTICA - 10 QUESTÕES
-- materia_id = 1
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(1,
 'Qual é o resultado de 12 + 8 × 2?',
 '40', '28', '22', '32',
 'b',
 'A multiplicação vem antes da soma: 8 × 2 = 16 e 12 + 16 = 28.',
 'facil',
 'Faça primeiro a multiplicação.'),

(1,
 'Um retângulo possui base 6 cm e altura 4 cm. Qual é sua área?',
 '10 cm²', '20 cm²', '24 cm²', '18 cm²',
 'c',
 'Área = base × altura. Portanto, 6 × 4 = 24 cm².',
 'facil',
 'Multiplique base pela altura.'),

(1,
 'Qual fração representa 0,25?',
 '1/2', '1/4', '1/5', '2/5',
 'b',
 '0,25 corresponde a 25/100, que simplificado resulta em 1/4.',
 'facil',
 'Transforme o decimal em fração.'),

(1,
 'Qual é o resultado de 3² + 4²?',
 '12', '20', '25', '49',
 'c',
 '3² = 9 e 4² = 16. Logo, 9 + 16 = 25.',
 'facil',
 'Calcule as potências primeiro.'),

(1,
 'Se x + 8 = 20, qual é o valor de x?',
 '10', '12', '14', '16',
 'b',
 'x = 20 - 8 = 12.',
 'facil',
 'Use a operação inversa.'),

(1,
 'Qual fração é equivalente a 1/2?',
 '2/3', '2/4', '3/5', '4/5',
 'b',
 'Multiplicando numerador e denominador por 2, temos 2/4.',
 'facil',
 'Multiplique os dois números pelo mesmo valor.'),

(1,
 'Um produto custa R$ 80,00 e recebe 10% de desconto. Qual será o preço final?',
 'R$ 70,00', 'R$ 72,00', 'R$ 75,00', 'R$ 78,00',
 'b',
 '10% de 80 é 8. Portanto, 80 - 8 = 72.',
 'medio',
 'Calcule 10% de 80.'),

(1,
 'Qual é o perímetro de um quadrado com lado de 5 cm?',
 '10 cm', '15 cm', '20 cm', '25 cm',
 'c',
 'Um quadrado possui quatro lados iguais: 4 × 5 = 20 cm.',
 'facil',
 'Multiplique o lado por 4.'),

(1,
 'Se f(x) = 2x + 3, qual é o valor de f(4)?',
 '7', '8', '11', '12',
 'c',
 'f(4) = 2 × 4 + 3 = 11.',
 'medio',
 'Substitua x por 4.'),

(1,
 'Um carro percorre 240 km em 4 horas. Qual é sua velocidade média?',
 '40 km/h', '50 km/h', '60 km/h', '80 km/h',
 'c',
 'Velocidade média = distância ÷ tempo: 240 ÷ 4 = 60 km/h.',
 'medio',
 'Divida distância pelo tempo.');


-- =====================================================================
-- 13. PORTUGUÊS - 10 QUESTÕES
-- materia_id = 2
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(2,
 'Assinale a alternativa em que a palavra está corretamente acentuada:',
 'Ánálise', 'Análise', 'Analíse', 'Analise-',
 'b',
 'A forma correta é análise.',
 'facil',
 'Observe a posição do acento.'),

(2,
 'Em "O menino, que estava cansado, foi dormir cedo", a oração "que estava cansado" é:',
 'Oração principal',
 'Oração subordinada adjetiva',
 'Oração coordenada',
 'Oração subordinada substantiva',
 'b',
 'A oração caracteriza o substantivo menino.',
 'medio',
 'Ela caracteriza um substantivo.'),

(2,
 'Qual é o sinônimo de "feliz"?',
 'Triste', 'Contente', 'Bravo', 'Cansado',
 'b',
 'Contente possui significado semelhante a feliz.',
 'facil',
 'Procure uma palavra de sentido semelhante.'),

(2,
 'Qual é o antônimo de "rápido"?',
 'Veloz', 'Ligeiro', 'Devagar', 'Ágil',
 'c',
 'Devagar apresenta sentido contrário a rápido.',
 'facil',
 'Antônimo significa sentido contrário.'),

(2,
 'Na frase "Maria comprou um livro", qual é o sujeito?',
 'Comprou', 'Um livro', 'Maria', 'Livro',
 'c',
 'Maria realiza a ação e é o sujeito.',
 'facil',
 'Pergunte quem realizou a ação.'),

(2,
 'Qual alternativa apresenta um substantivo?',
 'Correr', 'Bonito', 'Casa', 'Rapidamente',
 'c',
 'Casa é um substantivo.',
 'facil',
 'Substantivos nomeiam seres, objetos e lugares.'),

(2,
 'Em "O aluno estudou bastante", qual é o verbo?',
 'Aluno', 'Estudou', 'Bastante', 'O',
 'b',
 'Estudou indica a ação realizada.',
 'facil',
 'Procure a ação.'),

(2,
 'Qual alternativa apresenta uma oração no futuro?',
 'Eu estudei ontem.',
 'Eu estudo todos os dias.',
 'Eu estudarei amanhã.',
 'Eu estudava ontem.',
 'c',
 'Estudarei indica uma ação futura.',
 'medio',
 'Observe quando a ação acontecerá.'),

(2,
 'Na frase "A menina é muito inteligente", qual palavra é um adjetivo?',
 'Menina', 'É', 'Muito', 'Inteligente',
 'd',
 'Inteligente caracteriza a menina.',
 'facil',
 'Adjetivos caracterizam substantivos.'),

(2,
 'Em "Pedro e João estudaram para a prova", o sujeito é:',
 'Simples', 'Composto', 'Oculto', 'Indeterminado',
 'b',
 'Pedro e João formam um sujeito composto.',
 'medio',
 'Observe quantos núcleos existem.');


-- =====================================================================
-- 14. HISTÓRIA - 10 QUESTÕES
-- materia_id = 3
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(3,
 'Em que ano ocorreu a chegada dos portugueses ao território que hoje corresponde ao Brasil?',
 '1492', '1500', '1530', '1822',
 'b',
 'A chegada da frota de Pedro Álvares Cabral ocorreu em 1500.',
 'facil',
 'É o ano tradicionalmente associado à chegada de Cabral.'),

(3,
 'Quem proclamou a Independência do Brasil em 1822?',
 'Dom Pedro I', 'Dom Pedro II', 'Tiradentes', 'Getúlio Vargas',
 'a',
 'Dom Pedro I declarou a Independência em 1822.',
 'facil',
 'Está relacionado ao Dia da Independência.'),

(3,
 'Qual civilização construiu as pirâmides de Gizé?',
 'Romanos', 'Gregos', 'Egípcios', 'Maias',
 'c',
 'As pirâmides de Gizé foram construídas no Egito Antigo.',
 'facil',
 'Pense no Rio Nilo.'),

(3,
 'Qual foi um dos primeiros produtos explorados pelos portugueses no Brasil?',
 'Café', 'Pau-brasil', 'Borracha', 'Soja',
 'b',
 'O pau-brasil foi um dos primeiros produtos explorados.',
 'facil',
 'Era uma árvore encontrada no litoral.'),

(3,
 'A Revolução Industrial teve início principalmente em qual país?',
 'França', 'Portugal', 'Inglaterra', 'Brasil',
 'c',
 'A Revolução Industrial começou na Inglaterra.',
 'medio',
 'Pense nas primeiras fábricas.'),

(3,
 'Qual característica marcou a economia colonial brasileira?',
 'Produção voltada principalmente para o mercado externo',
 'Produção exclusivamente para consumo local',
 'Ausência de agricultura',
 'Predomínio da indústria automobilística',
 'a',
 'A economia colonial estava ligada à produção para exportação.',
 'medio',
 'Pense na relação entre colônia e Portugal.'),

(3,
 'Quem foi Getúlio Vargas?',
 'Um imperador brasileiro',
 'Um presidente brasileiro',
 'Um navegador português',
 'Um líder indígena',
 'b',
 'Getúlio Vargas foi uma importante figura política brasileira.',
 'facil',
 'Ele governou o Brasil em diferentes períodos.'),

(3,
 'Qual acontecimento encerrou a monarquia e iniciou a República no Brasil?',
 'Independência do Brasil',
 'Proclamação da República',
 'Revolução Industrial',
 'Guerra do Paraguai',
 'b',
 'A Proclamação da República ocorreu em 1889.',
 'facil',
 'Aconteceu em 15 de novembro de 1889.'),

(3,
 'A Guerra Fria envolveu principalmente quais potências?',
 'Brasil e Argentina',
 'Estados Unidos e União Soviética',
 'França e Inglaterra',
 'China e Japão',
 'b',
 'A Guerra Fria foi marcada pela rivalidade entre EUA e URSS.',
 'medio',
 'Pense em capitalismo e socialismo.'),

(3,
 'Qual movimento defendia a independência de Minas Gerais no século XVIII?',
 'Inconfidência Mineira',
 'Revolta da Vacina',
 'Guerra de Canudos',
 'Revolta da Chibata',
 'a',
 'A Inconfidência Mineira defendia a independência de Minas Gerais.',
 'medio',
 'Tiradentes participou desse movimento.');


-- =====================================================================
-- 15. GEOGRAFIA - 10 QUESTÕES
-- materia_id = 4
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(4,
 'Qual é o maior continente do planeta em extensão territorial?',
 'África', 'Ásia', 'Europa', 'América do Sul',
 'b',
 'A Ásia é o maior continente.',
 'facil',
 'China e Índia estão nesse continente.'),

(4,
 'Qual é o principal rio da Bacia Amazônica?',
 'Rio São Francisco', 'Rio Paraná', 'Rio Amazonas', 'Rio Tocantins',
 'c',
 'O Rio Amazonas é o principal rio da Bacia Amazônica.',
 'facil',
 'Pense no nome da floresta.'),

(4,
 'O que é urbanização?',
 'Diminuição das cidades',
 'Crescimento da população nas áreas urbanas',
 'Redução das atividades industriais',
 'Aumento das áreas rurais',
 'b',
 'Urbanização envolve crescimento das cidades e população urbana.',
 'facil',
 'Está relacionada às cidades.'),

(4,
 'Qual linha imaginária divide a Terra em Hemisfério Norte e Sul?',
 'Meridiano de Greenwich',
 'Trópico de Câncer',
 'Linha do Equador',
 'Trópico de Capricórnio',
 'c',
 'A Linha do Equador divide os dois hemisférios.',
 'facil',
 'Passa pela região central da Terra.'),

(4,
 'Qual é o clima predominante na Amazônia?',
 'Polar', 'Equatorial', 'Desértico', 'Mediterrâneo',
 'b',
 'O clima equatorial é quente e úmido.',
 'medio',
 'Pense em uma região quente e chuvosa.'),

(4,
 'O que representa a escala de um mapa?',
 'A altitude de uma região',
 'A relação entre distância no mapa e distância real',
 'A quantidade de habitantes',
 'A temperatura',
 'b',
 'A escala relaciona a distância representada com a distância real.',
 'medio',
 'Ela permite calcular distâncias.'),

(4,
 'Qual é o maior país da América do Sul em extensão territorial?',
 'Argentina', 'Brasil', 'Chile', 'Peru',
 'b',
 'O Brasil é o maior país da América do Sul.',
 'facil',
 'Também está entre os maiores países do mundo.'),

(4,
 'O El Niño está relacionado ao aquecimento anormal de águas de qual oceano?',
 'Atlântico', 'Índico', 'Pacífico', 'Ártico',
 'c',
 'O fenômeno está relacionado ao Pacífico Equatorial.',
 'medio',
 'Pense no oceano entre América e Ásia.'),

(4,
 'Uma consequência do desmatamento em grande escala é:',
 'Aumento da biodiversidade',
 'Recomposição das florestas',
 'Perda de biodiversidade',
 'Aumento das áreas preservadas',
 'c',
 'O desmatamento pode destruir habitats e reduzir a biodiversidade.',
 'medio',
 'Pense nos impactos ambientais.'),

(4,
 'Qual é uma fonte de energia renovável?',
 'Carvão mineral', 'Petróleo', 'Gás natural', 'Energia solar',
 'd',
 'A energia solar é uma fonte renovável.',
 'facil',
 'Vem da radiação do Sol.');


-- =====================================================================
-- 16. QUÍMICA - 10 QUESTÕES
-- materia_id = 5
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(5,
 'Qual é a fórmula química da água?',
 'CO2', 'H2O', 'O2', 'NaCl',
 'b',
 'A água é formada por dois átomos de hidrogênio e um de oxigênio.',
 'facil',
 'Hidrogênio + oxigênio.'),

(5,
 'Qual partícula possui carga elétrica negativa?',
 'Próton', 'Nêutron', 'Elétron', 'Núcleo',
 'c',
 'O elétron possui carga negativa.',
 'facil',
 'Fica ao redor do núcleo.'),

(5,
 'Qual é o símbolo químico do oxigênio?',
 'Ox', 'O', 'Og', 'X',
 'b',
 'O símbolo químico do oxigênio é O.',
 'facil',
 'É a primeira letra do nome.'),

(5,
 'O que acontece durante uma transformação química?',
 'Apenas muda o tamanho da substância',
 'São formadas novas substâncias',
 'A substância desaparece',
 'A massa deixa de existir',
 'b',
 'Transformações químicas formam novas substâncias.',
 'medio',
 'Pense em ferrugem e combustão.'),

(5,
 'Qual substância abaixo é uma base?',
 'HCl', 'H2SO4', 'NaOH', 'CO2',
 'c',
 'NaOH é o hidróxido de sódio, uma base.',
 'medio',
 'Observe o grupo OH.'),

(5,
 'Como é chamado o processo em que um líquido passa para o estado gasoso?',
 'Solidificação', 'Condensação', 'Vaporização', 'Fusão',
 'c',
 'Vaporização é a passagem do líquido para o gás.',
 'facil',
 'Acontece quando a água ferve.'),

(5,
 'Qual material é um bom condutor de eletricidade?',
 'Madeira', 'Plástico', 'Borracha', 'Cobre',
 'd',
 'O cobre é um excelente condutor elétrico.',
 'facil',
 'É usado em fios elétricos.'),

(5,
 'O número atômico representa a quantidade de:',
 'Elétrons e nêutrons',
 'Prótons',
 'Moléculas',
 'Camadas eletrônicas',
 'b',
 'O número atômico corresponde ao número de prótons.',
 'medio',
 'Essa quantidade identifica o elemento.'),

(5,
 'Qual gás é produzido em grande quantidade na combustão completa de combustíveis que contêm carbono?',
 'Oxigênio', 'Hidrogênio', 'Dióxido de carbono', 'Nitrogênio',
 'c',
 'A combustão completa produz dióxido de carbono e água.',
 'medio',
 'Está relacionado ao efeito estufa.'),

(5,
 'Qual é o pH aproximado de uma solução neutra?',
 '0', '3', '7', '14',
 'c',
 'Uma solução neutra possui pH aproximadamente 7.',
 'facil',
 'Pense na água pura.');


-- =====================================================================
-- 17. FÍSICA - 10 QUESTÕES
-- materia_id = 6
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(6,
 'Qual é a unidade de força no Sistema Internacional?',
 'Watt', 'Newton', 'Joule', 'Volt',
 'b',
 'A força é medida em Newton (N).',
 'facil',
 'Recebeu o nome de Isaac Newton.'),

(6,
 'Qual é a unidade de velocidade no Sistema Internacional?',
 'Metro por segundo', 'Quilograma', 'Newton', 'Joule',
 'a',
 'A velocidade é medida em metros por segundo (m/s).',
 'facil',
 'Relaciona distância e tempo.'),

(6,
 'O que acontece quando não há força resultante atuando sobre um objeto?',
 'Ele sempre acelera',
 'Ele para imediatamente',
 'Mantém seu estado de movimento ou repouso',
 'Desaparece',
 'c',
 'Pela primeira lei de Newton, o corpo mantém seu estado de movimento ou repouso.',
 'medio',
 'Pense na inércia.'),

(6,
 'Qual energia está relacionada ao movimento de um corpo?',
 'Térmica', 'Cinética', 'Química', 'Nuclear',
 'b',
 'Energia cinética é a energia associada ao movimento.',
 'facil',
 'Está relacionada a corpos em movimento.'),

(6,
 'Qual é aproximadamente a velocidade da luz no vácuo?',
 '300 km/s', '3.000 km/s', '30.000 km/s', '300.000 km/s',
 'd',
 'A luz viaja aproximadamente a 300.000 km/s no vácuo.',
 'medio',
 'É uma velocidade extremamente alta.'),

(6,
 'Qual força atrai os objetos em direção à Terra?',
 'Magnética', 'Elétrica', 'Gravitacional', 'Nuclear',
 'c',
 'A gravidade atrai os corpos em direção à Terra.',
 'facil',
 'É responsável pela queda dos objetos.'),

(6,
 'Qual instrumento mede a temperatura?',
 'Barômetro', 'Termômetro', 'Velocímetro', 'Dinamômetro',
 'b',
 'O termômetro mede a temperatura.',
 'facil',
 'É usado para medir febre.'),

(6,
 'O que é aceleração?',
 'Distância percorrida',
 'Variação da velocidade ao longo do tempo',
 'Massa de um corpo',
 'Força da gravidade',
 'b',
 'A aceleração representa a variação da velocidade no tempo.',
 'medio',
 'Pense em um carro acelerando.'),

(6,
 'Qual fenômeno permite vermos nossa imagem em um espelho?',
 'Refração', 'Reflexão', 'Difração', 'Gravitação',
 'b',
 'A luz é refletida pela superfície do espelho.',
 'facil',
 'Observe o que acontece com a luz.'),

(6,
 'Qual fórmula calcula a velocidade média?',
 'v = d / t', 'v = m × a', 'F = m / a', 'E = m × g',
 'a',
 'Velocidade média é distância dividida pelo tempo.',
 'medio',
 'Relacione distância e tempo.');


-- =====================================================================
-- 18. BIOLOGIA - 10 QUESTÕES
-- materia_id = 7
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(7,
 'Qual é a unidade básica dos seres vivos?',
 'Átomo', 'Célula', 'Tecido', 'Órgão',
 'b',
 'A célula é a unidade básica dos seres vivos.',
 'facil',
 'Todos os seres vivos possuem uma ou mais delas.'),

(7,
 'Qual organela é responsável pela produção de grande parte da energia celular?',
 'Núcleo', 'Ribossomo', 'Mitocôndria', 'Lisossomo',
 'c',
 'A mitocôndria participa da produção de energia celular.',
 'facil',
 'É conhecida como usina de energia da célula.'),

(7,
 'Qual processo permite que as plantas produzam seu próprio alimento?',
 'Respiração', 'Fotossíntese', 'Digestão', 'Fermentação',
 'b',
 'Na fotossíntese, as plantas produzem glicose utilizando luz, água e CO2.',
 'facil',
 'Utiliza a energia do Sol.'),

(7,
 'Qual sistema transporta o sangue pelo corpo?',
 'Digestório', 'Respiratório', 'Circulatório', 'Nervoso',
 'c',
 'O sistema circulatório transporta sangue, nutrientes e gases.',
 'facil',
 'O coração faz parte dele.'),

(7,
 'Qual molécula armazena as informações genéticas?',
 'ATP', 'DNA', 'Água', 'Glicose',
 'b',
 'O DNA contém as informações genéticas.',
 'medio',
 'Está relacionado à hereditariedade.'),

(7,
 'Qual é a principal função dos glóbulos vermelhos?',
 'Combater vírus',
 'Produzir hormônios',
 'Transportar oxigênio',
 'Produzir energia',
 'c',
 'Os glóbulos vermelhos transportam oxigênio por meio da hemoglobina.',
 'medio',
 'Eles fazem parte do sangue.'),

(7,
 'Qual grupo produz seu próprio alimento por meio da fotossíntese?',
 'Animais', 'Fungos', 'Plantas', 'Protozoários',
 'c',
 'As plantas são organismos produtores.',
 'facil',
 'Pense nos seres que possuem clorofila.'),

(7,
 'O que é um ecossistema?',
 'Apenas os animais de uma região',
 'A interação entre seres vivos e o ambiente',
 'Apenas as plantas de uma floresta',
 'Um tipo de célula',
 'b',
 'Um ecossistema envolve seres vivos e fatores não vivos.',
 'medio',
 'Inclui água, solo, ar e seres vivos.'),

(7,
 'Qual órgão bombeia o sangue pelo corpo?',
 'Pulmão', 'Cérebro', 'Coração', 'Fígado',
 'c',
 'O coração bombeia o sangue pelo organismo.',
 'facil',
 'Faz parte do sistema circulatório.'),

(7,
 'Qual é uma função do sistema imunológico?',
 'Produzir alimentos',
 'Defender o organismo contra agentes causadores de doenças',
 'Transportar oxigênio',
 'Realizar a digestão',
 'b',
 'O sistema imunológico ajuda a defender o organismo.',
 'medio',
 'Pense no sistema de defesa do corpo.');


-- =====================================================================
-- 19. INGLÊS - 10 QUESTÕES
-- materia_id = 8
-- =====================================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b,
 alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES

(8,
 'What is the correct translation of "Good morning"?',
 'Boa noite', 'Boa tarde', 'Bom dia', 'Até logo',
 'c',
 'Good morning significa Bom dia.',
 'facil',
 'É usada pela manhã.'),

(8,
 'Choose the correct alternative: "She ___ a student."',
 'are', 'am', 'is', 'be',
 'c',
 'Com She usamos is.',
 'facil',
 'She combina com is.'),

(8,
 'What is the plural form of "child"?',
 'Childs', 'Children', 'Childes', 'Childrens',
 'b',
 'O plural irregular de child é children.',
 'facil',
 'É um plural irregular.'),

(8,
 'What does "book" mean in Portuguese?',
 'Mesa', 'Livro', 'Caneta', 'Caderno',
 'b',
 'Book significa livro.',
 'facil',
 'É algo que você pode ler.'),

(8,
 'Choose the correct sentence:',
 'He are my brother.',
 'He am my brother.',
 'He is my brother.',
 'He be my brother.',
 'c',
 'Com He usamos is.',
 'facil',
 'He combina com is.'),

(8,
 'What is the opposite of "hot"?',
 'Warm', 'Cold', 'Big', 'Fast',
 'b',
 'Hot significa quente e cold significa frio.',
 'facil',
 'Pense no contrário de quente.'),

(8,
 'Which word is a color?',
 'Apple', 'Blue', 'House', 'School',
 'b',
 'Blue significa azul e é uma cor.',
 'facil',
 'É uma cor.'),

(8,
 'Complete the sentence: "I ___ from Brazil."',
 'is', 'are', 'am', 'be',
 'c',
 'Com I usamos am.',
 'facil',
 'I combina com am.'),

(8,
 'What does "I like music" mean?',
 'Eu odeio música.',
 'Eu escuto televisão.',
 'Eu gosto de música.',
 'Eu canto música.',
 'c',
 'I like music significa Eu gosto de música.',
 'medio',
 'Like significa gostar.'),

(8,
 'Choose the correct option: "They ___ playing soccer."',
 'is', 'am', 'are', 'be',
 'c',
 'Com They usamos are.',
 'medio',
 'They combina com are.');


-- =====================================================================
-- 20. VERIFICAÇÃO
-- =====================================================================
-- Execute estas consultas depois do script.
-- Elas devem mostrar exatamente 10 questões por matéria.
-- =====================================================================

SELECT
    m.id,
    m.nome,
    COUNT(q.id) AS quantidade_questoes
FROM materias m
LEFT JOIN questoes q
    ON q.materia_id = m.id
GROUP BY m.id, m.nome
ORDER BY m.id;


-- =====================================================================
-- 21. VERIFICAR TOTAL
-- =====================================================================

SELECT COUNT(*) AS total_questoes
FROM questoes;


-- =====================================================================
-- 22. VERIFICAR MATÉRIAS
-- =====================================================================

SELECT
    id,
    nome,
    slug
FROM materias
ORDER BY id;


-- =====================================================================
-- 23. VERIFICAR CONQUISTAS
-- =====================================================================

SELECT
    id,
    codigo,
    titulo
FROM conquistas
ORDER BY id;