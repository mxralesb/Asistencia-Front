import React, { useState } from 'react';
import RegistrarAlumno from './RegistrarAlumno';
import ConsultaAlumnos from './ConsultaAlumnos';
import '../styles/ListaAlumnos.css';

const ListaAlumnos = () => {
  const [vista, setVista] = useState('registro');

  return (
    <div className="lista-alumnos-container">
      <h1>Gestión de Alumnos</h1>
      <div className="botones-navegacion">
        <button
          className={vista === 'registro' ? 'activo' : ''}
          onClick={() => setVista('registro')}
        >
          Registrar Alumno
        </button>
        <button
          className={vista === 'consulta' ? 'activo' : ''}
          onClick={() => setVista('consulta')}
        >
          Consultar Alumnos
        </button>
      </div>

      <div className="vista-activa">
        {vista === 'registro' && <RegistrarAlumno />}
        {vista === 'consulta' && <ConsultaAlumnos />}
      </div>
    </div>
  );
};

export default ListaAlumnos;
