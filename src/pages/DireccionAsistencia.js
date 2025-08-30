import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {

  FiDownload,
  FiCalendar,
  FiUsers,
  FiUser,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import '../styles/DireccionAsistencia.css';

const API_BASE = 'http://localhost:4000';

const ESTADOS = [
  { v: '', label: 'Todos' },
  { v: 'presente', label: 'Presente' },
  { v: 'tarde', label: 'Tarde' },
  { v: 'ausente', label: 'Ausente' },
  { v: 'sin_registro', label: 'Sin registro' },
];

function exportCSV(rows, fecha) {
  const headers = ['Nombre','Carnet','Grado','Docente','Estado','Observaciones'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g,'""')}"`;
  const csv = [headers, ...rows.map(r=>[
    r.nombre_completo, r.carnet, r.grado, r.docente_nombre || '',
    r.estado, r.observaciones || ''
  ])].map(r=>r.map(esc).join(',')).join('\n');
  const blob = new Blob(["\uFEFF"+csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `asistencia_${fecha}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function DireccionAsistencia(){
  const hoy = new Date().toISOString().slice(0,10);
  const [fecha, setFecha] = useState(hoy);
  const [grado, setGrado] = useState('');
  const [docente, setDocente] = useState('');
  const [estado, setEstado] = useState('');
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const fetch = async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setErr('');
    try{
      const { data } = await axios.get(`${API_BASE}/api/asistencia`, {
        params: { fecha, grado, docente, q, estado },
        signal: ctrl.signal
      });
      setRows(Array.isArray(data)? data : []);
    }catch(e){
      if (!axios.isCancel(e)) {
        console.error(e);
        setErr(e?.response?.data?.error || 'No se pudo cargar la asistencia');
      }
    }finally{
      setLoading(false);
    }
  };

  // carga inicial + al cambiar filtros
  useEffect(()=>{ fetch(); /* eslint-disable-next-line */ }, [fecha, grado, docente, estado, q]);
  // auto-refresh cada 10s
  useEffect(()=>{ const id = setInterval(fetch, 10000); return () => clearInterval(id); }, [fecha, grado, docente, estado, q]);

  const grados = useMemo(()=>Array.from(new Set(rows.map(r=>r.grado).filter(Boolean))).sort(),[rows]);
  const docentes = useMemo(()=>Array.from(new Set(rows.map(r=>(r.docente_nombre||'').trim()).filter(Boolean))).sort(),[rows]);

  
  
return (
  <div className="rd-wrap">
    {/* Encabezado */}
    <div className="rd-header">
      <button
        className="rd-back"
        type="button"
        onClick={() => navigate('/dashboard-direccion')}
      >
        ← Volver al Dashboard
      </button>

      <h2 className="rd-title">Asistencia General</h2>

      <div className="header-actions">
        <div className="results-pill" title="Cantidad de alumnos listados">
          {rows.length} alumno(s)
        </div>
      </div>
    </div>
    

      {err && <div className="error-banner" role="alert">{err}</div>}

      {/* Filtros */}
      <form className="filters-card" onSubmit={(e)=>{e.preventDefault(); fetch();}}>
        <div className="filters-grid">
          <div className="field">
            <label htmlFor="f-fecha">Fecha</label>
            <div className="input-group">
              <FiCalendar className="ig-icon" aria-hidden />
              <input id="f-fecha" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-grado">Grado</label>
            <div className="input-group">
              <FiUsers className="ig-icon" aria-hidden />
              <select id="f-grado" value={grado} onChange={e=>setGrado(e.target.value)}>
                <option value="">Todos</option>
                {grados.map(g=><option key={`g-${g}`} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-docente">Docente</label>
            <div className="input-group">
              <FiUser className="ig-icon" aria-hidden />
              <select id="f-docente" value={docente} onChange={e=>setDocente(e.target.value)}>
                <option value="">Todos</option>
                {docentes.map(d=><option key={`d-${d}`} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-estado">Estado</label>
            <div className="input-group">
              <FiFilter className="ig-icon" aria-hidden />
              <select id="f-estado" value={estado} onChange={e=>setEstado(e.target.value)}>
                {ESTADOS.map(eo => <option key={`e-${eo.v}`} value={eo.v}>{eo.label}</option>)}
              </select>
            </div>
          </div>

          <div className="field field-full">
            <label htmlFor="f-buscar">Buscar</label>
            <div className="input-group">
              <FiSearch className="ig-icon" aria-hidden />
              <input
                id="f-buscar"
                placeholder="Nombre o carnet"
                value={q}
                onChange={e=>setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filters-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={()=>{ setGrado(''); setDocente(''); setEstado(''); setQ(''); }}
          >
            Limpiar filtros
          </button>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>

          <button
            type="button"
            className="btn export"
            onClick={()=>exportCSV(rows, fecha)}
            disabled={!rows.length}
            title="Exportar CSV"
          >
            <FiDownload style={{marginRight:6}}/> Exportar CSV
          </button>
        </div>
      </form>

      {/* Tabla */}
      {loading ? <p className="loading">Cargando…</p> : (
        rows.length ? (
          <div className="table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Carnet</th>
                  <th>Grado</th>
                  <th>Docente</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx)=>(
                  <tr key={`${r.alumno_id ?? 'na'}-${r.carnet ?? 'noc'}-${idx}`}>
                    <td>{r.nombre_completo}</td>
                    <td>{r.carnet}</td>
                    <td>{r.grado}</td>
                    <td>{r.docente_nombre || '—'}</td>
                    <td>
                      <span className={`badge ${
                        r.estado==='presente' ? 'ok' :
                        r.estado==='ausente' ? 'warn' :
                        r.estado==='tarde' ? 'late' : 'muted'
                      }`}>{r.estado}</span>
                    </td>
                    <td>{r.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty">No hay alumnos para los filtros seleccionados.</p>
      )}
    </div>
  );
}
