const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'password',
  database: 'mydb'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      res.status(500).send('Error querying database');
      return;
    }
    res.send(`The solution is: ${results[0].solution}`);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
