// =====================================================================
// Configuração da conexão com o banco de dados MySQL
// =====================================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'TestHelpStudy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

// Testa a conexão assim que o servidor sobe
(async () => {
    try {
        const connection = await pool.getConnection();
        connection.release();
    } catch (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.code || '', err.message || '');

        // Explica o erro mais comum de cada código
        if (err.code === 'ECONNREFUSED') {
            console.error('   O MySQL não está rodando. Inicie o serviço do MySQL (XAMPP, Workbench ou "services.msc") e tente de novo.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   Usuário ou senha do MySQL incorretos. Confira DB_USER e DB_PASSWORD no arquivo .env.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`   O banco "${process.env.DB_NAME}" não existe. Rode o script database/helpstudy.sql no MySQL.`);
        } else {
            console.error('   Verifique se o MySQL está rodando e se o arquivo .env está correto.');
        }
    }
})();

module.exports = pool;
