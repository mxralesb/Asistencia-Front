// src/pages/ReportesDocente.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import '../styles/ReportesDocente.css';

const API_BASE = 'http://localhost:4000';
const REPORTS_BASE = `${API_BASE}/api/docente/reportes`;

// helpers fecha
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
  const day = d.getDay() === 0 ? 7 : d.getDay(); // 1..7
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
};
const subDays = (d = new Date(), n = 0) => {
  const out = new Date(d);
  out.setDate(out.getDate() - n);
  return out;
};

// export csv
function exportCSV(rows, filename = 'reporte_docente.csv') {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows.map(r => headers.map(h => esc(r[h])))].map(r => r.join(',')).join('\n');
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const COLORS = ['#6f42c1', '#a26dd9', '#b5599d']; // presente, tarde, ausente

export default function ReportesDocente() {
  const navigate = useNavigate();

  // rango por defecto: semana actual
  const [desde, setDesde] = useState(toYMD(startOfWeekMonday(new Date())));
  const [hasta, setHasta] = useState(todayYMD());

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // data
  const [kpis, setKpis] = useState({ total: 0, presente: 0, tarde: 0, ausente: 0, cobertura: 0, puntualidad: 0 });
  const [serie, setSerie] = useState([]);                 // [{fecha, presente, tarde, ausente}]
  const [rankingAusentes, setRankingAusentes] = useState([]); // [{alumno, ausencias}]
  const [rawForCsv, setRawForCsv] = useState([]);         // tabla base para CSV

  const cancelar = useRef(null);

  const fetchAll = useCallback(async () => {
    if (cancelar.current) cancelar.current.abort();
    const ctrl = new AbortController();
    cancelar.current = ctrl;

    setLoading(true);
    setErr('');

    try {
      const token = localStorage.getItem('token');
      const docente_id = Number(localStorage.getItem('docente_id')) || undefined; // fallback si no hay JWT
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

    
      const [r1, r2, r3, r4] = await Promise.all([
        axios.get(`${REPORTS_BASE}/resumen`,      { params: { desde, hasta, docente_id }, headers, signal: ctrl.signal }),
        axios.get(`${REPORTS_BASE}/serie`,        { params: { desde, hasta, docente_id }, headers, signal: ctrl.signal }),
        axios.get(`${REPORTS_BASE}/top-ausentes`, { params: { desde, hasta, limit: 8, docente_id }, headers, signal: ctrl.signal }),
        axios.get(`${REPORTS_BASE}/raw-csv`,      { params: { desde, hasta, docente_id }, headers, signal: ctrl.signal }),
      ]);

      setKpis(r1.data || {});
      setSerie(Array.isArray(r2.data) ? r2.data : []);
      setRankingAusentes(Array.isArray(r3.data) ? r3.data : []);
      setRawForCsv(Array.isArray(r4.data) ? r4.data : []);
    } catch (e) {
      if (axios.isCancel(e)) return;
      console.error(e);
      setErr(e?.response?.data?.error || 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // chips
  const setHoy = () => { const h = todayYMD(); setDesde(h); setHasta(h); };
  const setSemana = () => { setDesde(toYMD(startOfWeekMonday(new Date()))); setHasta(todayYMD()); };
  const set30 = () => { const hoy = new Date(); setDesde(toYMD(subDays(hoy, 29))); setHasta(toYMD(hoy)); };
  const isSame = (d1, h1, d2, h2) => d1 === d2 && h1 === h2;

  const activeHoy = isSame(desde, hasta, todayYMD(), todayYMD());
  const activeSem = isSame(desde, hasta, toYMD(startOfWeekMonday(new Date())), todayYMD());
  const active30 = isSame(desde, hasta, toYMD(subDays(new Date(), 29)), todayYMD());

  // pie data
  const pieData = useMemo(() => [
    { name: 'Presente', value: Number(kpis.presente || 0) },
    { name: 'Tarde', value: Number(kpis.tarde || 0) },
    { name: 'Ausente', value: Number(kpis.ausente || 0) },
  ], [kpis]);

  return (
    <div className="repd-wrap">
      <div className="repd-topbar">
        <button className="btn-back" onClick={() => navigate('/dashboard-docente')}>
          <FiArrowLeft /> Volver
        </button>
        <h2>Rendimiento del Docente</h2>
        <div className="right-actions">
          <button className="btn ghost" onClick={fetchAll} title="Recargar">
            <FiRefreshCw /> Actualizar
          </button>
          <button
            className="btn"
            onClick={() => exportCSV(rawForCsv, `reporte_docente_${desde}_a_${hasta}.csv`)}
            disabled={!rawForCsv.length}
          >
            <FiDownload /> Exportar CSV
          </button>
        </div>
      </div>

      {err ? <div className="error-banner">{err}</div> : null}

      {/* Filtros */}
      <div className="repd-filters">
        <div className="chips">
          <button className={`chip ${activeHoy ? 'active' : ''}`} onClick={setHoy}>Hoy</button>
          <button className={`chip ${activeSem ? 'active' : ''}`} onClick={setSemana}>Esta semana</button>
          <button className={`chip ${active30 ? 'active' : ''}`} onClick={set30}>Últimos 30 días</button>
        </div>
        <div className="dates">
          <label>
            Desde
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </label>
        </div>
      </div>

      {/* KPIs */}
      <div className="repd-kpis">
        <div className="kpi">
          <div className="kpi-label">Registros</div>
          <div className="kpi-value">{kpis.total ?? 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Puntualidad</div>
          <div className="kpi-value">{(kpis.puntualidad ?? 0).toFixed(0)}%</div>
          <div className="kpi-sub">presente / total</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Cobertura</div>
          <div className="kpi-value">{(kpis.cobertura ?? 0).toFixed(0)}%</div>
          <div className="kpi-sub">alumnos con marca</div>
        </div>
      </div>

      {/* Grids de charts */}
      <div className="repd-grid">
        {/* Serie temporal */}
        <div className="card">
          <h3>Tendencia de asistencia</h3>
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
                  <Line type="monotone" dataKey="tarde" name="Tarde" stroke="#a26dd9" />
                  <Line type="monotone" dataKey="ausente" name="Ausente" stroke="#b5599d" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie de composición */}
        <div className="card">
          <h3>Composición por estado</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Ranking de ausentes */}
        <div className="card">
          <h3>Top ausencias por alumno</h3>
          <div className="chart-wrap">
            {loading ? <p className="muted">Cargando…</p> : rankingAusentes.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rankingAusentes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="alumno" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="ausencias" name="Ausencias" fill="#b5599d" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="muted">Sin ausencias en el rango.</p>}
          </div>
          {rankingAusentes.length ? (
            <ul className="rank-list">
              {rankingAusentes.map((r, i) => (
                <li key={`${r.alumno}-${i}`}>{i + 1}. {r.alumno} — {r.ausencias}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
