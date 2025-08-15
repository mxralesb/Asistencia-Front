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
  const [showModal, setShowModal] = useState(false);
  const [docenteGuardado, setDocenteGuardado] = useState(null);

  const validarCorreoGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const validarTelefono = (telefono) => /^\d{0,8}$/.test(telefono);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'correo') {
      setForm(prev => ({ ...prev, correo: value }));
      setErrorCorreo(validarCorreoGmail(value) ? '' : 'El correo debe ser un Gmail válido (@gmail.com)');
    } else if (name === 'telefono') {
      if (validarTelefono(value)) {
        setForm(prev => ({ ...prev, telefono: value }));
        setErrorTelefono('');
      } else {
        setErrorTelefono('El teléfono debe contener solo números y máximo 8 dígitos');
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCorreoGmail(form.correo) || !validarTelefono(form.telefono)) return;

    try {
      // Guardar en la BD
      const response = await axios.post('http://localhost:4000/api/usuarios/registro-docente', {
        ...form,
        rol: 'docente'
      });

      // Guardar datos para el modal
      setDocenteGuardado({
        ...form,
        id: response.data.id || 'N/A', // si tu backend devuelve id
      });

      // Mostrar modal resumen
      setShowModal(true);

      // Limpiar formulario
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
      alert(err.response?.data?.mensaje || 'Error al registrar docente');
    }
  };

  return (
    <div className="form-container">
      <button
        className="btn-volver"
        onClick={() => navigate('/dashboard-direccion')}
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
              <option key={idx} value={esp}>{esp}</option>
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
              <option key={idx} value={grado}>{grado}</option>
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

      {/* Modal resumen */}
      {showModal && docenteGuardado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Docente registrado</h3>
            <ul>
              <li><strong>ID:</strong> {docenteGuardado.id}</li>
              <li><strong>Nombre:</strong> {docenteGuardado.nombre}</li>
              <li><strong>Correo:</strong> {docenteGuardado.correo}</li>
              <li><strong>Teléfono:</strong> {docenteGuardado.telefono || 'N/A'}</li>
              <li><strong>Dirección:</strong> {docenteGuardado.direccion || 'N/A'}</li>
              <li><strong>Especialidad:</strong> {docenteGuardado.especialidad}</li>
              <li><strong>Grado:</strong> {docenteGuardado.grado}</li>
            </ul>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarDocente;
