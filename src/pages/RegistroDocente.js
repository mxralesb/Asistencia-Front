import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiBookOpen,
  FiLayers,
  FiChevronDown,
} from 'react-icons/fi';
import '../styles/RegistrarDocente.css';

const API_BASE = 'http://localhost:4000';

const GRADOS = [
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  'Cuarto Bachillerato',
  'Quinto Bachillerato',
];

const ESPECIALIDADES = [
  'Matemática',
  'Lenguaje',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Computación',
  'Inglés',
  'Educación Física',
];

const GRADO_OPTS = GRADOS.map(g => ({ value: g, label: g }));
const ESPEC_OPTS = ESPECIALIDADES.map(e => ({ value: e, label: e }));

const initForm = {
  nombre: '',
  correo: '',
  telefono: '',
  direccion: '',
  especialidad: '',
  grado: '',
};

const emailIsGmail = (v) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v);
const telIsValid  = (v) => /^\d{0,8}$/.test(v);

/* === Estilos morados para react-select (menú flotante bonito) === */
const purpleSelectStyles = {
  container: (b) => ({ ...b, width: '100%' }),
  control: (base) => ({
    ...base,
    minHeight: 48,
    border: 0,
    boxShadow: 'none',
    background: 'transparent',
    cursor: 'pointer',
  }),
  valueContainer: (b) => ({ ...b, padding: '4px 8px 4px 2px' }),
  input: (b) => ({ ...b, color: '#4a3e71' }),
  singleValue: (b) => ({ ...b, color: '#4a3e71', fontWeight: 600 }),
  placeholder: (b) => ({ ...b, color: '#8a7fc0', fontWeight: 600 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (b) => ({ ...b, color: '#6e57d1' }),
  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
  menu: (b) => ({
    ...b,
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #e8e1ff',
    boxShadow: '0 18px 34px rgba(110,87,209,.20)',
    backdropFilter: 'blur(4px)',
  }),
  menuList: (b) => ({
    ...b,
    padding: 6,
    maxHeight: 220,
  }),
  option: (b, s) => ({
    ...b,
    borderRadius: 10,
    padding: '10px 12px',
    margin: '2px 0',
    background: s.isSelected
      ? 'linear-gradient(135deg,#6f42c1,#a26dd9)'
      : s.isFocused
      ? '#f3efff'
      : '#fff',
    color: s.isSelected ? '#fff' : '#4a3e71',
    fontWeight: s.isSelected ? 700 : 600,
    cursor: 'pointer',
  }),
};

export default function RegistrarDocente() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initForm);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [modal, setModal] = useState({ open: false, docente: null });

  const errors = useMemo(() => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!emailIsGmail(form.correo)) e.correo = 'Debe ser @gmail.com';
    if (!telIsValid(form.telefono)) e.telefono = 'Solo números (máx. 8)';
    if (!form.especialidad) e.especialidad = 'Seleccione una';
    if (!form.grado) e.grado = 'Seleccione un grado';
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (name) => (e) => {
    let value = e.target.value;
    if (name === 'telefono' && !telIsValid(value)) return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (name) => () =>
    setTouched((p) => ({ ...p, [name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      nombre: true,
      correo: true,
      telefono: true,
      especialidad: true,
      grado: true,
      direccion: true,
    });
    if (!isValid) return;

    try {
      setSubmitting(true);
      const { data } = await axios.post(`${API_BASE}/api/usuarios/registro-docente`, {
        ...form,
        rol: 'docente',
      });

      setModal({
        open: true,
        docente: {
          id: data?.id ?? '—',
          ...form,
        },
      });
      setForm(initForm);
      setTouched({});
    } catch (err) {
      const msg = err?.response?.data?.mensaje || 'Error al registrar docente';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rd-wrap">
      <button className="rd-back" type="button" onClick={() => navigate('/dashboard-direccion')}>
        ← Volver al Dashboard
      </button>

      <h2 className="rd-title">Registro nuevo docente</h2>

      <form className="rd-form" onSubmit={handleSubmit} noValidate>
        {/* Nombre */}
        <div className="rd-field">
          <label className="rd-label">
            Nombre completo <span className="req">*</span>
          </label>
          <div className="input-icon">
            <FiUser aria-hidden className="icon" />
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={form.nombre}
              onChange={handleChange('nombre')}
              onBlur={handleBlur('nombre')}
              aria-invalid={touched.nombre && !!errors.nombre}
            />
          </div>
          {touched.nombre && errors.nombre && <p className="rd-error">{errors.nombre}</p>}
        </div>

        {/* Correo */}
        <div className="rd-field">
          <label className="rd-label">
            Correo institucional <span className="req">*</span>
          </label>
          <div className="input-icon">
            <FiMail aria-hidden className="icon" />
            <input
              type="email"
              placeholder="ejemplo@gmail.com"
              value={form.correo}
              onChange={handleChange('correo')}
              onBlur={handleBlur('correo')}
              aria-invalid={touched.correo && !!errors.correo}
            />
          </div>
          {touched.correo && errors.correo && <p className="rd-error">{errors.correo}</p>}
        </div>

        {/* Teléfono */}
        <div className="rd-field">
          <label className="rd-label">
            Teléfono <span className="req">*</span>
          </label>
          <div className="input-icon">
            <FiPhone aria-hidden className="icon" />
            <input
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              value={form.telefono}
              onChange={handleChange('telefono')}
              onBlur={handleBlur('telefono')}
              aria-invalid={touched.telefono && !!errors.telefono}
            />
          </div>
          {touched.telefono && errors.telefono && <p className="rd-error">{errors.telefono}</p>}
        </div>

        {/* Dirección (opcional) */}
        <div className="rd-field">
          <label className="rd-label">Dirección</label>
          <div className="input-icon">
            <FiHome aria-hidden className="icon" />
            <input
              type="text"
              placeholder="Ciudad, Zona, Colonia"
              value={form.direccion}
              onChange={handleChange('direccion')}
              onBlur={handleBlur('direccion')}
            />
          </div>
        </div>

        {/* Especialidad */}
        <div className="rd-field">
          <label className="rd-label">
            Especialidad <span className="req">*</span>
          </label>
          <div className="select-icon">
            <FiBookOpen aria-hidden className="icon" />
            <Select
              classNamePrefix="rs"
              instanceId="especialidad"
              styles={purpleSelectStyles}
              options={ESPEC_OPTS}
              value={form.especialidad ? { value: form.especialidad, label: form.especialidad } : null}
              onChange={(opt) => setForm(p => ({ ...p, especialidad: opt?.value || '' }))}
              onBlur={handleBlur('especialidad')}
              placeholder="Seleccione"
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
          {touched.especialidad && errors.especialidad && (
            <p className="rd-error">{errors.especialidad}</p>
          )}
        </div>

        {/* Grado */}
        <div className="rd-field">
          <label className="rd-label">
            Grado asignado <span className="req">*</span>
          </label>
          <div className="select-icon">
            <FiLayers aria-hidden className="icon" />
            <Select
              classNamePrefix="rs"
              instanceId="grado"
              styles={purpleSelectStyles}
              options={GRADO_OPTS}
              value={form.grado ? { value: form.grado, label: form.grado } : null}
              onChange={(opt) => setForm(p => ({ ...p, grado: opt?.value || '' }))}
              onBlur={handleBlur('grado')}
              placeholder="Seleccione"
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
          {touched.grado && errors.grado && <p className="rd-error">{errors.grado}</p>}
        </div>

        <div className="rd-actions">
          <button className="rd-submit" type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Registrando…' : 'Registrar Docente'}
          </button>
        </div>
      </form>

      {/* Modal simple */}
      {modal.open && modal.docente && (
        <div className="rd-modal-overlay" onClick={() => setModal({ open: false, docente: null })}>
          <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Docente registrado</h3>
            <ul>
              <li><strong>ID:</strong> {modal.docente.id}</li>
              <li><strong>Nombre:</strong> {modal.docente.nombre}</li>
              <li><strong>Correo:</strong> {modal.docente.correo}</li>
              <li><strong>Teléfono:</strong> {modal.docente.telefono || '—'}</li>
              <li><strong>Dirección:</strong> {modal.docente.direccion || '—'}</li>
              <li><strong>Especialidad:</strong> {modal.docente.especialidad}</li>
              <li><strong>Grado:</strong> {modal.docente.grado}</li>
            </ul>
            <button className="rd-modal-close" onClick={() => setModal({ open: false, docente: null })}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
