import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrarAlumno from './RegistrarAlumno';
import ConsultaAlumnos from './ConsultaAlumnos';
import '../styles/ListaAlumnos.css';

const ListaAlumnos = () => {
  const [vista, setVista] = useState('registro');
  const navigate = useNavigate();
return (
    <div className="rd-wrap">
      <button className="rd-back" type="button" onClick={() => navigate('/dashboard-direccion')}>
        ← Volver al Dashboard
      </button>

      <h2 className="rd-title">Gestion de alumnos</h2>


      {/* Tabs de navegación */}
      <nav
        className="botones-navegacion"
        role="tablist"
        aria-label="Navegación de vistas"
      >
        <button
          role="tab"
          aria-selected={vista === 'registro'}
          aria-controls="registro-panel"
          id="registro-tab"
          className={`tab-btn ${vista === 'registro' ? 'activo' : ''}`}
          onClick={() => setVista('registro')}
        >
          Registrar Alumno
        </button>

        <button
          role="tab"
          aria-selected={vista === 'consulta'}
          aria-controls="consulta-panel"
          id="consulta-tab"
          className={`tab-btn ${vista === 'consulta' ? 'activo' : ''}`}
          onClick={() => setVista('consulta')}
        >
          Consultar Alumnos
        </button>
      </nav>

      {/* Paneles */}
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
