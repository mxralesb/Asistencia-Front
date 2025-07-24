// docenteService.js

export const getPerfilDocente = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/api/docente/perfil', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener perfil');
  }

  return await response.json();
};

export const actualizarPerfilDocente = async (datos) => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/api/docente/perfil', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  if (!response.ok) {
    throw new Error('Error al actualizar perfil');
  }

  return await response.json();
};
