require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true              
}));

app.use(express.json());
app.use(cookieParser());

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

      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo, id_rol: usuario.id_rol },
        process.env.JWT_SECRET || 'clave_secreta_por_defecto',
        { expiresIn: '3h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3 * 60 * 60 * 1000 // 3 horas de vigencia
      });

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
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada de manera segura' });
});

const verificarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Sesión no iniciada.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_por_defecto', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Sesión expirada o inválida.' });
    }
    req.usuario = decoded; 
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
    if (req.body.Nombre && !req.body.NombreCarreras) {
        req.body.NombreCarreras = req.body.Nombre;
        delete req.body.Nombre;
    }
    db.query('INSERT INTO ccarreras SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/carreras/:id', (req, res) => {
    if (req.body.Nombre && !req.body.NombreCarreras) {
        req.body.NombreCarreras = req.body.Nombre;
        delete req.body.Nombre;
    }
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
    if (req.body.calle) {
        req.body.Calle = req.body.calle;
        delete req.body.calle;
    }
    db.query('INSERT INTO cdatosescuela SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/datosescuela/:id', (req, res) => {
    if (req.body.calle) {
        req.body.Calle = req.body.calle;
        delete req.body.calle;
    }
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
    const query = `
        SELECT a.Matricula, a.idCarrera, a.idDatosP, a.Status, a.CCT, a.idCiclo, a.idGrado, a.idGrupo, a.idTurno, dp.Nombre
        FROM calumnos a
        INNER JOIN cdatospersonales dp ON a.idDatosP = dp.idDatosP
    `;
    db.query(query, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

app.post('/api/alumnos', (req, res) => { 
    const { Matricula, Nombre, PApellido, SApellido, idCarrera, CCT, idCiclo, idGrado, idGrupo, idTurno } = req.body;
    const nombreCompleto = `${Nombre || ''} ${PApellido || ''} ${SApellido || ''}`.trim();

    const sqlEscuela = 'SELECT idEstado, idMunicipio, idLocalidad FROM cdatosescuela WHERE CCT = ?';
    db.query(sqlEscuela, [CCT], (errEsc, escRes) => {
        const idEstado = (!errEsc && escRes.length > 0) ? escRes[0].idEstado : 1;
        const idMunicipio = (!errEsc && escRes.length > 0) ? escRes[0].idMunicipio : 1;
        const idLocalidad = (!errEsc && escRes.length > 0) ? escRes[0].idLocalidad : 1;

        const datosPersonales = {
            Nombre: nombreCompleto,
            Curp: Matricula || 'POR_DEFINIR',
            idEstado, idMunicipio, idLocalidad,
            idGenero: 1
        };

        db.query('INSERT INTO cdatospersonales SET ?', datosPersonales, (errDP, resDP) => {
            if (errDP) return res.status(500).json({ error: errDP });

            const idDatosP = resDP.insertId; // Rescatamos la PK autogenerada

            const datosAlumno = {
                Matricula, idCarrera, idDatosP, CCT, idCiclo, idGrado, idGrupo, idTurno,
                Status: 'A'
            };

            // 2. Guardar en Alumnos mapeando la PK obtenida y las llaves relacionales
            db.query('INSERT INTO calumnos SET ?', datosAlumno, (errA, r) => {
                if (errA) return res.status(500).json({ error: errA });
                res.json(r);
            });
        });
    });
});

app.put('/api/alumnos/:id', (req, res) => {
    const matricula = req.params.id;
    const { Nombre, PApellido, SApellido, idCarrera, CCT, idCiclo, idGrado, idGrupo, idTurno } = req.body;
    const nombreCompleto = `${Nombre || ''} ${PApellido || ''} ${SApellido || ''}`.trim();

    db.query('SELECT idDatosP FROM calumnos WHERE Matricula = ?', [matricula], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Alumno no encontrado.' });

        const idDatosP = results[0].idDatosP;

        // 1. Actualizar Datos Personales unificados
        db.query('UPDATE cdatospersonales SET Nombre = ? WHERE idDatosP = ?', [nombreCompleto, idDatosP], (errDP) => {
            if (errDP) return res.status(500).json({ error: errDP });

            const datosAlumno = { idCarrera, CCT, idCiclo, idGrado, idGrupo, idTurno };
            
            // 2. Actualizar perfiles escolares en la tabla Alumnos
            db.query('UPDATE calumnos SET ? WHERE Matricula = ?', [datosAlumno, matricula], (errA, r) => {
                if (errA) return res.status(500).json({ error: errA });
                res.json(r);
            });
        });
    });
});

app.delete('/api/alumnos/:id', (req, res) => {
    const matricula = req.params.id;

    db.query('SELECT idDatosP FROM calumnos WHERE Matricula = ?', [matricula], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Alumno no encontrado.' });

        const idDatosP = results[0].idDatosP;

        // Al eliminar de cdatospersonales se activa tu regla "ON DELETE CASCADE" y limpia calumnos solo
        db.query('DELETE FROM cdatospersonales WHERE idDatosP = ?', [idDatosP], (errDel, r) => {
            if (errDel) return res.status(500).json({ error: errDel });
            res.json(r);
        });
    });
});

const catalogosNuevos = [
  { ruta: 'ciclosescolares', tabla: 'CCiclosEscolares', pk: 'idCiclo' },
  { ruta: 'grados',           tabla: 'CGrados',           pk: 'idGrado' },
  { ruta: 'grupos',           tabla: 'CGrupos',           pk: 'idGrupo' },
  { ruta: 'turnos',           tabla: 'CTurnos',           pk: 'idTurno' }
];

catalogosNuevos.forEach(cat => {
  app.get(`/api/${cat.ruta}`, (req, res) => {
    db.query(`SELECT * FROM ${cat.tabla}`, (err, r) => {
      if (err) return res.status(500).json({ error: err });
      res.json(r);
    });
  });

  app.post(`/api/${cat.ruta}`, (req, res) => {
    db.query(`INSERT INTO ${cat.tabla} SET ?`, req.body, (err, r) => {
      if (err) return res.status(500).json({ error: err });
      res.json(r);
    });
  });

  app.put(`/api/${cat.ruta}/:id`, (req, res) => {
    db.query(`UPDATE ${cat.tabla} SET ? WHERE ${cat.pk} = ?`, [req.body, req.params.id], (err, r) => {
      if (err) return res.status(500).json({ error: err });
      res.json(r);
    });
  });

  app.delete(`/api/${cat.ruta}/:id`, (req, res) => {
    db.query(`DELETE FROM ${cat.tabla} WHERE ${cat.pk} = ?`, [req.params.id], (err, r) => {
      if (err) return res.status(500).json({ error: err });
      res.json(r);
    });
  });
});

const rutasSimuladasRestantes = ['datospersonales', 'tipospersonal', 'personal'];
rutasSimuladasRestantes.forEach(modulo => {
  app.get(`/api/${modulo}`, (req, res) => res.json([]));
  app.post(`/api/${modulo}`, (req, res) => res.json({ message: 'Guardado simulado' }));
  app.put(`/api/${modulo}/:id`, (req, res) => res.json({ message: 'Actualización simulada' }));
  app.delete(`/api/${modulo}/:id`, (req, res) => res.json({ message: 'Eliminación simulada' }));
});

const PUERTO = process.env.PORT || 5000;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});