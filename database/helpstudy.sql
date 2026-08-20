-- =====================================================================
-- HelpStudy - Sistema Inteligente para Auxílio ao Ensino
-- Script de criação do banco de dados
-- =====================================================================

CREATE DATABASE IF NOT EXISTS helpstudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helpstudy;

-- ---------------------------------------------------------------------
-- Tabela: usuarios
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Tabela: materias
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(255) DEFAULT NULL,
    icone VARCHAR(60) DEFAULT 'fa-book',
    cor VARCHAR(20) DEFAULT '#8B5CF6'
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: questoes
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Tabela: respostas
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Tabela: progresso
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Tabela: plano_estudos
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Tabela: conquistas
-- ---------------------------------------------------------------------
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

-- Questões de exemplo (Matemática)
INSERT INTO questoes (materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica) VALUES
(1, 'Qual é o resultado de 12 + 8 × 2?', '40', '28', '22', '32', 'b', 'Pela ordem das operações, a multiplicação é feita antes da soma: 8×2=16, depois 12+16=28.', 'facil', 'Lembre-se: multiplicação antes de soma!'),
(1, 'Se um retângulo tem base 6 cm e altura 4 cm, qual é sua área?', '10 cm²', '20 cm²', '24 cm²', '18 cm²', 'c', 'A área do retângulo é base × altura: 6 × 4 = 24 cm².', 'facil', 'Área do retângulo = base vezes altura.'),
(1, 'Qual fração representa 0,25?', '1/2', '1/4', '1/5', '2/5', 'b', '0,25 equivale a 25/100, que simplificado é 1/4.', 'medio', 'Pense em quantas partes formam um inteiro.');

-- Questões de exemplo (Português)
INSERT INTO questoes (materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica) VALUES
(2, 'Assinale a alternativa em que a palavra está corretamente acentuada:', 'Ánálise', 'Análise', 'Analíse', 'Analise-', 'b', 'A palavra "análise" é proparoxítona e todas as proparoxítonas são acentuadas.', 'facil', 'Conte as sílabas a partir do final.'),
(2, 'Em "O menino, que estava cansado, foi dormir cedo", a oração destacada é:', 'Oração principal', 'Oração subordinada adjetiva', 'Oração coordenada', 'Oração subordinada substantiva', 'b', 'A oração "que estava cansado" descreve o substantivo "menino", funcionando como adjetivo.', 'medio', 'Ela dá uma característica ao substantivo anterior.');

-- Questões de exemplo (Ciências)
INSERT INTO questoes (materia_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, explicacao, nivel, dica) VALUES
(5, 'Qual é o principal gás responsável pelo efeito estufa?', 'Oxigênio', 'Gás carbônico (CO₂)', 'Nitrogênio', 'Hidrogênio', 'b', 'O CO₂ é o principal gás de efeito estufa emitido por atividades humanas.', 'facil', 'Pense no gás que expiramos e que é liberado por veículos.');
