const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '1444216256', 
    database: 'controlescolar' 
});

db.connect(err => {
    if (err) return console.error('Error MySQL:', err);
    console.log('¡Conectado exitosamente a MySQL!');
});

//  API de Estados
app.get('/api/estados', (req, res) => {
    db.query('SELECT * FROM CEstados', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.post('/api/estados', (req, res) => {
    db.query('INSERT INTO CEstados SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.put('/api/estados/:id', (req, res) => {
    db.query('UPDATE CEstados SET ? WHERE idEstado = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});
app.delete('/api/estados/:id', (req, res) => {
    db.query('DELETE FROM CEstados WHERE idEstado = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    });
});

// API de Municipios
app.get('/api/municipios', (req, res) => { 
    db.query('SELECT * FROM CMunicipio', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/municipios', (req, res) => { 
    db.query('INSERT INTO CMunicipio SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/municipios/:id', (req, res) => { 
    db.query('UPDATE CMunicipio SET ? WHERE idMunicipio = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/municipios/:id', (req, res) => { 
    db.query('DELETE FROM CMunicipio WHERE idMunicipio = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Localidades
app.get('/api/localidades', (req, res) => { 
    db.query('SELECT * FROM CLocalidad', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/localidades', (req, res) => { 
    db.query('INSERT INTO CLocalidad SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/localidades/:id', (req, res) => { 
    db.query('UPDATE CLocalidad SET ? WHERE idLocalidad = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/localidades/:id', (req, res) => { 
    db.query('DELETE FROM CLocalidad WHERE idLocalidad = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Carreras
app.get('/api/carreras', (req, res) => { 
    db.query('SELECT * FROM CCarreras', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/carreras', (req, res) => { 
    db.query('INSERT INTO CCarreras SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/carreras/:id', (req, res) => { 
    db.query('UPDATE CCarreras SET ? WHERE idCarrera = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/carreras/:id', (req, res) => { 
    db.query('DELETE FROM CCarreras WHERE idCarrera = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Generos
app.get('/api/generos', (req, res) => { 
    db.query('SELECT * FROM Genero', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/generos', (req, res) => { 
    db.query('INSERT INTO Genero SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/generos/:id', (req, res) => { 
    db.query('UPDATE Genero SET ? WHERE idGenero = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/generos/:id', (req, res) => { 
    db.query('DELETE FROM Genero WHERE idGenero = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Tipos de Personal
app.get('/api/tipospersonal', (req, res) => { 
    db.query('SELECT * FROM CTipoPersonal', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/tipospersonal', (req, res) => { 
    db.query('INSERT INTO CTipoPersonal SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/tipospersonal/:id', (req, res) => { 
    db.query('UPDATE CTipoPersonal SET ? WHERE idTipo = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/tipospersonal/:id', (req, res) => { 
    db.query('DELETE FROM CTipoPersonal WHERE idTipo = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Datos de Escuela
app.get('/api/datosescuela', (req, res) => { 
    db.query('SELECT * FROM CDatosEscuela', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/datosescuela', (req, res) => { 
    db.query('INSERT INTO CDatosEscuela SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/datosescuela/:id', (req, res) => { 
    db.query('UPDATE CDatosEscuela SET ? WHERE CCT = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/datosescuela/:id', (req, res) => { 
    db.query('DELETE FROM CDatosEscuela WHERE CCT = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Datos Personales
app.get('/api/datospersonales', (req, res) => { 
    db.query('SELECT * FROM CDatosPersonales', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/datospersonales', (req, res) => { 
    db.query('INSERT INTO CDatosPersonales SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/datospersonales/:id', (req, res) => { 
    db.query('UPDATE CDatosPersonales SET ? WHERE idDatosP = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/datospersonales/:id', (req, res) => { 
    db.query('DELETE FROM CDatosPersonales WHERE idDatosP = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Alumnos
app.get('/api/alumnos', (req, res) => { 
    db.query('SELECT * FROM CAlumnos', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/alumnos', (req, res) => { 
    db.query('INSERT INTO CAlumnos SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/alumnos/:id', (req, res) => { 
    db.query('UPDATE CAlumnos SET ? WHERE Matricula = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/alumnos/:id', (req, res) => { 
    db.query('DELETE FROM CAlumnos WHERE Matricula = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

// API de Personal
app.get('/api/personal', (req, res) => { 
    db.query('SELECT * FROM CPersonal', (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.post('/api/personal', (req, res) => { 
    db.query('INSERT INTO CPersonal SET ?', req.body, (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.put('/api/personal/:id', (req, res) => { 
    db.query('UPDATE CPersonal SET ? WHERE idPersonal = ?', [req.body, req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});
app.delete('/api/personal/:id', (req, res) => { 
    db.query('DELETE FROM CPersonal WHERE idPersonal = ?', [req.params.id], (err, r) => {
        if (err) return res.status(500).json({ error: err });
        res.json(r);
    }); 
});

app.listen(5000, () => console.log('Servidor corriendo perfectamente en el puerto 5000 y alineado a la BD'));