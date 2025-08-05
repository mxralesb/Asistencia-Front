import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaSignOutAlt, FaChalkboardTeacher, FaChild, FaCalendar } from 'react-icons/fa'; // ✅ Importar íconos
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
      <div className="dashboard-header-bar">
        <h1 className="dashboard-header">Panel de Dirección</h1>

        <div className="dashboard-actions">
          <button className="dashboard-btn" onClick={irA('/direccion/perfil')}>
            <FaUserEdit className="btn-icon" /> Mi perfil
          </button>
          <button className="dashboard-btn logout" onClick={handleLogout}>
          <FaSignOutAlt className="btn-icon" /> Cerrar sesión
          </button>
        </div>
      </div>

      <div className="card-grid">
  <div className="dashboard-card" onClick={irA('/registro-docente')}>
    <FaUserEdit className="card-icon" />
    <h2 className="card-title">Registrar Docentes</h2>
    <p className="card-description">Agregar, editar o eliminar docentes.</p>
  </div>

    <div className="dashboard-card" onClick={irA('/lista-docentes')}>
    <FaChalkboardTeacher className="card-icon" />
    <h2 className="card-title">Lista de Docentes</h2>
    <p className="card-description">Ver docentes registrados en el sistema.</p>
  </div>


  <div className="dashboard-card" onClick={irA('/alumnos')}>
    <FaChild className="card-icon" />
    <h2 className="card-title">Lista de Alumnos</h2>
    <p className="card-description">Ver y gestionar alumnos por grado.</p>
  </div>

  <div className="dashboard-card" onClick={irA('/asistencia-general')}>
    <FaCalendar className="card-icon" />
    <h2 className="card-title">Asistencia General</h2>
    <p className="card-description">Revisar reportes por fecha y grado.</p>
  </div>
</div>
    </div>
  );
};

export default DashboardDireccion;
