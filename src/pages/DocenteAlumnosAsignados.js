
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiBarChart2, FiDownload, FiX, FiCamera } from 'react-icons/fi';
import '../styles/DocenteAlumnosAsignados.css';

const API_BASE = 'http://localhost:4000';

function toYMD(val) {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (typeof val === 'string' && val.length >= 10) return val.slice(0, 10);
  try {
    const d = val instanceof Date ? val : new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  } catch {
    return String(val);
  }
}
function todayYMD() {
  return toYMD(new Date());
}
function startOfWeekMonday(d = new Date()) {
  
  const day = d.getDay() === 0 ? 7 : d.getDay(); // 1..7
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
function subDays(d = new Date(), n = 0) {
  const out = new Date(d);
  out.setDate(out.getDate() - n);
  return out;
}

function extractHoraFromObs(observaciones) {
  if (!observaciones) return '';
  const m = String(observaciones).match(/([0-2][0-9]:[0-5][0-9])/);
  return m ? m[1] : '';
}


function descargarQR(alumno) {
  if (!alumno) return;
  if (alumno.qr_codigo) {
    const a = document.createElement('a');
    a.href = alumno.qr_codigo;
    a.download = `QR-${(alumno.carnet || alumno.id || 'alumno')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else if (alumno.id) {
    window.open(`${API_BASE}/api/alumnos/${alumno.id}/qr`, '_blank');
  }
}

function exportarCSV(rows, filename = 'reporte_alumno.csv') {
  const headers = ['Fecha', 'Estado', 'Registrado por', 'Hora', 'Observaciones'];
  const lines = rows.map(r => [
    toYMD(r.fecha_fmt || r.fecha),
    r.estado ?? '',
    r.docente_nombre ?? '',
    r.hora || extractHoraFromObs(r.observaciones) || '',
    r.observaciones ?? ''
  ]);
  const esc = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...lines].map(r => r.map(esc).join(',')).join('\n');
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const ReporteAlumnoModal = ({ alumno, abierto, onClose }) => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [rows, setRows] = useState([]);
  const [cargando, setCargando] = useState(false);

  const normalizeRows = (arr) => {
    return (arr || []).map((r, idx) => {
      const fecha_fmt = toYMD(r.fecha);
      const hora = r.hora || extractHoraFromObs(r.observaciones) || '';
      return { ...r, fecha_fmt, hora, __rowid: `${fecha_fmt}-${idx}` };
    });
  };

  
  const rangoHoy = () => {
    const hoy = todayYMD();
    return { d: hoy, h: hoy };
  };
  const rangoSemana = () => {
    const d = startOfWeekMonday(new Date());
    return { d: toYMD(d), h: todayYMD() };
  };
  const rango30 = () => {
    const hoy = new Date();
    const d = subDays(hoy, 29);
    return { d: toYMD(d), h: toYMD(hoy) };
  };
  const isSameRange = (d, h, target) => d === target().d && h === target().h;

  const aplicarRango = (which) => {
    const map = {
      hoy: rangoHoy,
      semana: rangoSemana,
      m30: rango30
    };
    const fn = map[which];
    if (!fn) return;
    const { d, h } = fn();
    setDesde(d);
    setHasta(h);
  };


  useEffect(() => {
    if (!abierto) return;
    (async () => {
      try {
        setCargando(true);
        const r = await axios.get(`${API_BASE}/api/reportes/alumno/${alumno.id}`, {
          params: { desde: desde || undefined, hasta: hasta || undefined },
        });
        const data = Array.isArray(r.data) ? r.data : (r.data.registros || []);
        setRows(normalizeRows(Array.isArray(data) ? data : []));
      } catch (e) {
        console.error(e);
        alert('Error cargando reporte');
      } finally {
        setCargando(false);
      }
    })();
  }, [abierto, alumno, desde, hasta]); 

  if (!abierto || !alumno) return null;

  const totales = rows.reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] || 0) + 1;
    return acc;
  }, {});

  const activeHoy = isSameRange(desde, hasta, rangoHoy);
  const activeSemana = isSameRange(desde, hasta, rangoSemana);
  const active30 = isSameRange(desde, hasta, rango30);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Reporte — {alumno.nombre_completo}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" title="Descargar QR del alumno" onClick={() => descargarQR(alumno)}>
              <FiCamera size={18} />Descargar Qr
            </button>
            <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="quick-filters" aria-label="Filtros rápidos">
          <button
            type="button"
            className={`chip ${activeHoy ? 'active' : ''}`}
            onClick={() => aplicarRango('hoy')}
            title="Ver solo los registros de hoy"
          >
            Hoy
          </button>
          <button
            type="button"
            className={`chip ${activeSemana ? 'active' : ''}`}
            onClick={() => aplicarRango('semana')}
            title="Desde el lunes hasta hoy"
          >
            Esta semana
          </button>
          <button
            type="button"
            className={`chip ${active30 ? 'active' : ''}`}
            onClick={() => aplicarRango('m30')}
            title="Últimos 30 días"
          >
            Últimos 30 días
          </button>
        </div>

        {/* Filtros manuales */}
        <div className="filtros-inline">
          <div>
            <label>Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div>
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
          <button
            className="btn"
            onClick={() => exportarCSV(rows, `reporte_${alumno.carnet || alumno.id}.csv`)}
            disabled={!rows.length}
            title="Exportar CSV"
          >
            <FiDownload style={{ marginRight: 6 }} /> Exportar CSV
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
                  <th>Registrado por</th>
                  <th>Hora</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.__rowid}>
                    <td>{r.fecha_fmt}</td>
                    <td>
                      <span className={
                        r.estado === 'presente' ? 'badge ok' :
                        r.estado === 'tarde' ? 'badge late' :
                        r.estado === 'ausente' ? 'badge warn' : 'badge muted'
                      }>
                        {r.estado}
                      </span>
                    </td>
                    <td>{r.docente_nombre || '—'}</td>
                    <td>{r.hora || '—'}</td>
                    <td>{r.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">No hay registros.</p>}
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
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE}/api/docente/alumnos`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setGrado(data?.docente?.grado || '');
        setLista(Array.isArray(data?.alumnos) ? data.alumnos : []);
      } catch (e) {
        console.error(e);
        alert('No se pudieron cargar tus alumnos. Verifica tu sesión.');
      }
    })();
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
  <div className="rd-wrap">
    <div className="rd-header">
      <button
        className="rd-back"
        type="button"
        onClick={() => navigate('/dashboard-docente')}
      >
        ← Volver al Dashboard
      </button>

       <h1 className="titulo-escanear" style={{ marginLeft: 12, flex: 1 }}>
        Alumnos asignados — {grado || 'Sin grado'}
      </h1>
    </div>

   


   <div className="cards-grid">
  {filtrados.map(a => (
    <div className="alumno-card" key={a.id}>

      {/* Columna izquierda: avatar + info */}
      <div
        className="al-left"
        style={{
          display: 'grid',
          gridTemplateColumns: '56px 1fr',
          gap: '0.9rem',
          alignItems: 'center',
          minWidth: 0,                 // permite elipsis
          paddingRight: '.5rem'
        }}
      >
        <div className="avatar">
          {(a.nombre_completo || '?').slice(0, 1)}
        </div>

        <div className="info" style={{minWidth: 0}}>
          <div className="name" title={a.nombre_completo}>
            {a.nombre_completo}
          </div>
          <div className="meta">
            <span className="tag">{a.carnet}</span>
            <span className="tag">{a.grado}</span>
          </div>
        </div>
      </div>

      {/* Columna derecha: botón (ancho propio, sin superponer) */}
      <div
        className="al-right"
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: 'fit-content'     // evita que se colapse
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() => { setSel(a); setAbierto(true); }}
          style={{ whiteSpace: 'nowrap' }}
        >
          <FiBarChart2 style={{ marginRight: 6 }} />
          Ver reporte
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
