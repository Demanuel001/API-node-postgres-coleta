const { Pool } = require('pg');

const pool = new Pool({
    user: "root",//process.env.PG_USER,
    host: "localhost",//process.env.PG_URL,
    database: "coletor",//process.env.PG_DB,
    password: "100senha",//process.env.PG_PASS,
    port: process.env.PG_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err.stack)
  }
  console.log('Conexão com o banco de dados estabelecida com sucesso!')
  release()
})

module.exports = pool;