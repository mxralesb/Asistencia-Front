import React from 'react';
import '../styles/DashboardDocente.css';
import { FaQrcode, FaUserGraduate, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashboardDocente = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Panel del Docente</h1>

      <div className="card-grid">
        <div className="dashboard-card" onClick={() => navigate('/docente/escanear')}>
          <FaQrcode className="card-icon" />
          <h2 className="card-title">Escanear QR</h2>
          <p className="card-description">Registrar asistencia con código QR en tiempo real.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/docente/alumnos')}>
          <FaUserGraduate className="card-icon" />
          <h2 className="card-title">Alumnos asignados</h2>
          <p className="card-description">Consulta y gestiona a los estudiantes bajo tu guía.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/docente/fechas')}>
          <FaCalendarAlt className="card-icon" />
          <h2 className="card-title">Fechas & Jornadas</h2>
          <p className="card-description">Visualiza y administra los días de clase y asistencia.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/docente/reportes')}>
          <FaChartBar className="card-icon" />
          <h2 className="card-title">Reportes</h2>
          <p className="card-description">Revisa estadísticas de asistencia en tablas y gráficas.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDocente;
