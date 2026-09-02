-- =====================================================================
-- HelpStudy - Sistema Inteligente para Auxílio ao Ensino
-- Script de criação do banco de dados
-- =====================================================================

CREATE DATABASE IF NOT EXISTS helpstudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helpstudy;

-- Tabela: usuarios

CREATE TABLE IF NOT EXISTS usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(120) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
senha VARCHAR(255) NOT NULL,
serie VARCHAR(50) DEFAULT NULL,
avatar VARCHAR(255) DEFAULT NULL,
criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela: materias

CREATE TABLE IF NOT EXISTS materias (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(80) NOT NULL,
slug VARCHAR(80) NOT NULL UNIQUE,
descricao VARCHAR(255) DEFAULT NULL,
icone VARCHAR(60) DEFAULT 'fa-book',
cor VARCHAR(20) DEFAULT '#8B5CF6'
) ENGINE=InnoDB;

-- Tabela: questoes

CREATE TABLE IF NOT EXISTS questoes (
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
FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela: respostas

CREATE TABLE IF NOT EXISTS respostas (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
questao_id INT NOT NULL,
alternativa_marcada ENUM('a','b','c','d') NOT NULL,
correta TINYINT(1) NOT NULL,
tempo_gasto INT DEFAULT 0 COMMENT 'tempo em segundos',
respondido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela: progresso

CREATE TABLE IF NOT EXISTS progresso (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
materia_id INT NOT NULL,
questoes_respondidas INT DEFAULT 0,
questoes_corretas INT DEFAULT 0,
percentual_acerto DECIMAL(5,2) DEFAULT 0.00,
nivel_dificuldade ENUM('facil','medio','dificil') DEFAULT 'facil',
atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
UNIQUE KEY uk_usuario_materia (usuario_id, materia_id),
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela: plano_estudos

CREATE TABLE IF NOT EXISTS plano_estudos (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
materia_id INT NOT NULL,
motivo VARCHAR(255) DEFAULT NULL COMMENT 'razão pela qual foi recomendado',
prioridade ENUM('baixa','media','alta') DEFAULT 'media',
concluido TINYINT(1) DEFAULT 0,
criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela: conquistas

CREATE TABLE IF NOT EXISTS conquistas (
id INT AUTO_INCREMENT PRIMARY KEY,
codigo VARCHAR(60) NOT NULL UNIQUE,
titulo VARCHAR(120) NOT NULL,
descricao VARCHAR(255) NOT NULL,
icone VARCHAR(60) DEFAULT 'fa-star'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario_conquistas (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
conquista_id INT NOT NULL,
obtido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
UNIQUE KEY uk_usuario_conquista (usuario_id, conquista_id),
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
FOREIGN KEY (conquista_id) REFERENCES conquistas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- DADOS INICIAIS (SEED)
-- =====================================================================

INSERT INTO materias (nome, slug, descricao, icone, cor) VALUES
('Matemática', 'matematica', 'Números, operações, geometria e lógica', 'fa-square-root-variable', '#4A6CF7'),
('Português', 'portugues', 'Interpretação de texto, gramática e redação', 'fa-language', '#9B59B6'),
('História', 'historia', 'Fatos históricos e formação da sociedade', 'fa-landmark', '#F39C12'),
('Geografia', 'geografia', 'Espaço geográfico, clima e cartografia', 'fa-earth-americas', '#16A085'),
('Ciências', 'ciencias', 'Biologia, química e física do cotidiano', 'fa-flask', '#27AE60'),
('Inglês', 'ingles', 'Vocabulário, gramática e compreensão em inglês', 'fa-comments', '#E91E8C');

INSERT INTO conquistas (codigo, titulo, descricao, icone) VALUES
('primeira_questao', 'Primeiro Passo', 'Respondeu sua primeira questão', 'fa-shoe-prints'),
('dez_acertos', 'Em Chamas', 'Acertou 10 questões seguidas', 'fa-fire'),
('materia_completa', 'Dedicação Total', 'Completou todas as questões de uma matéria', 'fa-trophy'),
('semana_ativa', 'Constância', 'Estudou 7 dias seguidos', 'fa-calendar-check');

USE helpstudy;

-- =========================================================
-- MATEMÁTICA - 10 QUESTÕES
-- materia_id = 1
-- =========================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES
(1, 'Qual é o resultado de 12 + 8 × 2?', '40', '28', '22', '32', 'b', 'Pela ordem das operações, a multiplicação é feita antes da soma: 8 × 2 = 16, depois 12 + 16 = 28.', 'facil', 'Lembre-se: multiplicação antes de soma!'),

(1, 'Se um retângulo tem base 6 cm e altura 4 cm, qual é sua área?', '10 cm²', '20 cm²', '24 cm²', '18 cm²', 'c', 'A área do retângulo é base × altura: 6 × 4 = 24 cm².', 'facil', 'Área do retângulo = base vezes altura.'),

(1, 'Qual fração representa 0,25?', '1/2', '1/4', '1/5', '2/5', 'b', '0,25 equivale a 25/100, que simplificado é 1/4.', 'medio', 'Pense em quantas partes formam um inteiro.'),

(1, 'Qual é o resultado de 3² + 4²?', '12', '20', '25', '49', 'c', '3² = 9 e 4² = 16. Somando 9 + 16, obtemos 25.', 'facil', 'Calcule primeiro as potências.'),

(1, 'Se x + 8 = 20, qual é o valor de x?', '10', '12', '14', '16', 'b', 'Subtraindo 8 dos dois lados da equação: x = 20 - 8 = 12.', 'facil', 'Use a operação inversa da adição.'),

(1, 'Qual fração é equivalente a 1/2?', '2/3', '2/4', '3/5', '4/5', 'b', 'Multiplicando o numerador e o denominador de 1/2 por 2, obtemos 2/4.', 'facil', 'Multiplique o numerador e o denominador pelo mesmo número.'),

(1, 'Um produto custa R$ 80,00 e recebeu um desconto de 10%. Qual será seu preço final?', 'R$ 70,00', 'R$ 72,00', 'R$ 75,00', 'R$ 78,00', 'b', '10% de R$ 80,00 é R$ 8,00. Então R$ 80,00 - R$ 8,00 = R$ 72,00.', 'medio', 'Calcule primeiro 10% de 80.'),

(1, 'Qual é o perímetro de um quadrado com lado de 5 cm?', '10 cm', '15 cm', '20 cm', '25 cm', 'c', 'Um quadrado possui quatro lados iguais. Portanto, 4 × 5 = 20 cm.', 'facil', 'Multiplique o lado por 4.'),

(1, 'Se uma função é dada por f(x) = 2x + 3, qual é o valor de f(4)?', '7', '8', '11', '12', 'c', 'Substituindo x por 4: f(4) = 2 × 4 + 3 = 11.', 'medio', 'Substitua o x pelo número indicado.'),

(1, 'Um carro percorre 240 km em 4 horas. Qual é sua velocidade média?', '40 km/h', '50 km/h', '60 km/h', '80 km/h', 'c', 'A velocidade média é calculada dividindo a distância pelo tempo: 240 ÷ 4 = 60 km/h.', 'medio', 'Use velocidade = distância ÷ tempo.');


-- =========================================================
-- PORTUGUÊS - 10 QUESTÕES
-- materia_id = 2
-- =========================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES
(2, 'Assinale a alternativa em que a palavra está corretamente acentuada:', 'Ánálise', 'Análise', 'Analíse', 'Analise-', 'b', 'A palavra análise é proparoxítona e todas as proparoxítonas são acentuadas.', 'facil', 'Conte as sílabas a partir do final.'),

(2, 'Em "O menino, que estava cansado, foi dormir cedo", a oração destacada é:', 'Oração principal', 'Oração subordinada adjetiva', 'Oração coordenada', 'Oração subordinada substantiva', 'b', 'A oração "que estava cansado" caracteriza o substantivo menino, funcionando como uma oração subordinada adjetiva.', 'medio', 'Ela dá uma característica ao substantivo anterior.'),

(2, 'Qual é o sinônimo de "feliz"?', 'Triste', 'Contente', 'Bravo', 'Cansado', 'b', 'Contente possui significado semelhante a feliz, sendo um sinônimo.', 'facil', 'Procure uma palavra com significado semelhante.'),

(2, 'Qual é o antônimo de "rápido"?', 'Veloz', 'Ligeiro', 'Devagar', 'Ágil', 'c', 'Devagar apresenta sentido contrário ao termo rápido.', 'facil', 'Antônimo é uma palavra de sentido contrário.'),

(2, 'Na frase "Maria comprou um livro", qual é o sujeito?', 'Comprou', 'Um livro', 'Maria', 'Livro', 'c', 'Maria é quem realiza a ação de comprar, sendo o sujeito da oração.', 'facil', 'Pergunte: quem realizou a ação?'),

(2, 'Qual alternativa apresenta um substantivo?', 'Correr', 'Bonito', 'Casa', 'Rapidamente', 'c', 'Casa é um substantivo porque nomeia um ser, objeto ou elemento.', 'facil', 'Substantivos nomeiam seres, objetos, lugares e ideias.'),

(2, 'Em "O aluno estudou bastante", qual é o verbo da oração?', 'Aluno', 'Estudou', 'Bastante', 'O', 'b', 'Estudou é o verbo porque indica a ação realizada pelo aluno.', 'facil', 'Procure a palavra que indica uma ação ou estado.'),

(2, 'Qual alternativa apresenta uma oração no futuro?', 'Eu estudei ontem.', 'Eu estudo todos os dias.', 'Eu estudarei amanhã.', 'Eu estudava ontem.', 'c', 'A palavra estudarei indica uma ação que acontecerá no futuro.', 'medio', 'Observe o momento em que a ação acontece.'),

(2, 'Na frase "A menina é muito inteligente", qual palavra é um adjetivo?', 'Menina', 'É', 'Muito', 'Inteligente', 'd', 'Inteligente é um adjetivo porque caracteriza o substantivo menina.', 'facil', 'Adjetivos caracterizam os substantivos.'),

(2, 'Na frase "Pedro e João estudaram para a prova", o sujeito é:', 'Simples', 'Composto', 'Oculto', 'Indeterminado', 'b', 'O sujeito é composto porque possui dois núcleos: Pedro e João.', 'medio', 'Observe quantas pessoas realizam a ação.');


-- =========================================================
-- HISTÓRIA - 10 QUESTÕES
-- materia_id = 3
-- =========================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES
(3, 'Em que ano ocorreu a chegada dos portugueses ao território que hoje corresponde ao Brasil?', '1492', '1500', '1530', '1822', 'b', 'A chegada da frota portuguesa liderada por Pedro Álvares Cabral ocorreu em 1500.', 'facil', 'É o ano tradicionalmente associado à chegada de Cabral.'),

(3, 'Quem proclamou a Independência do Brasil em 1822?', 'Dom Pedro I', 'Dom Pedro II', 'Tiradentes', 'Getúlio Vargas', 'a', 'Dom Pedro I declarou a Independência do Brasil em 7 de setembro de 1822.', 'facil', 'Ele está diretamente relacionado ao Dia da Independência.'),

(3, 'Qual civilização construiu as pirâmides de Gizé?', 'Romanos', 'Gregos', 'Egípcios', 'Maias', 'c', 'As pirâmides de Gizé foram construídas no Egito Antigo.', 'facil', 'Pense na civilização que se desenvolveu às margens do Rio Nilo.'),

(3, 'Qual foi um dos principais produtos explorados pelos portugueses no início da colonização do Brasil?', 'Café', 'Pau-brasil', 'Borracha', 'Soja', 'b', 'O pau-brasil foi um dos primeiros produtos explorados pelos portugueses no território brasileiro.', 'facil', 'Seu nome está relacionado a uma árvore encontrada no litoral brasileiro.'),

(3, 'A Revolução Industrial teve início principalmente em qual país?', 'França', 'Portugal', 'Inglaterra', 'Brasil', 'c', 'A Revolução Industrial teve início na Inglaterra durante o século XVIII.', 'medio', 'Pense no país onde surgiram as primeiras grandes fábricas.'),

(3, 'Qual foi uma das características marcantes da economia colonial brasileira?', 'Produção voltada principalmente para o mercado externo', 'Produção exclusivamente para consumo local', 'Ausência de agricultura', 'Predomínio da indústria automobilística', 'a', 'A economia colonial esteve fortemente ligada à produção de gêneros destinados ao mercado externo.', 'medio', 'Pense na relação entre a colônia e Portugal.'),

(3, 'Quem foi Getúlio Vargas?', 'Um imperador brasileiro', 'Um presidente brasileiro', 'Um navegador português', 'Um líder indígena', 'b', 'Getúlio Vargas foi uma importante figura política brasileira e governou o país em diferentes períodos.', 'facil', 'Ele governou o Brasil durante o Estado Novo.'),

(3, 'Qual acontecimento marcou o fim da monarquia e o início da República no Brasil?', 'Independência do Brasil', 'Proclamação da República', 'Revolução Industrial', 'Guerra do Paraguai', 'b', 'A Proclamação da República ocorreu em 15 de novembro de 1889 e encerrou o período monárquico.', 'facil', 'Aconteceu em 1889.'),

(3, 'A Guerra Fria foi uma disputa principalmente entre quais duas potências?', 'Brasil e Argentina', 'Estados Unidos e União Soviética', 'França e Inglaterra', 'China e Japão', 'b', 'A Guerra Fria foi marcada pela rivalidade política, econômica e ideológica entre Estados Unidos e União Soviética.', 'medio', 'Pense na disputa entre capitalismo e socialismo.'),

(3, 'Qual movimento brasileiro ficou conhecido pela revolta contra a cobrança da derrama e pelo desejo de independência de Minas Gerais?', 'Inconfidência Mineira', 'Revolta da Vacina', 'Guerra de Canudos', 'Revolta da Chibata', 'a', 'A Inconfidência Mineira ocorreu no final do século XVIII e defendia a independência de Minas Gerais.', 'medio', 'Tiradentes é uma das figuras mais conhecidas desse movimento.');


-- =========================================================
-- GEOGRAFIA - 10 QUESTÕES
-- materia_id = 4
-- =========================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES
(4, 'Qual é o maior continente do planeta em extensão territorial?', 'África', 'Ásia', 'Europa', 'América do Sul', 'b', 'A Ásia é o maior continente do planeta em extensão territorial.', 'facil', 'Pense no continente que possui países como China e Índia.'),

(4, 'Qual é o principal rio da Bacia Amazônica?', 'Rio São Francisco', 'Rio Paraná', 'Rio Amazonas', 'Rio Tocantins', 'c', 'O Rio Amazonas é o principal rio da Bacia Amazônica.', 'facil', 'Pense no nome da maior floresta tropical do mundo.'),

(4, 'O que é o processo de urbanização?', 'A diminuição das cidades', 'O crescimento da população nas áreas urbanas', 'A redução das atividades industriais', 'O aumento das áreas rurais', 'b', 'Urbanização é o processo de crescimento das cidades e aumento da população que vive em áreas urbanas.', 'facil', 'Urbanização está relacionada ao crescimento das cidades.'),

(4, 'Qual linha imaginária divide a Terra em Hemisfério Norte e Hemisfério Sul?', 'Meridiano de Greenwich', 'Trópico de Câncer', 'Linha do Equador', 'Trópico de Capricórnio', 'c', 'A Linha do Equador divide a Terra em Hemisfério Norte e Hemisfério Sul.', 'facil', 'Ela passa pela região central do planeta.'),

(4, 'Qual é o clima predominante na maior parte da região Amazônica?', 'Polar', 'Equatorial', 'Desértico', 'Mediterrâneo', 'b', 'O clima equatorial é predominante na Amazônia, caracterizado por temperaturas elevadas e grande quantidade de chuvas.', 'medio', 'Pense em uma região quente e muito úmida.'),

(4, 'O que representa uma escala em um mapa?', 'A altitude de uma região', 'A relação entre a distância no mapa e a distância real', 'A quantidade de habitantes de uma cidade', 'A temperatura de uma região', 'b', 'A escala indica a relação proporcional entre uma distância representada no mapa e sua distância real.', 'medio', 'Ela permite calcular distâncias reais usando o mapa.'),

(4, 'Qual é o país com maior extensão territorial da América do Sul?', 'Argentina', 'Brasil', 'Chile', 'Peru', 'b', 'O Brasil é o maior país da América do Sul em extensão territorial.', 'facil', 'É também um dos maiores países do mundo.'),

(4, 'O fenômeno El Niño está relacionado principalmente ao aquecimento anormal das águas de qual oceano?', 'Oceano Atlântico', 'Oceano Índico', 'Oceano Pacífico', 'Oceano Ártico', 'c', 'O El Niño está associado ao aquecimento anormal das águas superficiais do Oceano Pacífico Equatorial.', 'medio', 'Pense no oceano localizado entre a América e a Ásia.'),

(4, 'Qual é uma das principais consequências do desmatamento em grande escala?', 'Aumento da biodiversidade', 'Recomposição das florestas', 'Perda de biodiversidade e desequilíbrio ambiental', 'Aumento das áreas de preservação', 'c', 'O desmatamento pode causar perda de habitats, redução da biodiversidade e desequilíbrios ambientais.', 'medio', 'Pense nos impactos causados pela retirada da vegetação.'),

(4, 'Qual dos elementos abaixo é considerado uma fonte de energia renovável?', 'Carvão mineral', 'Petróleo', 'Gás natural', 'Energia solar', 'd', 'A energia solar é renovável porque utiliza a radiação do Sol, uma fonte naturalmente disponível.', 'facil', 'Pense em uma fonte de energia que não depende de combustíveis fósseis.');


-- =========================================================
-- CIÊNCIAS - 10 QUESTÕES
-- materia_id = 5
-- =========================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES
(5, 'Qual é o principal gás responsável pelo efeito estufa?', 'Oxigênio', 'Gás carbônico (CO₂)', 'Nitrogênio', 'Hidrogênio', 'b', 'O CO₂ é um dos principais gases de efeito estufa emitidos pelas atividades humanas.', 'facil', 'Pense no gás liberado pela queima de combustíveis.'),

(5, 'Qual órgão é responsável por bombear o sangue pelo corpo humano?', 'Pulmão', 'Coração', 'Fígado', 'Rim', 'b', 'O coração é responsável por bombear o sangue para diferentes partes do organismo.', 'facil', 'É um órgão muscular que bate continuamente.'),

(5, 'Qual é o gás utilizado pelas plantas durante a fotossíntese?', 'Oxigênio', 'Nitrogênio', 'Gás carbônico', 'Hidrogênio', 'c', 'Durante a fotossíntese, as plantas utilizam gás carbônico, água e luz para produzir glicose e liberar oxigênio.', 'facil', 'É o gás retirado do ambiente durante a fotossíntese.'),

(5, 'Qual é a unidade básica que forma os seres vivos?', 'Tecido', 'Órgão', 'Célula', 'Sistema', 'c', 'A célula é considerada a unidade estrutural e funcional básica dos seres vivos.', 'facil', 'Todos os seres vivos são formados por uma ou mais delas.'),

(5, 'Qual planeta é conhecido como Planeta Vermelho?', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'b', 'Marte é conhecido como Planeta Vermelho devido à presença de óxidos de ferro em sua superfície.', 'facil', 'É o quarto planeta a partir do Sol.'),

(5, 'Qual sistema do corpo humano é responsável pela troca de gases entre o organismo e o ambiente?', 'Sistema digestório', 'Sistema nervoso', 'Sistema respiratório', 'Sistema circulatório', 'c', 'O sistema respiratório permite a entrada de oxigênio e a eliminação de gás carbônico.', 'facil', 'Ele possui órgãos como os pulmões.'),

(5, 'O que acontece com a água quando ela passa do estado líquido para o gasoso?', 'Fusão', 'Solidificação', 'Evaporação', 'Condensação', 'c', 'A evaporação é a mudança do estado líquido para o estado gasoso.', 'facil', 'É o que acontece quando a água recebe calor e vira vapor.'),

(5, 'Qual é a principal função dos glóbulos vermelhos?', 'Combater infecções', 'Transportar oxigênio', 'Produzir hormônios', 'Realizar a digestão', 'b', 'Os glóbulos vermelhos transportam oxigênio dos pulmões para os tecidos do corpo.', 'medio', 'Eles estão relacionados ao transporte de oxigênio pelo sangue.'),

(5, 'Qual força é responsável por atrair os corpos em direção ao centro da Terra?', 'Força elétrica', 'Força magnética', 'Gravidade', 'Força de atrito', 'c', 'A gravidade é a força de atração exercida pela Terra sobre os corpos.', 'facil', 'É a força que faz os objetos caírem.'),

(5, 'Qual é a principal fonte de energia para a maioria dos processos que ocorrem na Terra?', 'Lua', 'Sol', 'Vento', 'Oceanos', 'b', 'O Sol fornece energia essencial para processos como a fotossíntese e influencia o clima e o ciclo da água.', 'facil', 'Pense na estrela que ilumina e aquece nosso planeta.');


-- =========================================================
-- INGLÊS - 10 QUESTÕES
-- materia_id = 6
-- =========================================================

INSERT INTO questoes
(materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica)
VALUES
(6, 'What is the correct translation of ''Good morning''?', 'Boa noite', 'Boa tarde', 'Bom dia', 'Até logo', 'c', 'Good morning significa Bom dia em português.', 'facil', 'É uma saudação usada pela manhã.'),

(6, 'Choose the correct alternative: ''She ___ a student.''', 'are', 'am', 'is', 'be', 'c', 'Com o pronome She, usamos o verbo to be na forma is.', 'facil', 'She combina com is.'),

(6, 'What is the plural form of ''child''?', 'Childs', 'Children', 'Childes', 'Childrens', 'b', 'O plural irregular de child é children.', 'facil', 'É um plural irregular.'),

(6, 'What does ''book'' mean in Portuguese?', 'Mesa', 'Livro', 'Caneta', 'Caderno', 'b', 'A palavra book significa livro em português.', 'facil', 'É algo que você pode ler.'),

(6, 'Choose the correct sentence:', 'He are my brother.', 'He am my brother.', 'He is my brother.', 'He be my brother.', 'c', 'A forma correta do verbo to be com He é is.', 'facil', 'He usa is.'),

(6, 'What is the opposite of ''hot''?', 'Warm', 'Cold', 'Big', 'Fast', 'b', 'Hot significa quente e cold significa frio.', 'facil', 'Pense no contrário de quente.'),

(6, 'Which word is a color?', 'Apple', 'Blue', 'House', 'School', 'b', 'Blue significa azul e é uma cor.', 'facil', 'É uma cor.'),

(6, 'Complete the sentence: ''I ___ from Brazil.''', 'is', 'are', 'am', 'be', 'c', 'Com o pronome I, a forma correta do verbo to be é am.', 'facil', 'I combina com am.'),

(6, 'What does ''I like music'' mean?', 'Eu odeio música.', 'Eu escuto televisão.', 'Eu gosto de música.', 'Eu canto música.', 'c', 'I like music significa Eu gosto de música.', 'medio', 'Like significa gostar.'),

(6, 'Choose the correct option: ''They ___ playing soccer.''', 'is', 'am', 'are', 'be', 'c', 'Com They usamos are. A frase significa Eles estão jogando futebol.', 'medio', 'They combina com are.');
