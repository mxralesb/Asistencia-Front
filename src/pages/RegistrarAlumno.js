import React, { useState } from 'react';
import axios from 'axios';
import AlertModal from '../components/AlertModal';
import '../styles/RegistrarAlumno.css';

const API_BASE = 'http://localhost:4000';

const gradosDisponibles = [
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  'Cuarto Bachillerato',
  'Quinto Bachillerato'
];

function fireAlumnosChanged() {
  const ev = new Event('alumnos:changed');
  window.dispatchEvent(ev);
}

const RegistrarAlumno = () => {
  const [form, setForm] = useState({ nombre: '', carnet: '', grado: '' });

  const [modal, setModal] = useState({ abierto: false, tipo: '', mensaje: '', resumen: null });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.carnet || !form.grado) {
      setModal({
        abierto: true,
        tipo: 'error',
        mensaje: 'Por favor, complete todos los campos obligatorios.',
        resumen: null
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/alumnos`, {
        nombre_completo: form.nombre,
        carnet: form.carnet,
        grado: form.grado,
        activo: true,
        
      });

      setModal({
        abierto: true,
        tipo: 'success',
        mensaje: 'Alumno registrado correctamente.',
        resumen: {
          nombre: form.nombre,
          carnet: form.carnet,
          grado: form.grado,
          qr: res.data.qr_codigo
        }
      });

      setForm({ nombre: '', carnet: '', grado: '' });

    
      fireAlumnosChanged();

    } catch (error) {
     
      const status = error?.response?.status;
      const msg = error?.response?.data?.error || error?.response?.data?.mensaje;

      if (status === 409 && /docente/i.test(String(msg))) {
        setAlertMsg(
          msg ||
          'No hay un docente activo asignado a ese grado. Asigna un docente al grado o selecciona uno manualmente.'
        );
        setAlertOpen(true);
        return;
      }

    
      setModal({
        abierto: true,
        tipo: 'error',
        mensaje: msg || 'Error al registrar alumno.',
        resumen: null
      });
    }
  };

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

          <button type="submit" className="btn-submit">Registrar Alumno</button>
        </form>
      </div>

      {/* Modal éxito/error existente */}
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
                    <a
                      href={modal.resumen.qr}
                      download={`qr_alumno_${modal.resumen.carnet}.png`}
                    >
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

  
      <AlertModal
        open={alertOpen}
        title="No hay docente para el grado"
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
};

export default RegistrarAlumno;
