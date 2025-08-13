import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistrarDocente.css';

const gradosDisponibles = [
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  'Cuarto Bachillerato',
  'Quinto Bachillerato'
];

const especialidadesDisponibles = [
  'Matemática',
  'Lenguaje',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Computación',
  'Inglés',
  'Educación Física'
];

const RegistrarDocente = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    especialidad: '',
    grado: '',
  });

  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');

  const validarCorreoGmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  };

  const validarTelefono = (telefono) => {
    const regex = /^\d{0,8}$/; // Solo dígitos, máximo 8 caracteres
    return regex.test(telefono);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'correo') {
      setForm((prev) => ({ ...prev, correo: value }));
      if (!validarCorreoGmail(value)) {
        setErrorCorreo('El correo debe ser un Gmail válido (terminado en @gmail.com)');
      } else {
        setErrorCorreo('');
      }
    } else if (name === 'telefono') {
      if (validarTelefono(value)) {
        setForm((prev) => ({ ...prev, telefono: value }));
        setErrorTelefono('');
      } else {
        // No actualizar el estado si es inválido (evita que se escriba)
        setErrorTelefono('El teléfono debe contener solo números y máximo 8 dígitos');
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCorreoGmail(form.correo)) {
      setErrorCorreo('El correo debe ser un Gmail válido (terminado en @gmail.com)');
      return;
    }

    if (!validarTelefono(form.telefono)) {
      setErrorTelefono('El teléfono debe contener solo números y máximo 8 dígitos');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/usuarios/registro-docente', {
        ...form,
        rol: 'docente',
      });
      alert('Docente registrado correctamente');
      setForm({
        nombre: '',
        correo: '',
        telefono: '',
        direccion: '',
        especialidad: '',
        grado: '',
      });
      setErrorCorreo('');
      setErrorTelefono('');
    } catch (err) {
      console.error(err);
      alert('Error al registrar docente');
    }
  };

  return (
    <div className="form-container">
      <button
        className="btn-volver"
        onClick={() => navigate('/dashboard-direccion')}
        style={{
          backgroundColor: '#497c9e',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          fontWeight: '600',
          fontSize: '0.9rem',
          boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3d687f')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#497c9e')}
      >
        ← Volver al Dashboard
      </button>

      <h2>Registrar Docente</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Correo institucional</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
            placeholder="ejemplo@gmail.com"
          />
          {errorCorreo && <p className="message error">{errorCorreo}</p>}
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            maxLength="8"
            placeholder="Solo números, máximo 8 dígitos"
          />
          {errorTelefono && <p className="message error">{errorTelefono}</p>}
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Especialidad</label>
          <select
            name="especialidad"
            value={form.especialidad}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una especialidad</option>
            {especialidadesDisponibles.map((esp, idx) => (
              <option key={idx} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Grado asignado</label>
          <select
            name="grado"
            value={form.grado}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un grado</option>
            {gradosDisponibles.map((grado, idx) => (
              <option key={idx} value={grado}>
                {grado}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={errorCorreo !== '' || errorTelefono !== ''}
        >
          Registrar Docente
        </button>
      </form>
    </div>
  );
};

export default RegistrarDocente;
