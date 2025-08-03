import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Formularios.css';

const RegistroDocente = () => {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    grado: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/usuarios/registro-docente', formulario);
      setMensaje(response.data.mensaje || 'Docente registrado con éxito.');
      setFormulario({ nombre: '', correo: '', grado: '' });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Error al registrar docente.');
      }
    }
  };

  return (
    <div className="formulario-container">
      <h2 className="formulario-titulo">Registrar Nuevo Docente</h2>

      <form className="formulario" onSubmit={handleSubmit}>
        <label>Nombre completo:</label>
        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={handleChange}
          required
        />

        <label>Correo institucional:</label>
        <input
          type="email"
          name="correo"
          value={formulario.correo}
          onChange={handleChange}
          required
        />

        <label>Grado asignado:</label>
        <select
          name="grado"
          value={formulario.grado}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un grado</option>
          <option value="1ro Básico">1ro Básico</option>
          <option value="2do Básico">2do Básico</option>
          <option value="3ro Básico">3ro Básico</option>
          <option value="1ro Diversificado">1ro Diversificado</option>
          <option value="2do Diversificado">2do Diversificado</option>
          <option value="3ro Diversificado">3ro Diversificado</option>
        </select>

        <button type="submit" className="btn-enviar">Registrar</button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
      {error && <p className="mensaje" style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RegistroDocente;
