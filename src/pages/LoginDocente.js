import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { FaEye, FaEyeSlash, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../styles/Login.css';

const LoginDocente = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      setError('Por favor ingresa un correo válido.');
      return;
    }

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
              required
            />
          </div>

          <div className="input-group password-group">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn">Iniciar sesión</button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <p className="login-alt">
          ¿Eres de Dirección?{' '}
          <Link to="/direccion" className="login-link">Ingresar aquí</Link>
        </p>
      </div>

      {/* Botón flotante */}
      <button
        className="guide-floating-btn"
        onClick={() => setShowGuide(true)}
        title="Ver guía de uso"
      >
        <FaInfoCircle />
      </button>

      {/* Pop-up de guía */}
      {showGuide && (
        <div className="login-guide-popup">
          <button className="guide-close" onClick={() => setShowGuide(false)}>
            <FaTimes />
          </button>
          <div className="guide-header">
            <FaInfoCircle className="guide-icon" />
            <h3>Guía de uso</h3>
          </div>
          <ul>
            <li>Usa tu <strong>correo institucional</strong>.</li>
            <li>La contraseña inicial la entrega Dirección.</li>
            <li>Puedes cambiarla en tu perfil.</li>
            <li>Si olvidaste tu clave, solicita restablecimiento.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoginDocente;
