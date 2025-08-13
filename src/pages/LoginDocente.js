// LoginDocente.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../styles/Login.css';

const LoginDocente = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [requiereCambio, setRequiereCambio] = useState(false);
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNuevoPassword, setShowNuevoPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenTemporal, setTokenTemporal] = useState('');
  const navigate = useNavigate();

  // Login principal
  const handleLogin = async (e) => {
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

      if (data.usuario.requiere_cambio) {
        setRequiereCambio(true);
        setTokenTemporal(data.token);
      } else {
        navigate('/dashboard-docente');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Cambio de contraseña temporal
  const handleCambioPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Regex de validación: mayúscula, minúscula, número, símbolo, mínimo 6
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(nuevoPassword)) {
      setError('La contraseña debe tener al menos 6 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.');
      return;
    }

    if (nuevoPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await axios.put(
        'http://localhost:4000/api/usuarios/cambiar-contrasena',
        { password: nuevoPassword },
        { headers: { Authorization: `Bearer ${tokenTemporal}` } }
      );
      navigate('/dashboard-docente');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cambiar contraseña.');
    }
  };

  return (
    <div className="login-bg">
      {!requiereCambio ? (
        <div className="login-card">
          <h1 className="login-title">Ingreso Docente</h1>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Correo institucional</label>
              <input
                type="email"
                placeholder="docente@colegio.edu.gt"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
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
            ¿Eres de Dirección? <Link to="/direccion" className="login-link">Ingresar aquí</Link>
          </p>

          <button
            className="guide-floating-btn"
            onClick={() => setShowGuide(true)}
            title="Ver guía de uso"
          >
            <FaInfoCircle />
          </button>

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
      ) : (
        <div className="cambio-password-card">
          <h1 className="login-title">Primer ingreso</h1>
          <p>Debes cambiar tu contraseña temporal.</p>
          <form onSubmit={handleCambioPassword}>
            <div className="input-group password-group">
              <label>Nueva contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showNuevoPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={nuevoPassword}
                  onChange={e => setNuevoPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNuevoPassword(!showNuevoPassword)}
                >
                  {showNuevoPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="input-group password-group">
              <label>Confirmar contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn">Cambiar contraseña</button>
          </form>
          {error && <p className="error-msg">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default LoginDocente;
