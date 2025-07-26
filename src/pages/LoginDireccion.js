import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import '../styles/Login.css';

const LoginDireccion = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(correo, password, 'direccion');
      localStorage.setItem('token', data.token);
      navigate('/dashboard-direccion'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">Ingreso Dirección</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo institucional</label>
            <input
              type="email"
              placeholder="direccion@colegio.edu.gt"
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
          ¿Eres Docente?{' '}
          <Link to="/" className="login-link">Ingresar aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginDireccion;
