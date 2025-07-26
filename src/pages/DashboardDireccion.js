import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaSignOutAlt } from 'react-icons/fa'; 

const DashboardDireccion = () => {
  const navigate = useNavigate();

  const irA = (ruta) => () => navigate(ruta);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login-direccion');
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

      <div className="direccion-card-grid">
        <div className="direccion-card" onClick={irA('/registro-docente')}>
          <h3>Registrar Docentes</h3>
          <p>Agregar, editar o eliminar docentes</p>
        </div>

        <div className="direccion-card" onClick={irA('/lista-alumnos')}>
          <h3>Lista de Alumnos</h3>
          <p>Ver y gestionar alumnos por grado</p>
        </div>

        <div className="direccion-card" onClick={irA('/asistencia-general')}>
          <h3>Asistencia General</h3>
          <p>Revisar reportes por fecha y grado</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDireccion;
