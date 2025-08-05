import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ConsultaAlumnos.css';

const ConsultaAlumnos = () => {
  const [grado, setGrado] = useState('');
  const [seccion, setSeccion] = useState('');
  const [alumnos, setAlumnos] = useState([]);

  const consultar = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/alumnos/por-grado`, {
        params: { grado, seccion }
      });
      setAlumnos(res.data);
    } catch (err) {
      console.error(err);
      alert('Error al consultar alumnos');
    }
  };

  return (
    <div className="consulta-alumnos">
      <h2>Consulta de Alumnos por Grado y Sección</h2>
      <div className="filtros">
        <input
          type="text"
          placeholder="Grado (ej. 4to Primaria)"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
        />
        <input
          type="text"
          placeholder="Sección (ej. A)"
          value={seccion}
          onChange={(e) => setSeccion(e.target.value)}
        />
        <button onClick={consultar}>Buscar</button>
      </div>

      {alumnos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Carnet</th>
              <th>Grado</th>
              <th>Sección</th>
              <th>Salón</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((al) => (
              <tr key={al.id}>
                <td>{al.nombre_completo}</td>
                <td>{al.carnet}</td>
                <td>{al.grado}</td>
                <td>{al.seccion}</td>
                <td>{al.salon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: '20px' }}>No se han encontrado alumnos aún.</p>
      )}
    </div>
  );
};

export default ConsultaAlumnos;
