const express = require('express');
const PORT = 3333;

const pool = require('./database/_database');

const app = express();

app.use(express.json());

app.get('/', (req, res) =>{console.log('raiz')});
app.get('/lojas', async (req,res) => {
    try{
      const { rows } = await pool.query('SELECT * FROM coletagem');
      return res.status(200).send(rows);
    } catch(err){
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
  } catch(err){
    return res.status(400).send(err);
  }
});

app.post('/coleta/:id', async (req, res) => {
  const {codbar, valor} = req.body;
  const { id } = req.params
  try{
    const newData = await pool.query('INSERT INTO coletagem (codbar, valor, id_loja) VALUES ($1, $2, $3) RETURNING *', [codbar, valor, id]);
    return res.status(200).send(newData.rows);
  } catch(err){
    return res.status(400).send(err);
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`))