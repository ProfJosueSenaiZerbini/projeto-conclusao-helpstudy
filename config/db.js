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
    database: process.env.DB_NAME || 'helpstudy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

// Testa a conexão assim que o servidor sobe
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado ao banco de dados MySQL (helpstudy)');
        connection.release();
    } catch (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        console.error('   Verifique se o MySQL está rodando e se o arquivo .env está correto.');
    }
})();

module.exports = pool;
