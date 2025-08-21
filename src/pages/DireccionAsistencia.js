import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

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
  const [sel, setSel] = useState(new Set()); // selección para masivo

  const fetch = async () => {
    setLoading(true);
    try{
      const { data } = await axios.get(`${API_BASE}/api/asistencia`, {
        params: { fecha, grado, docente, q, estado }
      });
      setRows(Array.isArray(data)? data : []);
      setSel(new Set());
    }catch(e){
      console.error(e);
      alert('Error cargando asistencia');
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetch(); /* eslint-disable-next-line */ }, [fecha, grado, docente, estado, q]);

  const grados = useMemo(()=>Array.from(new Set(rows.map(r=>r.grado).filter(Boolean))).sort(),[rows]);
  const docentes = useMemo(()=>Array.from(new Set(rows.map(r=>(r.docente_nombre||'').trim()).filter(Boolean))).sort(),[rows]);
  const seleccionados = useMemo(()=>rows.filter(r=>sel.has(r.alumno_id)),[rows, sel]);

  const toggleSel = (id) => {
    const copy = new Set(sel);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSel(copy);
  };

  const marcarFila = async (r, nuevoEstado) => {
    try{
      await axios.post(`${API_BASE}/api/asistencia/marcar`, {
        alumno_id: r.alumno_id, fecha, estado: nuevoEstado
      });
      setRows(prev => prev.map(x => x.alumno_id===r.alumno_id ? {...x, estado: nuevoEstado} : x));
    }catch(e){ console.error(e); alert('No se pudo marcar'); }
  };

  const marcarMasivo = async (nuevoEstado) => {
    if(!seleccionados.length) return;
    try{
      await axios.post(`${API_BASE}/api/asistencia/bulk`, {
        fecha, alumno_ids: seleccionados.map(r=>r.alumno_id), estado: nuevoEstado
      });
      setRows(prev => prev.map(x => sel.has(x.alumno_id) ? {...x, estado: nuevoEstado} : x));
      setSel(new Set());
    }catch(e){ console.error(e); alert('No se pudo marcar masivo'); }
  };

  return (
    <div className="page">
      <div className="header" style={{marginBottom:12}}>
        <h2>Asistencia — Dirección</h2>
        <div className="results-pill">{rows.length} alumno(s)</div>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
          </div>
          <div className="field">
            <label>Grado</label>
            <select value={grado} onChange={e=>setGrado(e.target.value)}>
              <option value="">Todos</option>
              {grados.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Docente</label>
            <select value={docente} onChange={e=>setDocente(e.target.value)}>
              <option value="">Todos</option>
              {docentes.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={estado} onChange={e=>setEstado(e.target.value)}>
              {ESTADOS.map(eo => <option key={eo.v} value={eo.v}>{eo.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Buscar</label>
            <input placeholder="Nombre o carnet" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
        </div>

        <div className="filters-actions" style={{gap:8}}>
          <button className="btn secondary" onClick={()=>{ setGrado(''); setDocente(''); setEstado(''); setQ(''); }}>
            Limpiar filtros
          </button>
          <button className="btn" onClick={()=>exportCSV(rows, fecha)} disabled={!rows.length}>
            Exportar CSV
          </button>
          <button className="btn" onClick={()=>marcarMasivo('presente')} disabled={!seleccionados.length}>
            Marcar Presente (selección)
          </button>
          <button className="btn" onClick={()=>marcarMasivo('ausente')} disabled={!seleccionados.length}>
            Marcar Ausente (selección)
          </button>
          <button className="btn" onClick={()=>marcarMasivo('tarde')} disabled={!seleccionados.length}>
            Marcar Tarde (selección)
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? <p className="loading">Cargando…</p> : (
        rows.length ? (
          <div className="table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th><input type="checkbox"
                    onChange={e=>{
                      if(e.target.checked){ setSel(new Set(rows.map(r=>r.alumno_id))); }
                      else setSel(new Set());
                    }}
                    checked={sel.size>0 && sel.size===rows.length}
                    aria-label="Seleccionar todos"
                  /></th>
                  <th>Nombre</th>
                  <th>Carnet</th>
                  <th>Grado</th>
                  <th>Docente</th>
                  <th>Estado</th>
                  <th className="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.alumno_id}>
                    <td><input type="checkbox" checked={sel.has(r.alumno_id)} onChange={()=>toggleSel(r.alumno_id)} /></td>
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
                    <td className="row-actions" style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      <select
                        value={r.estado}
                        onChange={e=>marcarFila(r, e.target.value)}
                      >
                        {ESTADOS.slice(1).map(eo=>(
                          <option key={eo.v} value={eo.v}>{eo.label}</option>
                        ))}
                        <option value="sin_registro">Sin registro</option>
                      </select>
                    </td>
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
