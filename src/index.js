const express = require('express');
const PORT = 3333;

const pool = require('./database/_database');

const app = express();

app.use(express.json());

app.get('/', (req, res) =>{console.log('raiz')});
app.get('/lojas', async (req,res) => {
    try{
      const { rows } = await pool.query('SELECT * FROM lojas');
      return res.status(200).send(rows);
    } catch(err){
      return res.status(400).send(err);
    }
});

app.get('/coleta/:id_loja', async (req, res)=>{
  const { id_loja } = req.params;
  try{
    const dadosIdLoja = await pool.query('SELECT * FROM coletagem WHERE id_loja = ($1)', [id_loja]);
    return res.status(200).send(dadosIdLoja.rows);
  }catch(err){
    return res.status(400).send(err);
  }
});

app.post('/login', async (req, res) => {
  const { storeName } = req.body;
  let name = '';
  try{
    name = await pool.query('SELECT * FROM lojas WHERE nome = ($1)', [storeName]);
    if(!name.rows[0]){
      name = await pool.query('INSERT INTO lojas(nome) VALUES ($1) RETURNING *', [storeName]);
    }
    return res.status(200).send(name.rows);
  }catch(err){
    return res.status(400).send(err);
  }
});

app.post('/coleta/:id', async (req, res) => {
  const {codbar, valor} = req.body;
  const { id } = req.params;
  try{
    const newData = await pool.query('INSERT INTO coletagem (codbar, valor, id_loja) VALUES ($1, $2, $3) RETURNING *', [codbar, valor, id]);
    return res.status(200).send(newData.rows);
  }catch(err){
    return res.status(400).send(err);
  }
});

app.patch('/lojas/:user_id/:loja_id', async (req, res) =>{
  const { user_id, loja_id } = req.params;
  const data = req.body;
  try{
    // const permissaoUsuario = await pool.query('SELECT * FROM usuarios WHERE id = ($1) AND adm = ($2)', [user_id, true]);
    // if(!permissaoUsuario.rows[0]) return res.status(400).send('Usuário sem permissão.');
    const updateLoja = await pool.query('UPDATE lojas SET nome = ($1), endereco = ($2) WHERE id = ($3) RETURNING *', [ data.nome, data.endereco, loja_id ]);
    return res.status(200).send(updateLoja.rows);
  }catch(err){
    return res.status(400).send(err);
  }
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))