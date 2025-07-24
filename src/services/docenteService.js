import axios from 'axios';

const API_URL = 'http://localhost:4000/api/docente'; // ajusta el puerto si es otro

export const getPerfilDocente = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/perfil`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const actualizarPerfilDocente = async (datos) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/perfil`, datos, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
