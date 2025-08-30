import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginDocente from './pages/LoginDocente';
import LoginDireccion from './pages/LoginDireccion';
import DashboardDocente from './pages/DashboardDocente';
import DashboardDireccion from './pages/DashboardDireccion';
import EscanearQR from './pages/EscanearQR';
import PerfilDocente from './pages/PerfilDocente';
import RegistroDocente from './pages/RegistroDocente';
import ListaDocentes from './pages/ListaDocentes';
import RegistrarAlumno from './pages/RegistrarAlumno';
import ConsultaAlumnos from './pages/ConsultaAlumnos';
import DocenteAlumnosAsignados from './pages/DocenteAlumnosAsignados';
import ListaAlumnos from './pages/ListaAlumnos';
import ReportesDocente from './pages/ReportesDocente';
import DireccionAsistencia from './pages/DireccionAsistencia';
import ReportesDireccion from './pages/ReportesDireccion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginDocente />} />
        <Route path="/direccion" element={<LoginDireccion />} />
        <Route path="/dashboard-docente" element={<DashboardDocente />} />
        <Route path="/dashboard-direccion" element={<DashboardDireccion />} />
        <Route path="/docente/escanear" element={<EscanearQR />} />
        <Route path="/direccion/escanear" element={<EscanearQR />} />
        <Route path="/docente/mi-perfil" element={<PerfilDocente />} />
        <Route path="/registro-docente" element={<RegistroDocente />} />
        <Route path="/lista-docentes" element={<ListaDocentes />} />
        <Route path="/registrar-alumnos" element={<RegistrarAlumno />} />
        <Route path="/consulta-alumnos" element={<ConsultaAlumnos />} />
        <Route path="/docente/alumnos" element={<DocenteAlumnosAsignados />} />
        <Route path="/alumnos" element={<ListaAlumnos />} />
        <Route path="/asistencia-general" element={<DireccionAsistencia />} />
        <Route path="/docente/reportes" element={<ReportesDocente />} />
        <Route path="/reportes-direccion" element={<ReportesDireccion />} />

        {/* Alias para compatibilidad con /direccion/reportes */}
        <Route path="/direccion/reportes" element={<ReportesDireccion />} />

        {/* (Opcional) catch-all al login de dirección si navegan a algo de /direccion desconocido */}
        {/* <Route path="/direccion/*" element={<Navigate to="/dashboard-direccion" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
