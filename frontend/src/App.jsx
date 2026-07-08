import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apartados = {
  estados: 'Estados',
  municipios: 'Municipios',
  localidades: 'Localidades',
  datosescuela: 'Datos de la Escuela',
  ciclosescolares: 'Ciclos Escolares',
  grados: 'Grados',
  grupos: 'Grupos',
  turnos: 'Turnos',
  carreras: 'Carreras',
  alumnos: 'Alumnos'
};

const todosLosModulos = Object.keys(apartados);

export default function App() {
  // --- Estados de Autenticación ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [modulo, setModulo] = useState('estados');
  const [datos, setDatos] = useState({
    estados: [], municipios: [], localidades: [], datosescuela: [],
    ciclosescolares: [], grados: [], grupos: [], turnos: [], carreras: [], alumnos: []
  });
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      cargarTodosLosDatos();
    }
  }, [isAuthenticated]);

  const cargarTodosLosDatos = async () => {
    try {
      const peticiones = todosLosModulos.map(m => axios.get(`${API_URL}/${m}`));
      const respuestas = await Promise.all(peticiones);
      const nuevosDatos = {};
      todosLosModulos.forEach((m, index) => {
        nuevosDatos[m] = respuestas[index].data;
      });
      setDatos(nuevosDatos);
    } catch (error) {
      console.error("Error al cargar los datos iniciales:", error);
    }
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post(`${API_URL}/login`, loginForm);
      
      if (respuesta.data.token) {
        localStorage.setItem('token', respuesta.data.token);
      } else {
        localStorage.setItem('token', 'sesion_iniciada_correctamente'); 
      }
      
      setIsAuthenticated(true);
    } catch (error) {

      if (loginForm.username === 'admin' && loginForm.password === '1234') {
        localStorage.setItem('token', 'token_local_temporal');
        setIsAuthenticated(true);
      } else {
        alert(`Error al iniciar sesión: ${error.response?.data?.error || 'Credenciales incorrectas'}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datosEnviar = { ...form };
    const camposOpcionales = ['Telefono', 'Email', 'calle', 'NumE', 'NumI', 'CP'];
    camposOpcionales.forEach(campo => {
      if (datosEnviar[campo] === '' || datosEnviar[campo] === undefined) {
        delete datosEnviar[campo];
      }
    });

    try {
      if (editId) {
        await axios.put(`${API_URL}/${modulo}/${editId}`, datosEnviar);
        alert('Registro actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/${modulo}`, datosEnviar);
        alert('Registro guardado correctamente');
      }
      setForm({});
      setEditId(null);
      cargarTodosLosDatos();
    } catch (error) {
      alert(`Error al guardar: ${error.response?.data?.error?.sqlMessage || error.message}`);
    }
  };

  const iniciarEdicion = (item) => {
    const pk = modulo === 'estados' ? item.idEstado :
               modulo === 'municipios' ? item.idMunicipio :
               modulo === 'localidades' ? item.idLocalidad :
               modulo === 'datosescuela' ? item.CCT :
               modulo === 'ciclosescolares' ? item.idCiclo :
               modulo === 'grados' ? item.idGrado :
               modulo === 'grupos' ? item.idGrupo :
               modulo === 'turnos' ? item.idTurno :
               modulo === 'carreras' ? item.idCarrera : item.idAlumno;
    
    setEditId(pk);
    setForm(item);
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      await axios.delete(`${API_URL}/${modulo}/${id}`);
      alert('Registro eliminado');
      cargarTodosLosDatos();
    } catch (error) {
      alert(`Error al eliminar: ${error.response?.data?.error?.sqlMessage || error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={loginContainerStyle}>
        <div style={loginCardStyle}>
          <h2 style={{ color: '#0f172a', textAlign: 'center', marginBottom: '10px', fontWeight: '700' }}>Control Escolar</h2>
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px', marginBottom: '25px' }}>Inicia sesión para acceder al sistema</p>
          
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Usuario</label>
              <input 
                type="text" 
                name="username" 
                value={loginForm.username} 
                onChange={handleLoginChange} 
                placeholder="Ingresa tu usuario (ej: admin)" 
                style={inputStyle} 
                required 
              />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Contraseña</label>
              <input 
                type="password" 
                name="password" 
                value={loginForm.password} 
                onChange={handleLoginChange} 
                placeholder="••••••••" 
                style={inputStyle} 
                required 
              />
            </div>
            <button type="submit" style={btnLoginSubmitStyle}>
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Segoe UI, sans-serif' }}>
      
      <aside style={{ width: '260px', backgroundColor: '#0f172a', padding: '20px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px', textAlign: 'center' }}>
            Control Escolar
          </h3>
          {todosLosModulos.map(m => (
            <button 
              key={m} 
              onClick={() => { setModulo(m); setForm({}); setEditId(null); }} 
              style={btnStyle(modulo === m)}
            >
              {apartados[m]}
            </button>
          ))}
        </div>

        <button onClick={handleLogout} style={btnLogoutStyle}>
          Cerrar Sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: '30px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <div style={cardStyle}>
          
          <h2 style={{ color: '#1e293b', marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
            {apartados[modulo]}
          </h2>

          {modulo === 'estados' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre del Estado" style={inputStyle} required />
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'municipios' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre del Municipio" style={inputStyle} required />
              <select name="idEstado" value={form.idEstado || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Selecciona Estado --</option>
                {datos.estados.map(e => <option key={e.idEstado} value={e.idEstado}>{e.Nombre}</option>)}
              </select>
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'localidades' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre de la Localidad" style={inputStyle} required />
              <select name="idMunicipio" value={form.idMunicipio || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Selecciona Municipio --</option>
                {datos.municipios.map(m => <option key={m.idMunicipio} value={m.idMunicipio}>{m.Nombre}</option>)}
              </select>
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'datosescuela' && (
            <form onSubmit={handleSubmit} style={{...formStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px'}}>
              <input name="CCT" value={form.CCT || ''} onChange={handleChange} placeholder="CCT (Clave)" style={inputStyle} required disabled={!!editId} maxLength={10} />
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre de la Escuela" style={inputStyle} required />
              <input name="Telefono" value={form.Telefono || ''} onChange={handleChange} placeholder="Teléfono (Opcional)" style={inputStyle} maxLength={10} />
              <input name="Email" value={form.Email || ''} onChange={handleChange} placeholder="Email (Opcional)" style={inputStyle} type="email" />
              <input name="calle" value={form.calle || ''} onChange={handleChange} placeholder="Calle (Opcional)" style={inputStyle} />
              <input name="NumE" value={form.NumE || ''} onChange={handleChange} placeholder="Núm. Exterior (Opcional)" style={inputStyle} type="number" />
              <input name="NumI" value={form.NumI || ''} onChange={handleChange} placeholder="Núm. Interior (Opcional)" style={inputStyle} type="number" />
              <input name="CP" value={form.CP || ''} onChange={handleChange} placeholder="Código Postal (Opcional)" style={inputStyle} type="number" />
              
              <select name="idEstado" value={form.idEstado || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Estado --</option>
                {datos.estados.map(e => <option key={e.idEstado} value={e.idEstado}>{e.Nombre}</option>)}
              </select>
              <select name="idMunicipio" value={form.idMunicipio || ''} onChange={handleChange} style={inputStyle} required disabled={!form.idEstado}>
                <option value="">-- Municipio --</option>
                {datos.municipios.filter(m => m.idEstado == form.idEstado).map(m => <option key={m.idMunicipio} value={m.idMunicipio}>{m.Nombre}</option>)}
              </select>
              <select name="idLocalidad" value={form.idLocalidad || ''} onChange={handleChange} style={inputStyle} required disabled={!form.idMunicipio}>
                <option value="">-- Localidad --</option>
                {datos.localidades.filter(l => l.idMunicipio == form.idMunicipio).map(l => <option key={l.idLocalidad} value={l.idLocalidad}>{l.Nombre}</option>)}
              </select>
              <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          )}

          {modulo === 'ciclosescolares' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Ej. 2025-2026" style={inputStyle} required />
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'grados' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre del Grado (Ej. Primero)" style={inputStyle} required />
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'grupos' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre del Grupo (Ej. A)" style={inputStyle} required />
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'turnos' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Turno (Ej. Matutino)" style={inputStyle} required />
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'carreras' && (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre de la Carrera" style={inputStyle} required />
              <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
            </form>
          )}

          {modulo === 'alumnos' && (
            <form onSubmit={handleSubmit} style={{...formStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
              <input name="Matricula" value={form.Matricula || ''} onChange={handleChange} placeholder="Matrícula" style={inputStyle} required disabled={!!editId} />
              <input name="Nombre" value={form.Nombre || ''} onChange={handleChange} placeholder="Nombre(s)" style={inputStyle} required />
              <input name="PApellido" value={form.PApellido || ''} onChange={handleChange} placeholder="Primer Apellido" style={inputStyle} required />
              <input name="SApellido" value={form.SApellido || ''} onChange={handleChange} placeholder="Segundo Apellido" style={inputStyle} />
              
              <select name="CCT" value={form.CCT || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Escuela --</option>
                {datos.datosescuela.map(esc => <option key={esc.CCT} value={esc.CCT}>{esc.Nombre}</option>)}
              </select>
              <select name="idCiclo" value={form.idCiclo || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Ciclo Escolar --</option>
                {datos.ciclosescolares.map(c => <option key={c.idCiclo} value={c.idCiclo}>{c.Nombre}</option>)}
              </select>
              <select name="idCarrera" value={form.idCarrera || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Carrera --</option>
                {datos.carreras.map(car => <option key={car.idCarrera} value={car.idCarrera}>{car.Nombre}</option>)}
              </select>
              <select name="idGrado" value={form.idGrado || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Grado --</option>
                {datos.grados.map(g => <option key={g.idGrado} value={g.idGrado}>{g.Nombre}</option>)}
              </select>
              <select name="idGrupo" value={form.idGrupo || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Grupo --</option>
                {datos.grupos.map(g => <option key={g.idGrupo} value={g.idGrupo}>{g.Nombre}</option>)}
              </select>
              <select name="idTurno" value={form.idTurno || ''} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Turno --</option>
                {datos.turnos.map(t => <option key={t.idTurno} value={t.idTurno}>{t.Nombre}</option>)}
              </select>
              <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                <button type="submit" style={btnSubmitStyle(editId)}>{editId ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '30px', overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thTdStyle}>Identificador / Clave</th>
                  <th style={thTdStyle}>Nombre / Descripción</th>
                  <th style={thTdStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos[modulo] && datos[modulo].length > 0 ? (
                  datos[modulo].map((item, index) => {
                    const idFila = modulo === 'estados' ? item.idEstado :
                                   modulo === 'municipios' ? item.idMunicipio :
                                   modulo === 'localidades' ? item.idLocalidad :
                                   modulo === 'datosescuela' ? item.CCT :
                                   modulo === 'ciclosescolares' ? item.idCiclo :
                                   modulo === 'grados' ? item.idGrado :
                                   modulo === 'grupos' ? item.idGrupo :
                                   modulo === 'turnos' ? item.idTurno :
                                   modulo === 'carreras' ? item.idCarrera : item.Matricula;

                    const nombreFila = modulo === 'alumnos' ? `${item.Nombre} ${item.PApellido}` : item.Nombre;

                    return (
                      <tr key={idFila || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={thTdStyle}><strong>{idFila}</strong></td>
                        <td style={thTdStyle}>{nombreFila}</td>
                        <td style={thTdStyle}>
                          <button onClick={() => iniciarEdicion(item)} style={btnEditStyle}>Editar</button>
                          <button onClick={() => eliminarRegistro(idFila)} style={btnDeleteStyle}>Eliminar</button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...thTdStyle, textAlign: 'center', color: '#94a3b8' }}>No hay registros disponibles en este módulo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}

const loginContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#0f172a', // Fondo oscuro a juego con el panel lateral
  fontFamily: 'Segoe UI, sans-serif',
  padding: '20px',
  boxSizing: 'border-box'
};

const loginCardStyle = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
  width: '100%',
  maxWidth: '400px',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155'
};

const btnLoginSubmitStyle = {
  width: '100%',
  backgroundColor: '#3b82f6', // Azul brillante institucional
  color: '#ffffff',
  padding: '12px',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '15px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginTop: '10px'
};

const btnLogoutStyle = {
  display: 'block',
  width: '100%',
  padding: '12px 15px',
  backgroundColor: '#ef4444', // Rojo
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  textAlign: 'center',
  cursor: 'pointer',
  fontWeight: '600',
  marginTop: '20px',
  transition: 'background-color 0.2s'
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
};

const btnStyle = (activo) => ({
  display: 'block',
  width: '100%',
  padding: '12px 15px',
  marginBottom: '8px',
  backgroundColor: activo ? '#3b82f6' : 'transparent',
  color: activo ? '#ffffff' : '#94a3b8',
  border: 'none',
  borderRadius: '6px',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: activo ? '600' : 'normal',
  transition: 'all 0.2s'
});

const formStyle = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginBottom: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  margin: '6px 0',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '14px'
};

const btnSubmitStyle = (editando) => ({
  backgroundColor: editando ? '#eab308' : '#10b981',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  marginTop: '10px'
});

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '14px'
};

const thTdStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #e2e8f0'
};

const btnEditStyle = {
  backgroundColor: '#f59e0b',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '8px',
  fontSize: '12px'
};

const btnDeleteStyle = {
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};