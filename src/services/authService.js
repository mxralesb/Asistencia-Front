const API_URL = 'http://localhost:4000/api/auth';

export const login = async (correo, password, rol) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, password, rol })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Error de autenticación');

    // Para guardar el tokern en el localStorage
    localStorage.setItem('token', data.token);

    return data;
  } catch (error) {
    throw error;
  }
};
