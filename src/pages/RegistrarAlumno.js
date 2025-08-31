import React, { useMemo, useState } from 'react';
import axios from 'axios';
import AlertModal from '../components/AlertModal';
import SelectMorado from '../components/SelectMorado';
import '../styles/RegistrarAlumno.css';

const API_BASE = 'http://localhost:4000';

const GRADOS = [
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  'Cuarto Bachillerato',
  'Quinto Bachillerato'
];
const GRADO_OPTS = GRADOS.map(g => ({ value: g, label: g }));

function fireAlumnosChanged() {
  const ev = new Event('alumnos:changed');
  window.dispatchEvent(ev);
}

const initForm = { nombre: '', carnet: '', grado: '' };

export default function RegistrarAlumno() {
  const [form, setForm] = useState(initForm);
  const [modal, setModal] = useState({ abierto: false, tipo: '', mensaje: '', resumen: null });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const errors = useMemo(() => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.carnet.trim()) e.carnet = 'Carnet requerido';
    if (!form.grado) e.grado = 'Seleccione un grado';
    return e;
  }, [form]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setModal({ abierto: true, tipo: 'error', mensaje: 'Complete los campos obligatorios.', resumen: null });
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
          qr: res.data.qr_codigo,
        }
      });

      setForm(initForm);
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

      setModal({ abierto: true, tipo: 'error', mensaje: msg || 'Error al registrar alumno.', resumen: null });
    }
  };

  return (
    <>
      <div className="form-container">
        <h2>Registrar Alumno</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
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
          {errors.nombre && <p className="field-error">{errors.nombre}</p>}

          {/* Carnet */}
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
          {errors.carnet && <p className="field-error">{errors.carnet}</p>}

          {/* Grado */}
          <label>Grado *</label>
          <SelectMorado
            instanceId="grado-alumno"
            options={GRADO_OPTS}
            value={form.grado ? { value: form.grado, label: form.grado } : null}
            onChange={(opt) => setForm(p => ({ ...p, grado: opt?.value || '' }))}
            placeholder="Seleccione el grado"
          />
          {errors.grado && <p className="field-error">{errors.grado}</p>}

          {/* Botón */}
          <button type="submit" className="btn-submit" disabled={!isValid}>
            Registrar Alumno
          </button>
        </form>
      </div>

      {/* Modal éxito/error */}
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

      {/* Modal alerta docente faltante */}
      <AlertModal
        open={alertOpen}
        title="No hay docente para el grado"
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
}
