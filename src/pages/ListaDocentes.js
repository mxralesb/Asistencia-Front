import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ListadoDocente.css';

const GRADOS = [
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  'Cuarto Bachillerato',
  'Quinto Bachillerato',
];

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
        const { data } = await axios.get('http://localhost:4000/api/usuarios/docentes', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setDocentes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudo obtener la lista de docentes.');
      }
    };
    obtenerDocentes();
  }, []);

  const handleVolver = () => navigate('/dashboard-direccion');

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroGrado('');
  };

  const filtrados = useMemo(() => {
    const t = filtroNombre.trim().toLowerCase();
    return docentes.filter((d) => {
      const matchNombre =
        !t ||
        (d?.nombre || '').toLowerCase().includes(t) ||
        (d?.correo || '').toLowerCase().includes(t);
      const matchGrado = !filtroGrado || (d?.grado || '') === filtroGrado;
      return matchNombre && matchGrado;
    });
  }, [docentes, filtroNombre, filtroGrado]);


  return (
    <div className="rd-wrap">
      <button className="rd-back" type="button" onClick={() => navigate('/dashboard-direccion')}>
        ← Volver al Dashboard
      </button>

      <h2 className="rd-title">Listado de docente</h2>

      {/* Filtros */}
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por nombre o correo"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="input-filtro"
          aria-label="Buscar docente"
        />

        <select
          value={filtroGrado}
          onChange={(e) => setFiltroGrado(e.target.value)}
          className="input-filtro"
          aria-label="Filtrar por grado"
        >
          <option value="">Todos los grados</option>
          {GRADOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn-activar"
          style={{ maxWidth: 180 }}
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Resumen / error */}
      {error && <p className="error">{error}</p>}
      {!error && (
        <p style={{ margin: '0.5rem 0 1rem', color: '#6b5d8b' }}>
          Mostrando <strong>{filtrados.length}</strong> de {docentes.length} docente(s)
        </p>
      )}

      {/* Tarjetas */}
      {filtrados.length > 0 ? (
        <div className="tarjetas-container">
          {filtrados.map((docente) => (
            <div
              key={docente.id}
              className={`tarjeta-docente ${docente.activo ? 'activo' : 'inactivo'}`}
            >
              <h3>{docente.nombre}</h3>
              <p>
                <strong>Correo:</strong> {docente.correo}
              </p>
              <p>
                <strong>Grado:</strong> {docente.grado || '—'}
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
                      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                    );
                    setDocentes((prev) =>
                      prev.map((d) => (d.id === docente.id ? { ...d, activo: !d.activo } : d))
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
        !error && <p>No hay docentes que coincidan con los filtros.</p>
      )}
    </div>
  );
};

export default ListaDocentes;
