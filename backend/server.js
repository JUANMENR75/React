require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// Configuración de CORS estricta (obligatoria para el intercambio de cookies)
app.use(cors({
  origin: 'http://localhost:5173', // El origen exacto de tu frontend de React (Vite)
  credentials: true                // Permite al navegador recibir y enviar cookies
}));

app.use(express.json());
app.use(cookieParser());

// CONEXIÓN A LA BASE DE DATOS
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',        
  password: process.env.DB_PASSWORD || '14442162', 
  database: process.env.DB_DATABASE || 'controlescolar'
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

      // Generar el JWT real con los datos no sensibles
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo, id_rol: usuario.id_rol },
        process.env.JWT_SECRET || 'clave_secreta_por_defecto',
        { expiresIn: '3h' } // Expira en 3 horas
      );

      // Enviar el token dentro de una cookie segura HttpOnly
      res.cookie('token', token, {
        httpOnly: true,                    // Bloquea el acceso a la cookie desde JavaScript en el cliente (Evita XSS)
        secure: false,                     // En producción (HTTPS) debe ser 'true', en local (http) se deja en 'false'
        sameSite: 'lax',                   // Protección básica contra ataques CSRF
        maxAge: 3 * 60 * 60 * 1000         // Duración de la cookie (3 horas)
      });

      // Retornamos la respuesta sin exponer el token en el JSON visible
      res.json({
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

app.post('/api/logout', (req, res) => {
  // Destruir la cookie del token en el navegador del cliente
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada de manera segura' });
});

// MIDDLEWARE DE VERIFICACIÓN DE JWT
const verificarToken = (req, res, next) => {
  // Leer el token directamente de las cookies enviadas por el navegador
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Sesión no iniciada.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_por_defecto', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Sesión expirada o inválida.' });
    }
    
    req.usuario = decoded; // Guardar los datos del usuario decodificados en la solicitud
    next();
  });
};

app.use(verificarToken);

app.get('/api/estados', (req, res) => {
    db.query('SELECT * FROM cestados', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.post('/api/estados', (req, res) => {
    db.query('INSERT INTO cestados SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.put('/api/estados/:id', (req, res) => {
    db.query('UPDATE cestados SET ? WHERE idEstado = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/estados/:id', (req, res) => {
    db.query('DELETE FROM cestados WHERE idEstado = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

app.get('/api/municipios', (req, res) => { 
    db.query('SELECT * FROM cmunicipio', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/municipios', (req, res) => { 
    db.query('INSERT INTO cmunicipio SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/municipios/:id', (req, res) => {
    db.query('UPDATE cmunicipio SET ? WHERE idMunicipio = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/municipios/:id', (req, res) => {
    db.query('DELETE FROM cmunicipio WHERE idMunicipio = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

app.get('/api/localidades', (req, res) => { 
    db.query('SELECT * FROM clocalidad', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/localidades', (req, res) => { 
    db.query('INSERT INTO clocalidad SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/localidades/:id', (req, res) => {
    db.query('UPDATE clocalidad SET ? WHERE idLocalidad = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/localidades/:id', (req, res) => {
    db.query('DELETE FROM clocalidad WHERE idLocalidad = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

app.get('/api/carreras', (req, res) => { 
    db.query('SELECT * FROM ccarreras', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/carreras', (req, res) => { 
    db.query('INSERT INTO ccarreras SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/carreras/:id', (req, res) => {
    db.query('UPDATE ccarreras SET ? WHERE idCarrera = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/carreras/:id', (req, res) => {
    db.query('DELETE FROM ccarreras WHERE idCarrera = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

app.get('/api/generos', (req, res) => { 
    db.query('SELECT * FROM genero', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/generos', (req, res) => { 
    db.query('INSERT INTO genero SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/generos/:id', (req, res) => {
    db.query('UPDATE genero SET ? WHERE idGenero = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/generos/:id', (req, res) => {
    db.query('DELETE FROM genero WHERE idGenero = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

app.get('/api/datosescuela', (req, res) => { 
    db.query('SELECT * FROM cdatosescuela', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/datosescuela', (req, res) => { 
    db.query('INSERT INTO cdatosescuela SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/datosescuela/:id', (req, res) => {
    db.query('UPDATE cdatosescuela SET ? WHERE CCT = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/datosescuela/:id', (req, res) => {
    db.query('DELETE FROM cdatosescuela WHERE CCT = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

app.get('/api/alumnos', (req, res) => { 
    db.query('SELECT * FROM calumnos', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/alumnos', (req, res) => { 
    db.query('INSERT INTO calumnos SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/alumnos/:id', (req, res) => {
    db.query('UPDATE calumnos SET ? WHERE Matricula = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/alumnos/:id', (req, res) => {
    db.query('DELETE FROM calumnos WHERE Matricula = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

const rutasExtra = ['ciclosescolares', 'grados', 'grupos', 'turnos', 'datospersonales', 'tipospersonal', 'personal'];
rutasExtra.forEach(modulo => {
  app.get(`/api/${modulo}`, (req, res) => res.json([]));
  app.post(`/api/${modulo}`, (req, res) => res.json({ message: 'Guardado simulado' }));
  app.put(`/api/${modulo}/:id`, (req, res) => res.json({ message: 'Actualización simulada' }));
  app.delete(`/api/${modulo}/:id`, (req, res) => res.json({ message: 'Eliminación simulada' }));
});

const PUERTO = process.env.PORT || 5000;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});