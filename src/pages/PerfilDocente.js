import React, { useState, useEffect } from 'react';
import { getPerfilDocente, actualizarPerfilDocente } from '../services/docenteService';
import '../styles/PerfilDocente.css';

const PerfilDocente = () => {
  const [docente, setDocente] = useState({
    nombre: '',
    correo: '',
    telefono: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const datos = await getPerfilDocente();
        setDocente(datos);
      } catch (error) {
        setMensaje('Error al cargar el perfil');
      }
    };

    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    setDocente({ ...docente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarPerfilDocente(docente);
      setMensaje('Perfil actualizado correctamente');
    } catch (error) {
      setMensaje('Error al actualizar el perfil');
    }
  };

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input name="nombre" value={docente.nombre} onChange={handleChange} />

        <label>Correo</label>
        <input name="correo" type="email" value={docente.correo} onChange={handleChange} />

        <label>Teléfono</label>
        <input name="telefono" value={docente.telefono || ''} onChange={handleChange} />

        <button type="submit">Guardar cambios</button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default PerfilDocente;
