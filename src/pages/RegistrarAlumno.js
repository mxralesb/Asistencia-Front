import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/RegistrarAlumno.css';
import { notifyAlumnosChanged } from '../lib/alumnosBus';

const API_BASE = 'http://localhost:4000';

const gradosDisponibles = [
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  'Cuarto Bachillerato',
  'Quinto Bachillerato'
];

const RegistrarAlumno = () => {
  const [form, setForm] = useState({ nombre: '', carnet: '', grado: '' });
  const [enviando, setEnviando] = useState(false);
  const [modal, setModal] = useState({ abierto: false, tipo: '', mensaje: '', resumen: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'carnet' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombre = form.nombre.trim();
    const carnet = form.carnet.trim().toUpperCase();
    const grado  = form.grado.trim();

    if (!nombre || !carnet || !grado) {
      setModal({ abierto: true, tipo: 'error', mensaje: 'Por favor, complete todos los campos obligatorios.', resumen: null });
      return;
    }

    try {
      setEnviando(true);
      const res = await axios.post(`${API_BASE}/api/alumnos`, {
        nombre_completo: nombre,
        carnet,
        grado,
        activo: true,
      });

      // Notifica a la vista de consulta para que se refresque de inmediato
      notifyAlumnosChanged();

      setModal({
        abierto: true,
        tipo: 'success',
        mensaje: 'Alumno registrado correctamente.',
        resumen: {
          nombre,
          carnet,
          grado,
          qr: res?.data?.qr_codigo
        }
      });

      setForm({ nombre: '', carnet: '', grado: '' });
    } catch (error) {
      console.error(error);
      const msg = error?.response?.status === 409
        ? 'El carnet ya existe. Verifique e intente nuevamente.'
        : 'Error al registrar alumno.';
      setModal({ abierto: true, tipo: 'error', mensaje: msg, resumen: null });
    } finally {
      setEnviando(false);
    }
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') setModal(m => ({ ...m, abierto: false })); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <>
      <div className="form-container">
        <h2>Registrar Alumno</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="nombre">Nombre completo *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre completo"
            autoComplete="off"
            required
          />

          <label htmlFor="carnet">Carnet *</label>
          <input
            id="carnet"
            name="carnet"
            type="text"
            value={form.carnet}
            onChange={handleChange}
            placeholder="Carnet"
            autoComplete="off"
            required
          />

          <label htmlFor="grado">Grado *</label>
          <select
            id="grado"
            name="grado"
            value={form.grado}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione el grado</option>
            {gradosDisponibles.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button type="submit" className="btn-submit" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Registrar Alumno'}
          </button>
        </form>
      </div>

      {/* Modal */}
      {modal.abierto && (
        <div className="modal-overlay" onClick={() => setModal({ ...modal, abierto: false })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <p className={`modal-message ${modal.tipo}`}>{modal.mensaje}</p>

            {modal.resumen && (
              <div className="modal-resumen">
                <p><strong>Nombre:</strong> {modal.resumen.nombre}</p>
                <p><strong>Carnet:</strong> {modal.resumen.carnet}</p>
                <p><strong>Grado:</strong> {modal.resumen.grado}</p>

                {modal.resumen.qr && (
                  <>
                    <img
                      src={modal.resumen.qr}
                      alt={`QR de ${modal.resumen.nombre}`}
                      className="modal-qr"
                    />
                    <a href={modal.resumen.qr} download={`qr_alumno_${modal.resumen.carnet}.png`}>
                      <button className="btn-download-modal">Descargar QR</button>
                    </a>
                  </>
                )}
              </div>
            )}

            <button className="btn-close" onClick={() => setModal({ ...modal, abierto: false })}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RegistrarAlumno;
