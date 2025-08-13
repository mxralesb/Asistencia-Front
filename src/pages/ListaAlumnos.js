import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrarAlumno from './RegistrarAlumno';
import ConsultaAlumnos from './ConsultaAlumnos';
import '../styles/ListaAlumnos.css';

const ListaAlumnos = () => {
  const [vista, setVista] = useState('registro');
  const navigate = useNavigate();

  return (
    <div className="lista-alumnos-container">
      <button
        className="btn-volver"
        onClick={() => navigate('/dashboard-direccion')}
        aria-label="Volver al dashboard"
      >
        ← Volver al Dashboard
      </button>

      <h1>Gestión de Alumnos</h1>

      <nav className="botones-navegacion" role="tablist" aria-label="Navegación de vistas">
        <button
          role="tab"
          aria-selected={vista === 'registro'}
          aria-controls="registro-panel"
          id="registro-tab"
          className={vista === 'registro' ? 'activo' : ''}
          onClick={() => setVista('registro')}
        >
          Registrar Alumno
        </button>
        <button
          role="tab"
          aria-selected={vista === 'consulta'}
          aria-controls="consulta-panel"
          id="consulta-tab"
          className={vista === 'consulta' ? 'activo' : ''}
          onClick={() => setVista('consulta')}
        >
          Consultar Alumnos
        </button>
      </nav>

      <section
        id="registro-panel"
        role="tabpanel"
        aria-labelledby="registro-tab"
        hidden={vista !== 'registro'}
        className="vista-activa"
      >
        <RegistrarAlumno />
      </section>

      <section
        id="consulta-panel"
        role="tabpanel"
        aria-labelledby="consulta-tab"
        hidden={vista !== 'consulta'}
        className="vista-activa"
      >
        <ConsultaAlumnos />
      </section>
    </div>
  );
};

export default ListaAlumnos;
