import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ListadoDocente.css';

const ListaDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [error, setError] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDocentes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/usuarios/docentes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocentes(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo obtener la lista de docentes.');
      }
    };

    obtenerDocentes();
  }, []);

  const handleVolver = () => {
    navigate('/dashboard-direccion');
  };

  return (
    <div className="lista-docentes">
      <button className="btn-volver" onClick={handleVolver}>
        ← Volver al Dashboard
      </button>
      <h2>Docentes Registrados</h2>

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="input-filtro"
        />

        <select
          value={filtroGrado}
          onChange={(e) => setFiltroGrado(e.target.value)}
          className="input-filtro"
        >
     <option value="">Todos los grados</option>
          <option value="1ro Básico">1ro Básico</option>
          <option value="2do Básico">2do Básico</option>
          <option value="3ro Básico">3ro Básico</option>
          <option value="1ro Diversificado">1ro Diversificado</option>
          <option value="2do Diversificado">2do Diversificado</option>
          <option value="3ro Diversificado">3ro Diversificado</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {docentes.length > 0 ? (
        <div className="tarjetas-container">
          {docentes
            .filter((docente) =>
              docente.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
              (filtroGrado === '' || docente.grado === filtroGrado)
            )
            .map((docente) => (
              <div
                key={docente.id}
                className={`tarjeta-docente ${docente.activo ? 'activo' : 'inactivo'}`}
              >
                <h3>{docente.nombre}</h3>
                <p>
                  <strong>Correo:</strong> {docente.correo}
                </p>
                <p>
                  <strong>Grado:</strong> {docente.grado}
                </p>
                <p className={`estado ${docente.activo ? 'activo' : 'inactivo'}`}>
                  {docente.activo ? 'Activo' : 'Inactivo'}
                </p>

                <button
                  className={docente.activo ? 'btn-desactivar' : 'btn-activar'}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.put(
                        `http://localhost:4000/api/usuarios/${docente.id}/estado`,
                        { activo: !docente.activo },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      setDocentes((prev) =>
                        prev.map((d) =>
                          d.id === docente.id ? { ...d, activo: !d.activo } : d
                        )
                      );
                    } catch (err) {
                      console.error(err);
                      alert('Error al cambiar el estado del docente');
                    }
                  }}
                >
                  {docente.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p>No hay docentes registrados.</p>
      )}
    </div>
  );
};

export default ListaDocentes;
