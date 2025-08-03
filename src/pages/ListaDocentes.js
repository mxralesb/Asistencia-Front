import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ListaDocentes.css'; // puedes estilizarlo como quieras

const ListaDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerDocentes = async () => {
      try {
        const token = localStorage.getItem('token'); // asegúrate de guardar el token al hacer login
        const response = await axios.get('http://localhost:4000/api/usuarios/docentes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDocentes(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo obtener la lista de docentes.');
      }
    };

    obtenerDocentes();
  }, []);

  return (
    <div className="lista-docentes">
      <h2>Docentes Registrados</h2>
      {error && <p className="error">{error}</p>}
      {docentes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Grado</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map(docente => (
              <tr key={docente.id}>
                <td>{docente.nombre}</td>
                <td>{docente.correo}</td>
                <td>{docente.grado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay docentes registrados.</p>
      )}
    </div>
  );
};

export default ListaDocentes;
