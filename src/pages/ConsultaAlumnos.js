import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
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

function exportarCSV(rows, filenameBase = 'alumnos') {
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

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameBase}_${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Debounce simple */
function useDebouncedValue(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* Util: ordenamiento */
const sorters = {
  nombre_completo: (a, b) => (a?.nombre_completo || '').localeCompare(b?.nombre_completo || '', 'es'),
  carnet:         (a, b) => (a?.carnet || '').localeCompare(b?.carnet || '', 'es'),
  grado:          (a, b) => (a?.grado || '').localeCompare(b?.grado || '', 'es'),
  docente_nombre: (a, b) => (a?.docente_nombre || '').localeCompare(b?.docente_nombre || '', 'es'),
  activo:         (a, b) => Number(b?.activo) - Number(a?.activo), // Activos primero
};

const ConsultaAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Filtros
  const [filtroMaestro, setFiltroMaestro] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCarnet, setFiltroCarnet] = useState('');
  const filtroNombreDeb = useDebouncedValue(filtroNombre);
  const filtroCarnetDeb = useDebouncedValue(filtroCarnet);

  // Orden
  const [sortKey, setSortKey] = useState('nombre_completo');
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const abortRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await axios.get(`${API_BASE}/api/alumnos`, {
        signal: abortRef.current.signal,
      });
      setAlumnos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Error cargando alumnos:', err);
      setError('No se pudieron cargar los alumnos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const unsub = onAlumnosChanged(fetchAll);
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

    let out = alumnos.filter(al => {
      const matchMaestro = m ? (al.docente_nombre || '').toLowerCase() === m : true;
      const matchGrado   = g ? (al.grado || '').toLowerCase() === g : true;
      const matchNombre  = n ? (al.nombre_completo || '').toLowerCase().includes(n) : true;
      const matchCarnet  = c ? (al.carnet || '').toLowerCase().includes(c) : true;
      return matchMaestro && matchGrado && matchNombre && matchCarnet;
    });

    const sorter = sorters[sortKey] || sorters.nombre_completo;
    out = [...out].sort(sorter);
    if (sortDir === 'desc') out.reverse();
    return out;
  }, [alumnos, filtroMaestro, filtroGrado, filtroNombreDeb, filtroCarnetDeb, sortKey, sortDir]);

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

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const headerBtn = (key, label) => (
    <button
      type="button"
      className="th-sort"
      onClick={() => toggleSort(key)}
      aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      title={`Ordenar por ${label}`}
    >
      {label}
      {sortKey === key ? <span className="sort-caret">{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
    </button>
  );

  return (
    <div className="consulta-alumnos page">
      <div className="header">
        <h2>Consulta de Alumnos</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn secondary"
            onClick={fetchAll}
            title="Recargar"
            aria-label="Recargar lista"
          >
            <FiRefreshCw style={{ marginRight: 6 }} /> Recargar
          </button>

        <div className="results-pill">{alumnosFiltrados.length} resultado(s)</div>
        </div>
      </div>

      {/* Error inline (sin alert) */}
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="field">
            <label>Maestro</label>
            <select
              value={filtroMaestro}
              onChange={(e) => setFiltroMaestro(e.target.value)}
              aria-label="Filtrar por maestro"
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
              aria-label="Filtrar por grado"
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
              aria-label="Buscar por nombre"
            />
          </div>

          <div className="field">
            <label>Carnet</label>
            <input
              type="text"
              placeholder="Buscar por carnet"
              value={filtroCarnet}
              onChange={(e) => setFiltroCarnet(e.target.value)}
              aria-label="Buscar por carnet"
            />
          </div>
        </div>

        <div className="filters-actions" style={{ gap: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn secondary" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>

          <button
            className="btn"
            onClick={() => exportarCSV(alumnosFiltrados, 'alumnos_filtrados')}
            disabled={!alumnosFiltrados.length}
            title="Exporta lo que ves en la tabla"
          >
            <FiDownload style={{ marginRight: 6 }} />
            Exportar CSV (filtrados)
          </button>

          <button
            className="btn"
            onClick={() => exportarCSV(alumnos, 'alumnos_todos')}
            disabled={!alumnos.length}
            title="Exporta todos los alumnos"
          >
            <FiDownload style={{ marginRight: 6 }} />
            Exportar CSV (todos)
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
                <th>{headerBtn('nombre_completo', 'Nombre')}</th>
                <th>{headerBtn('carnet', 'Carnet')}</th>
                <th>{headerBtn('grado', 'Grado')}</th>
                <th>{headerBtn('activo', 'Estado')}</th>
                <th>{headerBtn('docente_nombre', 'Maestro')}</th>
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
                      Descargar QR
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
