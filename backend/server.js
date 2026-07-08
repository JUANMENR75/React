const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         
  password: '14442162', 
  database: 'controlescolar'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('Conectado exitosamente a la base de datos MySQL.');
});

app.post('/api/login', (req, res) => {

  const { username, password } = req.body; 

  const query = 'SELECT id, nombre, correo, id_rol FROM usuarios WHERE correo = ? AND contraseña = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length > 0) {
      const usuario = results[0];
      
      res.json({
        token: 'token_seguro_generado_bd',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          id_rol: usuario.id_rol
        }
      });
    } else {
      res.status(401).json({ error: 'El correo o la contraseña son incorrectos' });
    }
  });
});

const modulos = ['estados', 'municipios', 'localidades', 'datosescuela', 'ciclosescolares', 'grados', 'grupos', 'turnos', 'carreras', 'alumnos'];

modulos.forEach(modulo => {
  app.get(`/api/${modulo}`, (req, res) => {
    const query = `SELECT * FROM ${modulo}`;
    db.query(query, (err, results) => {
      if (err) {
        return res.json([]);
      }
      res.json(results);
    });
  });
});

const PUERTO = 5000;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});