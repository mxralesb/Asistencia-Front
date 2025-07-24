import { useEffect, useState } from 'react';
import { getPerfilDocente, actualizarPerfilDocente } from '../services/docenteService';
import { useNavigate } from 'react-router-dom';
import '../styles/PerfilDocente.css';

const PerfilDocente = () => {
  const navigate = useNavigate(); // ✅ MOVIDO AQUÍ

  const [perfil, setPerfil] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    password: ''
  });

  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const data = await getPerfilDocente();
        setPerfil(prev => ({
          ...prev,
          nombre: data.nombre,
          telefono: data.telefono || '',
          direccion: data.direccion || ''
        }));
      } catch (error) {
        console.error('Error al cargar el perfil:', error.message);
      }
    };

    obtenerPerfil();
  }, []);

  const handleChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarPerfilDocente(perfil);
      setMensaje('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error.message);
      setMensaje('Error al actualizar el perfil');
    }
  };

  const handleVolver = () => {
    navigate('/dashboard-docente');
  };

  if (!perfil.nombre) return <div>Cargando perfil...</div>;

  return (
    <div className="perfil-container">
      <button className="btn-volver" onClick={handleVolver}>← Volver al Dashboard</button>

      <h2 className="perfil-title">Bienvenido, {perfil.nombre}</h2>
      <form className="perfil-form" onSubmit={handleSubmit}>
        <label>
          Teléfono:
          <input type="text" name="telefono" value={perfil.telefono} onChange={handleChange} />
        </label>

        <label>
          Dirección:
          <input type="text" name="direccion" value={perfil.direccion} onChange={handleChange} />
        </label>

        <label>
          Nueva Contraseña:
          <input type="password" name="password" value={perfil.password} onChange={handleChange} />
        </label>

        <button className="btn-actualizar" type="submit">Guardar cambios</button>
      </form>
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default PerfilDocente;
