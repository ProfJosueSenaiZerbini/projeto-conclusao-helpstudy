// =====================================================================
// Migrações do banco de dados
// Roda toda vez que o servidor sobe. Só ADICIONA o que estiver faltando
// (tabelas, colunas e conquistas novas). Nunca apaga tabelas nem dados,
// então pode rodar quantas vezes quiser sem perder nada.
// =====================================================================
const db = require('./db');
const { FLASHCARDS, GLOSSARIO } = require('../database/conteudosIniciais');

// Colunas novas em tabelas que já existiam
const COLUNAS = [
    { tabela: 'usuarios', coluna: 'apelido', definicao: 'VARCHAR(40) DEFAULT NULL' },
    { tabela: 'usuarios', coluna: 'meta_diaria', definicao: 'INT NOT NULL DEFAULT 10' },
    { tabela: 'usuarios', coluna: 'ranking_publico', definicao: 'TINYINT(1) NOT NULL DEFAULT 1' },
    { tabela: 'plano_estudos', coluna: 'lote', definicao: 'INT NOT NULL DEFAULT 0' }
];

// Tabelas novas
const TABELAS = [
    // Pontos de experiência. A chave única (usuario, origem, referencia)
    // garante que o mesmo ponto nunca seja dado duas vezes.
    `CREATE TABLE IF NOT EXISTS xp_eventos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        origem VARCHAR(20) NOT NULL,
        referencia VARCHAR(80) NOT NULL,
        pontos INT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_xp_evento (usuario_id, origem, referencia),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Simulados do ENEM
    `CREATE TABLE IF NOT EXISTS simulados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        ano SMALLINT NOT NULL,
        area VARCHAR(40) DEFAULT NULL,
        idioma VARCHAR(20) NOT NULL DEFAULT '',
        questoes TEXT NOT NULL,
        respostas TEXT,
        total_questoes INT NOT NULL,
        duracao_segundos INT NOT NULL,
        iniciado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        finalizado_em DATETIME DEFAULT NULL,
        acertos INT NOT NULL DEFAULT 0,
        nota DECIMAL(4,2) DEFAULT NULL,
        tempo_gasto INT NOT NULL DEFAULT 0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Respostas das questões do ENEM (antes ficavam só no navegador)
    `CREATE TABLE IF NOT EXISTS respostas_enem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        simulado_id INT DEFAULT NULL,
        ano SMALLINT NOT NULL,
        numero SMALLINT NOT NULL,
        idioma VARCHAR(20) NOT NULL DEFAULT '',
        area VARCHAR(40) DEFAULT NULL,
        alternativa_marcada CHAR(1) DEFAULT NULL,
        correta TINYINT(1) NOT NULL DEFAULT 0,
        revelada TINYINT(1) NOT NULL DEFAULT 0,
        arquivada TINYINT(1) NOT NULL DEFAULT 0,
        tempo_gasto INT NOT NULL DEFAULT 0,
        respondido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_simulado_questao (simulado_id, numero, idioma),
        KEY idx_enem_usuario (usuario_id, ano, numero),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Sessões do modo foco (Pomodoro)
    `CREATE TABLE IF NOT EXISTS sessoes_foco (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        iniciado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        concluido_em DATETIME DEFAULT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Códigos de recuperação de senha ("Esqueci a senha")
    `CREATE TABLE IF NOT EXISTS recuperacao_senha (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        codigo_hash VARCHAR(255) NOT NULL,
        expira_em DATETIME NOT NULL,
        usado TINYINT(1) NOT NULL DEFAULT 0,
        tentativas INT NOT NULL DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Flashcards (cartões de pergunta e resposta) e o que cada aluno já sabe
    `CREATE TABLE IF NOT EXISTS flashcards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        materia_id INT NOT NULL,
        frente VARCHAR(255) NOT NULL,
        verso TEXT NOT NULL,
        FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS flashcards_progresso (
        usuario_id INT NOT NULL,
        flashcard_id INT NOT NULL,
        status ENUM('sei', 'revisar') NOT NULL,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, flashcard_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Glossário (termos difíceis de cada matéria)
    `CREATE TABLE IF NOT EXISTS glossario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        materia_id INT NOT NULL,
        termo VARCHAR(100) NOT NULL,
        definicao TEXT NOT NULL,
        exemplo VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    // Redações escritas pelos alunos
    `CREATE TABLE IF NOT EXISTS redacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        tema VARCHAR(255) NOT NULL,
        texto TEXT NOT NULL,
        checklist VARCHAR(10) NOT NULL DEFAULT '',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`
];

// Conquistas novas (as 4 antigas continuam iguais)
const CONQUISTAS = [
    ['maratonista', 'Maratonista', 'Respondeu 50 questões em um único dia', 'fa-person-running'],
    ['coruja', 'Coruja', 'Estudou depois das 22h', 'fa-moon'],
    ['enem_20', 'Rumo ao ENEM', 'Respondeu 20 questões do ENEM', 'fa-file-pen'],
    ['primeiro_simulado', 'Primeiro Simulado', 'Finalizou um simulado do ENEM', 'fa-stopwatch'],
    ['meta_batida', 'Meta Batida', 'Cumpriu a meta diária de questões', 'fa-bullseye'],
    ['foco_total', 'Foco Total', 'Completou uma sessão de 25 minutos no modo foco', 'fa-hourglass-half'],
    ['nivel_5', 'Estudante Dedicado', 'Chegou ao nível 5', 'fa-ranking-star']
];

async function colunaExiste(tabela, coluna) {
    const [rows] = await db.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tabela, coluna]
    );
    return rows.length > 0;
}

// Coloca os flashcards e o glossário do arquivo database/conteudosIniciais.js no banco.
// Só insere o que ainda não existe, então dá para adicionar cartões novos no arquivo
// a qualquer momento sem duplicar os antigos.
async function inserirConteudosIniciais() {
    const [flashExistentes] = await db.query(
        'SELECT m.slug, f.frente FROM flashcards f JOIN materias m ON m.id = f.materia_id'
    );
    const jaTemFlash = new Set(flashExistentes.map((f) => `${f.slug}|${f.frente}`));
    for (const [slug, frente, verso] of FLASHCARDS) {
        if (jaTemFlash.has(`${slug}|${frente}`)) continue;
        await db.query(
            'INSERT INTO flashcards (materia_id, frente, verso) SELECT id, ?, ? FROM materias WHERE slug = ?',
            [frente, verso, slug]
        );
    }

    const [glosExistentes] = await db.query(
        'SELECT m.slug, g.termo FROM glossario g JOIN materias m ON m.id = g.materia_id'
    );
    const jaTemTermo = new Set(glosExistentes.map((g) => `${g.slug}|${g.termo}`));
    for (const [slug, termo, definicao, exemplo] of GLOSSARIO) {
        if (jaTemTermo.has(`${slug}|${termo}`)) continue;
        await db.query(
            'INSERT INTO glossario (materia_id, termo, definicao, exemplo) SELECT id, ?, ?, ? FROM materias WHERE slug = ?',
            [termo, definicao, exemplo, slug]
        );
    }
}

async function executarMigracoes() {
    for (const { tabela, coluna, definicao } of COLUNAS) {
        if (!(await colunaExiste(tabela, coluna))) {
            await db.query(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`);
        }
    }

    for (const sql of TABELAS) {
        await db.query(sql);
    }

    for (const conquista of CONQUISTAS) {
        await db.query('INSERT IGNORE INTO conquistas (codigo, titulo, descricao, icone) VALUES (?, ?, ?, ?)', conquista);
    }

    await inserirConteudosIniciais();
}

module.exports = executarMigracoes;
