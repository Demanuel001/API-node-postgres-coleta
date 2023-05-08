const express = require('express');
const PORT = 3333;
const cors = require('cors');
const pool = require('./config/database/_database').default;
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) =>{console.log('raiz')});
app.get('/concorrente', async (req,res) => {
  try{
    const { rows } = await pool.query('SELECT * FROM concorrente');
    return res.status(200).send(rows);
  } catch(err){
    return res.status(400).send(err);
  }
});

app.get('/listar/:id_loja', async (req, res)=>{
  const { id_loja } = req.params;
  try{
    const dadosIdLoja = await pool.query('SELECT * FROM coleta WHERE id_loja = ($1)', [id_loja]);
    return res.status(200).send(dadosIdLoja.rows);
  }catch(err){
    return res.status(400).send(err);
  }
});

app.post('/login', async (req, res) => {
  const { storeName, endereco } = req.body;
  let name = '';
  try{
    name = await pool.query('SELECT * FROM concorrente WHERE nome = ($1)', [storeName]);
    if(!name.rows[0]){
      name = await pool.query('INSERT INTO concorrente(nome, endereco) VALUES ($1, $2) RETURNING *', [storeName, endereco]);
    }
    return res.status(200).send(name.rows);
  }catch(err){
    return res.status(400).send(err);
  }
});

app.post('/coleta', async (req, res) => {
  const coletas = req.body;
  console.log('aqui')
  try {
    const insertPromises = coletas.map(async (coleta) => {
      const { codbar, price, idloja } = coleta;
      console.log(`${codbar} ${price} ${idloja}`)
      const newData = await pool.query('INSERT INTO coleta (codbar, valor, id_loja) VALUES ($1, $2, $3) RETURNING *', [codbar, price, idloja]);
      console.log(newData.rows)
      return newData.rows;
    });

    const results = await Promise.all(insertPromises); // espera todas as inserções serem concluídas

    return res.status(200).json(results);
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.post('/coleta/download/:id_loja', async (req, res) =>{
  const { id_loja } = req.params;
  try{
    // extrair os dados da resposta da query
    const dadosArquivo = await pool.query('SELECT * FROM coleta WHERE id_loja = ($1)', [id_loja]);

    // criar uma string com os dados
    const dadosString = JSON.stringify(dadosArquivo.rows);

    const nomeLoja = await pool.query('SELECT * FROM concorrente WHERE id = ($1)', [id_loja])
    // escrever a string em um arquivo
    fs.writeFile( `${nomeLoja.nome}.txt`, dadosString, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Arquivo criado com sucesso!');
    });
  }catch(err){
    return res.status(400).send(err);
  }
});

app.patch('/concorrente/:user_id/:loja_id', async (req, res) =>{
  const { user_id, loja_id } = req.params;
  const data = req.body;
  try{
    // const permissaoUsuario = await pool.query('SELECT * FROM usuarios WHERE id = ($1) AND adm = ($2)', [user_id, true]);
    // if(!permissaoUsuario.rows[0]) return res.status(400).send('Usuário sem permissão.');
    const updateLoja = await pool.query('UPDATE concorrente SET nome = ($1), endereco = ($2) WHERE id = ($3) RETURNING *', [ data.nome, data.endereco, loja_id ]);
    return res.status(200).send(updateLoja.rows);
  }catch(err){
    return res.status(400).send(err);
  }
});

app.delete('/concorrente/:user_id/:id_loja', async (req, res) =>{
  const { user_id, id_loja } = req.params;
  try{
    // const permissaoUsuario = await pool.query('SELECT * FROM usuarios WHERE id = ($1) AND adm = ($2)', [user_id, true]);
    // if(!permissaoUsuario.rows[0]) return res.status(400).send('Usuário sem permissão.');
    const deleteLoja = await pool.query('DELETE FROM concorrente WHERE id = ($1) RETURNING *', [id_loja]);
    return res.status(200).send({
      message: "Loja deletada com sucesso",
      deleteLoja
    });
  }catch(err){
    return res.status(400).send(err);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));