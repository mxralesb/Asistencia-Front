import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FiDownload, FiFileText, FiFilter } from 'react-icons/fi';
import axios from 'axios';
import '../styles/ConsultaAlumnos.css';

const API_BASE = 'http://localhost:4000';

const CHANNEL = 'alumnos:changed';
function onAlumnosChanged(cb) {
  const handler = () => cb();
  window.addEventListener(CHANNEL, handler);
  return () => window.removeEventListener(CHANNEL, handler);
}

function descargarDataUrl(nombreArchivo, dataUrl) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportarCSV(rows, filename = 'alumnos.csv') {
  const headers = ['Nombre', 'Carnet', 'Grado', 'Estado', 'Maestro'];
  const lines = rows.map(al => ([
    al.nombre_completo ?? '',
    al.carnet ?? '',
    al.grado ?? '',
    al.activo ? 'Activo' : 'Inactivo',
    al.docente_nombre ?? ''
  ]));

  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...lines].map(r => r.map(esc).join(',')).join('\n');

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function useDebouncedValue(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const ConsultaAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [filtroMaestro, setFiltroMaestro] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCarnet, setFiltroCarnet] = useState('');

  const filtroNombreDeb = useDebouncedValue(filtroNombre);
  const filtroCarnetDeb = useDebouncedValue(filtroCarnet);

  const fetchAll = useCallback(async () => {
    try {
      setCargando(true);
      const res = await axios.get(`${API_BASE}/api/alumnos`);
      setAlumnos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error cargando alumnos:', err);
      alert('Error al cargar alumnos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const unsub = onAlumnosChanged(() => { fetchAll(); });
    return unsub;
  }, [fetchAll]);

  const maestrosUnicos = useMemo(() => {
    const set = new Set(alumnos.map(a => (a.docente_nombre || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [alumnos]);

  const gradosUnicos = useMemo(() => {
    const set = new Set(alumnos.map(a => (a.grado || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const m = filtroMaestro.trim().toLowerCase();
    const g = filtroGrado.trim().toLowerCase();
    const n = filtroNombreDeb.trim().toLowerCase();
    const c = filtroCarnetDeb.trim().toLowerCase();

    return alumnos.filter(al => {
      const matchMaestro = m ? (al.docente_nombre || '').toLowerCase() === m : true;
      const matchGrado   = g ? (al.grado || '').toLowerCase() === g : true;
      const matchNombre  = n ? (al.nombre_completo || '').toLowerCase().includes(n) : true;
      const matchCarnet  = c ? (al.carnet || '').toLowerCase().includes(c) : true;
      return matchMaestro && matchGrado && matchNombre && matchCarnet;
    });
  }, [alumnos, filtroMaestro, filtroGrado, filtroNombreDeb, filtroCarnetDeb]);

  const limpiarFiltros = () => {
    setFiltroMaestro('');
    setFiltroGrado('');
    setFiltroNombre('');
    setFiltroCarnet('');
  };

  const handleDescargarQR = (al) => {
    if (al.qr_codigo) {
      const nombre = `QR-${(al.carnet || al.id || 'alumno').toString().replace(/\s+/g, '-')}.png`;
      descargarDataUrl(nombre, al.qr_codigo);
    } else {
      window.open(`${API_BASE}/api/alumnos/${al.id}/qr`, '_blank');
    }
  };

  return (
    <div className="consulta-alumnos page">
      <div className="header">
        <h2>Consulta de Alumnos</h2>
        <div className="results-pill">{alumnosFiltrados.length} resultado(s)</div>
      </div>

      {/* filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="field">
            <label>Maestro</label>
            <select
              value={filtroMaestro}
              onChange={(e) => setFiltroMaestro(e.target.value)}
            >
              <option value="">Todos</option>
              {maestrosUnicos.map(m => (
                <option key={m} value={m.toLowerCase()}>{m}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Grado</label>
            <select
              value={filtroGrado}
              onChange={(e) => setFiltroGrado(e.target.value)}
            >
              <option value="">Todos</option>
              {gradosUnicos.map(g => (
                <option key={g} value={g.toLowerCase()}>{g}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Carnet</label>
            <input
              type="text"
              placeholder="Buscar por carnet"
              value={filtroCarnet}
              onChange={(e) => setFiltroCarnet(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-actions" style={{ gap: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn secondary" onClick={limpiarFiltros}>
            <FiFilter style={{ marginRight: 6 }} />
            Limpiar
          </button>

          <button
            className="btn"
            onClick={() => exportarCSV(alumnosFiltrados, 'alumnos_filtrados.csv')}
            disabled={!alumnosFiltrados.length}
            title="Exporta lo que ves en la tabla"
          >
            <FiFileText style={{ marginRight: 6 }} />
            CSV Filtrados
          </button>

          <button
            className="btn"
            onClick={() => exportarCSV(alumnos, 'alumnos_todos.csv')}
            disabled={!alumnos.length}
            title="Exporta todos los alumnos"
          >
            <FiDownload style={{ marginRight: 6 }} />
            CSV Todos
          </button>
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p className="loading">Cargando…</p>
      ) : alumnosFiltrados.length > 0 ? (
        <div className="table-wrapper">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Carnet</th>
                <th>Grado</th>
                <th>Estado</th>
                <th>Maestro</th>
                <th>QR</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((al) => (
                <tr key={al.id}>
                  <td>{al.nombre_completo}</td>
                  <td>{al.carnet}</td>
                  <td>{al.grado}</td>
                  <td>
                    <span className={`badge ${al.activo ? 'ok' : 'warn'}`}>
                      {al.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{al.docente_nombre || '—'}</td>
                  <td>
                    {al.qr_codigo ? (
                      <img
                        src={al.qr_codigo}
                        alt={`QR ${al.carnet}`}
                        className="qr-thumb"
                      />
                    ) : '—'}
                  </td>
                  <td className="row-actions">
                    <button className="btn" onClick={() => handleDescargarQR(al)}>
                      <FiDownload style={{ marginRight: 6 }} />
                 
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">No hay alumnos que coincidan con el filtro.</p>
      )}
    </div>
  );
};

export default ConsultaAlumnos;
