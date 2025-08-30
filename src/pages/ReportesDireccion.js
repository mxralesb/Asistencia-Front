import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import '../styles/ReportesDireccion.css';

const API_BASE = 'http://localhost:4000';

// helpers de fecha
const toYMD = (val) => {
  try {
    const d = val instanceof Date ? val : new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  } catch { return String(val); }
};
const todayYMD = () => toYMD(new Date());
const startOfWeekMonday = (d = new Date()) => {
  const day = d.getDay() === 0 ? 7 : d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0,0,0,0);
  return monday;
};
const subDays = (d = new Date(), n = 0) => {
  const out = new Date(d); out.setDate(out.getDate() - n); return out;
};

function exportCSV(rows, filename = 'reporte_direccion.csv') {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows.map(r => headers.map(h => esc(r[h])))]
    .map(r => r.join(',')).join('\n');
  const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const COLORS = ['#6f42c1', '#a26dd9', '#b5599d'];

export default function ReportesDireccion(){
  const navigate = useNavigate();

  // rangos por defecto: semana actual
  const [desde, setDesde] = useState(toYMD(startOfWeekMonday(new Date())));
  const [hasta, setHasta] = useState(todayYMD());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // data
  const [kpis, setKpis] = useState({ total:0, presente:0, tarde:0, ausente:0, cobertura:0 });
  const [serie, setSerie] = useState([]);
  const [porGrado, setPorGrado] = useState([]);       // [{grado, presente, tarde, ausente, total}]
  const [porDocente, setPorDocente] = useState([]);   // [{docente, presente, tarde, ausente, total}]
  const [topAusentes, setTopAusentes] = useState([]); // [{alumno, ausencias}]
  const [rawCsv, setRawCsv] = useState([]);

  const cancelRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (cancelRef.current) cancelRef.current.abort();
    const ctrl = new AbortController();
    cancelRef.current = ctrl;
    setLoading(true); setErr('');

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        axios.get(`${API_BASE}/api/direccion/reportes/resumen`,      { params: { desde, hasta }, headers, signal: ctrl.signal }),
        axios.get(`${API_BASE}/api/direccion/reportes/serie`,        { params: { desde, hasta }, headers, signal: ctrl.signal }),
        axios.get(`${API_BASE}/api/direccion/reportes/por-grado`,    { params: { desde, hasta }, headers, signal: ctrl.signal }),
        axios.get(`${API_BASE}/api/direccion/reportes/por-docente`,  { params: { desde, hasta }, headers, signal: ctrl.signal }),
        axios.get(`${API_BASE}/api/direccion/reportes/top-ausentes`, { params: { desde, hasta, limit: 8 }, headers, signal: ctrl.signal }),
        axios.get(`${API_BASE}/api/direccion/reportes/raw-csv`,      { params: { desde, hasta }, headers, signal: ctrl.signal }),
      ]);

      setKpis(r1.data || {});
      setSerie(Array.isArray(r2.data) ? r2.data : []);
      setPorGrado(Array.isArray(r3.data) ? r3.data : []);
      setPorDocente(Array.isArray(r4.data) ? r4.data : []);
      setTopAusentes(Array.isArray(r5.data) ? r5.data : []);
      setRawCsv(Array.isArray(r6.data) ? r6.data : []);
    } catch (e) {
      if (!axios.isCancel(e)) {
        console.error(e);
        setErr(e?.response?.data?.error || 'No se pudieron cargar los reportes.');
      }
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(()=>{ fetchAll(); }, [fetchAll]);

  // chips
  const setHoy = () => { const h = todayYMD(); setDesde(h); setHasta(h); };
  const setSem = () => { setDesde(toYMD(startOfWeekMonday(new Date()))); setHasta(todayYMD()); };
  const set30 = () => { const hoy = new Date(); setDesde(toYMD(subDays(hoy,29))); setHasta(toYMD(hoy)); };
  const isSame = (d1,h1,d2,h2) => d1===d2 && h1===h2;

  const activeHoy = isSame(desde, hasta, todayYMD(), todayYMD());
  const activeSem = isSame(desde, hasta, toYMD(startOfWeekMonday(new Date())), todayYMD());
  const active30  = isSame(desde, hasta, toYMD(subDays(new Date(),29)), todayYMD());

  const pieData = useMemo(()=>[
    { name: 'Presente', value: Number(kpis.presente || 0) },
    { name: 'Tarde',    value: Number(kpis.tarde || 0) },
    { name: 'Ausente',  value: Number(kpis.ausente || 0) },
  ], [kpis]);

  return (
    <div className="repdir-wrap">
      <div className="repdir-topbar">
        <button className="btn-back" onClick={() => navigate('/dashboard-direccion')}>
          <FiArrowLeft/> Volver
        </button>
        <h2>Reportes — Dirección</h2>
        <div className="right-actions">
          <button className="btn ghost" onClick={fetchAll}><FiRefreshCw/> Actualizar</button>
          <button className="btn" disabled={!rawCsv.length}
            onClick={()=>exportCSV(rawCsv, `reporte_direccion_${desde}_a_${hasta}.csv`)}>
            <FiDownload/> Exportar CSV
          </button>
        </div>
      </div>

      {err ? <div className="error-banner">{err}</div> : null}

      {/* Filtros */}
      <div className="repdir-filters">
        <div className="chips">
          <button className={`chip ${activeHoy ? 'active':''}`} onClick={setHoy}>Hoy</button>
          <button className={`chip ${activeSem ? 'active':''}`} onClick={setSem}>Esta semana</button>
          <button className={`chip ${active30 ? 'active':''}`} onClick={set30}>Últimos 30 días</button>
        </div>
        <div className="dates">
          <label>Desde<input type="date" value={desde} onChange={e=>setDesde(e.target.value)}/></label>
          <label>Hasta<input type="date" value={hasta} onChange={e=>setHasta(e.target.value)}/></label>
        </div>
      </div>

      {/* KPIs */}
      <div className="repdir-kpis">
        <div className="kpi"><div className="kpi-label">Registros</div><div className="kpi-value">{kpis.total ?? 0}</div></div>
        <div className="kpi"><div className="kpi-label">Cobertura</div><div className="kpi-value">{(kpis.cobertura ?? 0).toFixed(0)}%</div><div className="kpi-sub">alumnos con marca</div></div>
      </div>

      {/* Grids */}
      <div className="repdir-grid">
        {/* Tendencia */}
        <div className="card">
          <h3>Tendencia de estados</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={serie}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="presente" name="Presente" stroke="#6f42c1" />
                  <Line type="monotone" dataKey="tarde"    name="Tarde"    stroke="#a26dd9" />
                  <Line type="monotone" dataKey="ausente"  name="Ausente"  stroke="#b5599d" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="card">
          <h3>Composición global</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip /><Legend />
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Por grado */}
        <div className="card">
          <h3>Estados por grado</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : (
              porGrado.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={porGrado}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grado" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="presente" name="Presente" fill="#6f42c1" />
                    <Bar dataKey="tarde"    name="Tarde"    fill="#a26dd9" />
                    <Bar dataKey="ausente"  name="Ausente"  fill="#b5599d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="muted">Sin datos para el rango.</p>
            )}
          </div>
        </div>

        {/* Por docente */}
        <div className="card">
          <h3>Estados por docente</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : (
              porDocente.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={porDocente}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="docente" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="presente" name="Presente" fill="#6f42c1" />
                    <Bar dataKey="tarde"    name="Tarde"    fill="#a26dd9" />
                    <Bar dataKey="ausente"  name="Ausente"  fill="#b5599d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="muted">Sin datos para el rango.</p>
            )}
          </div>
          {porDocente.length ? (
            <ul className="rank-list">
              {porDocente.map((d,i)=>(
                <li key={d.docente + i}>
                  {i+1}. {d.docente} — Total {d.total}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Top ausentes */}
        <div className="card">
          <h3>Top ausencias (alumno)</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : (
              topAusentes.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topAusentes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="alumno" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="ausencias" name="Ausencias" fill="#b5599d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="muted">Sin ausencias en el rango.</p>
            )}
          </div>
          {topAusentes.length ? (
            <ul className="rank-list">
              {topAusentes.map((r,i)=>(
                <li key={r.alumno + i}>{i+1}. {r.alumno} — {r.ausencias}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
