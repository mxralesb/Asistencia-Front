import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import '../styles/Login.css';

const LoginDocente = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(correo, password, 'docente');
      localStorage.setItem('token', data.token);
      navigate('/dashboard-docente'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="login-title">Ingreso Docente</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Correo institucional</label>
            <input
              type="email"
              placeholder="docente@colegio.edu.gt"
              className="input-field"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}

        <p className="text-sm text-center mt-4">
          ¿Eres de Dirección?{' '}
          <Link to="/direccion" className="text-blue-600 hover:underline">
            Ingresar aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginDocente;
