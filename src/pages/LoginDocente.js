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
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">Ingreso Docente</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo institucional</label>
            <input
              type="email"
              placeholder="docente@colegio.edu.gt"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-btn">Iniciar sesión</button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        <p className="login-alt">
          ¿Eres de Dirección?{' '}
          <Link to="/direccion" className="login-link">Ingresar aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginDocente;
