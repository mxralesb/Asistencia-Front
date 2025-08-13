import React from 'react';
import '../styles/DashboardDocente.css';
import { 
  FaQrcode, 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaChartBar, 
  FaSignOutAlt, 
  FaUserEdit 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    icon: FaQrcode,
    title: 'Escanear QR',
    description: 'Registrar asistencia con código QR en tiempo real.',
    path: '/docente/escanear',
  },
  {
    icon: FaUserGraduate,
    title: 'Alumnos asignados',
    description: 'Consulta y gestiona a los estudiantes bajo tu guía.',
    path: '/docente/alumnos',
  },
  {
    icon: FaCalendarAlt,
    title: 'Fechas & Jornadas',
    description: 'Visualiza y administra los días de clase y asistencia.',
    path: '/docente/fechas',
  },
  {
    icon: FaChartBar,
    title: 'Reportes',
    description: 'Revisa estadísticas de asistencia en tablas y gráficas.',
    path: '/docente/reportes',
  },
];

const DashboardDocente = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-bar">
        <h1 className="dashboard-header">Panel del Docente</h1>
        <div className="dashboard-actions">
          <button
            type="button"
            className="dashboard-btn"
            onClick={() => navigate('/docente/mi-perfil')}
            aria-label="Ir a Mi perfil"
          >
            <FaUserEdit className="btn-icon" /> Mi perfil
          </button>
          <button
            type="button"
            className="dashboard-btn logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt className="btn-icon" /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="card-grid">
        {cards.map(({ icon: Icon, title, description, path }) => (
          <div
            key={title}
            className="dashboard-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(path)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') navigate(path);
            }}
            aria-label={`Ir a ${title}`}
          >
            <Icon className="card-icon" />
            <h2 className="card-title">{title}</h2>
            <p className="card-description">{description}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default DashboardDocente;
