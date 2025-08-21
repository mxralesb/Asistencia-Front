import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiBarChart2, FiDownload, FiX } from 'react-icons/fi';
import '../styles/DocenteAlumnosAsignados.css';

const API_BASE = 'http://localhost:4000';
const DOCENTE_ID_DEFAULT = Number(localStorage.getItem('docente_id')) || 1;

function exportarCSV(rows, filename = 'reporte_alumno.csv') {
  const headers = ['Fecha', 'Estado', 'Observaciones'];
  const lines = rows.map(r => ([
    r.fecha ?? '',
    r.estado ?? '',
    r.observaciones ?? ''
  ]));
  const esc = v => `"${String(v).replace(/"/g,'""')}"`;
  const csv = [headers, ...lines].map(r => r.map(esc).join(',')).join('\n');
  const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const ReporteAlumnoModal = ({ alumno, abierto, onClose }) => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [rows, setRows] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto || !alumno) return;
    const fetch = async () => {
      try {
        setCargando(true);
        const r = await axios.get(`${API_BASE}/api/reportes/alumno/${alumno.id}`, {
          params: { desde: desde || undefined, hasta: hasta || undefined }
        });
        setRows(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        console.error(e);
        alert('Error cargando reporte');
      } finally { setCargando(false); }
    };
    fetch();
  }, [abierto, alumno, desde, hasta]);

  if (!abierto || !alumno) return null;

  const totales = rows.reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Reporte — {alumno.nombre_completo}</h3>
          <button className="icon-btn" onClick={onClose}><FiX size={18}/></button>
        </div>

        <div className="filtros-inline">
          <div>
            <label>Desde</label>
            <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} />
          </div>
          <div>
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} />
          </div>
          <button
            className="btn"
            onClick={() => exportarCSV(rows, `reporte_${alumno.carnet || alumno.id}.csv`)}
            disabled={!rows.length}
            title="Exportar CSV"
          >
            <FiDownload style={{marginRight:6}}/> Exportar CSV
          </button>
        </div>

        <div className="totales">
          <span>Total: <strong>{rows.length}</strong></span>
          <span className="ok">Presente: <strong>{totales.presente || 0}</strong></span>
          <span className="late">Tarde: <strong>{totales.tarde || 0}</strong></span>
          <span className="warn">Ausente: <strong>{totales.ausente || 0}</strong></span>
        </div>

        {cargando ? (
          <p className="muted">Cargando…</p>
        ) : rows.length ? (
          <div className="tabla-simple">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.fecha}</td>
                    <td>
                      <span className={
                        r.estado==='presente' ? 'badge ok' :
                        r.estado==='tarde' ? 'badge late' :
                        r.estado==='ausente' ? 'badge warn' : 'badge muted'
                      }>
                        {r.estado}
                      </span>
                    </td>
                    <td>{r.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No hay registros.</p>
        )}
      </div>
    </div>
  );
};

const DocenteAlumnosAsignados = () => {
  const [lista, setLista] = useState([]);
  const [grado, setGrado] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const didFetch = useRef(false);           
  const triedFallback = useRef(false);      
  useEffect(() => {
    const docenteId = Number(localStorage.getItem('docente_id')) || DOCENTE_ID_DEFAULT;

    const fetch = async (idToUse) => {
      try {
        const r = await axios.get(`${API_BASE}/api/docente/${idToUse}/alumnos`);

        const gradoApi = r.data?.docente?.grado || r.data?.grado || '';
        const alumnosApi = Array.isArray(r.data?.alumnos) ? r.data.alumnos : [];

        
        if (r.data?.docente?.id) {
          localStorage.setItem('docente_id', String(r.data.docente.id));
        }

        setGrado(gradoApi);
        setLista(alumnosApi);
      } catch (e) {
        
        const status = e?.response?.status;
        if (status === 404 && !triedFallback.current) {
          triedFallback.current = true;
          try {
            const dbg = await axios.get(`${API_BASE}/api/docente/debug/list`);
            const firstDocente = (Array.isArray(dbg.data) ? dbg.data : []).find(d => d.activo && d.grado && String(d.rol).toLowerCase() === 'docente');
            if (firstDocente?.id) {
              localStorage.setItem('docente_id', String(firstDocente.id));
              return fetch(firstDocente.id); // reintento con el primero activo
            }
            alert('No hay docentes activos con grado asignado.');
          } catch (errDbg) {
            console.error('debug/list error:', errDbg);
            alert('Docente no encontrado o sin grado asignado.');
          }
        } else {
          console.error(e);
          alert('Error cargando alumnos del docente');
        }
      }
    };

    if (!didFetch.current) {
      didFetch.current = true;
      fetch(docenteId);
    }
  }, []);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(a =>
      !t ||
      (a.nombre_completo || '').toLowerCase().includes(t) ||
      (a.carnet || '').toLowerCase().includes(t)
    );
  }, [lista, q]);

  return (
    <div className="docente-wrap">
      <div className="topbar">
        <h2>Alumnos asignados — {grado || 'Sin grado'}</h2>
        <div className="search">
          <FiSearch/>
          <input
            placeholder="Buscar por nombre o carnet"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="cards-grid">
        {filtrados.map(a => (
          <div className="alumno-card" key={a.id}>
            <div className="avatar">{(a.nombre_completo||'?').slice(0,1)}</div>
            <div className="info">
              <div className="name">{a.nombre_completo}</div>
              <div className="meta">
                <span className="tag">{a.carnet}</span>
                <span className="tag">{a.grado}</span>
              </div>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => { setSel(a); setAbierto(true); }}>
                <FiBarChart2 style={{marginRight:6}}/> Ver reporte
              </button>
            </div>
          </div>
        ))}
      </div>

      <ReporteAlumnoModal
        alumno={sel}
        abierto={abierto}
        onClose={() => setAbierto(false)}
      />
    </div>
  );
};

export default DocenteAlumnosAsignados;
