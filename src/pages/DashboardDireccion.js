// src/pages/DashboardDireccion.jsx
import { useNavigate } from 'react-router-dom';
import {
  FaUserEdit,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaChild,
  FaCalendar,
  FaClock
} from 'react-icons/fa';
import '../styles/DashboardDireccion.css';

const DashboardDireccion = () => {
  const navigate = useNavigate();
  const irA = (ruta) => () => navigate(ruta);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/direccion');
  };

  return (
    <div className="dashboard-container">
      {/* Topbar */}
      <div className="dashboard-header-bar">
        <h1 className="dashboard-header">Panel de Dirección</h1>

        <div className="dashboard-actions">
          {/* OJO: verifica que exista la ruta /direccion/perfil en tu App.jsx */}
          <button type="button" className="dashboard-btn" onClick={irA('/direccion/perfil')}>
            <FaUserEdit className="btn-icon" /> Mi perfil
          </button>

          <button type="button" className="dashboard-btn logout" onClick={handleLogout}>
            <FaSignOutAlt className="btn-icon" /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="card-grid">
        <button type="button" className="dashboard-card" onClick={irA('/registro-docente')}>
          <FaUserEdit className="card-icon" />
          <h2 className="card-title">Registrar Docentes</h2>
          <p className="card-description">Agregar docentes.</p>
        </button>

        <button type="button" className="dashboard-card" onClick={irA('/lista-docentes')}>
          <FaChalkboardTeacher className="card-icon" />
          <h2 className="card-title">Lista de Docentes</h2>
          <p className="card-description">Ver y editar los docentes registrados.</p>
        </button>

        <button type="button" className="dashboard-card" onClick={irA('/alumnos')}>
          <FaChild className="card-icon" />
          <h2 className="card-title">Gestión de Alumnos</h2>
          <p className="card-description">Ver y gestionar alumnos por grado.</p>
        </button>

        <button type="button" className="dashboard-card" onClick={irA('/asistencia-general')}>
          <FaCalendar className="card-icon" />
          <h2 className="card-title">Asistencia (lista)</h2>
          <p className="card-description">Revisar por fecha y grado.</p>
        </button>

        {/* NUEVO: Reportes/Dashboard dirección */}
        <button type="button" className="dashboard-card" onClick={irA('/reportes-direccion')}>
          <FaClock className="card-icon" />
          <h2 className="card-title">Dashboard de Asistencia</h2>
          <p className="card-description">Gráficas y reportes globales.</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardDireccion;
