// src/pages/EscanearQR.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/EscanearQR.css';

const API_BASE = 'http://localhost:4000';
const gradosDisponibles = ['Primero Básico','Segundo Básico','Tercero Básico','Cuarto Bachillerato','Quinto Bachillerato'];

export default function EscanearQR() {
  const [grado, setGrado] = useState('');
  const [fecha, setFecha] = useState('');            // YYYY-MM-DD (opcional)
  const [mensaje, setMensaje] = useState('');
  const [mostrarQR, setMostrarQR] = useState(false);
  const scannerRef = useRef(null);
  const ultimoQRRef = useRef('');
  const ultimaVezRef = useRef(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const docente_id = Number(localStorage.getItem('docente_id')); // setéalo al hacer login

  // post al backend con fecha/hora/maestro
  const marcar = async (decodedText) => {
    const ahora = new Date();
    const fechaHoraISO = ahora.toISOString(); // fecha y hora exactas
    try {
      await axios.post(`${API_BASE}/api/asistencia/marcar`, {
        carnet: decodedText,
        docente_id,
        fecha_hora: fechaHoraISO,
        estado: 'presente',
        observaciones: `Escaneo ${fecha ? `para ${fecha}` : 'sin fecha seleccionada'} — ${grado || 'sin grado'}`
      });
      setMensaje(`✅ Marcada: ${decodedText} • ${ahora.toLocaleString()}`);
      // Notifica a otras vistas para refrescar
      window.dispatchEvent(new Event('asistencia:changed'));
    } catch (e) {
      console.error(e);
      setMensaje('❌ No se pudo marcar. Revisa consola.');
    }
  };

  useEffect(() => {
    if (!(mostrarQR && docente_id)) return;

    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });
    scanner.render(async (decodedText) => {
      const t = Date.now();
      if (decodedText === ultimoQRRef.current && (t - ultimaVezRef.current) < 2000) return;
      ultimoQRRef.current = decodedText; ultimaVezRef.current = t;
      await marcar(decodedText);
    }, () => {});
    scannerRef.current = scanner;

    return () => { scannerRef.current?.clear().catch(()=>{}); scannerRef.current = null; };
  }, [mostrarQR, docente_id]);

  // Importar imagen (archivo)
  const handleImportar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !docente_id) return;
    try {
      setMensaje('Leyendo imagen…');
      const html5QrCode = new Html5Qrcode('qr-file-temp');
      const result = await html5QrCode.scanFile(file, true);
      await marcar(result);
      await html5QrCode.clear();
    } catch (err) {
      console.error(err);
      setMensaje('❌ No se pudo leer el QR de la imagen.');
    } finally {
      // limpiar input
      e.target.value = '';
    }
  };

  return (
    <div className="escanear-container">
      <button className="btn-regresar" onClick={() => navigate('/dashboard-docente')}>
        <FaArrowLeft /> Regresar
      </button>

      <h1 className="titulo-escanear">Escaneo de Asistencia</h1>

      <div className="formulario-escanear">
        <div className="form-group">
          <label>Grado / Salón (opcional):</label>
          <select value={grado} onChange={(e) => setGrado(e.target.value)}>
            <option value="">—</option>
            {gradosDisponibles.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha (opcional, vista del docente):</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        {!mostrarQR && (
          <div className="acciones">
            <button className="btn-escanear" onClick={() => setMostrarQR(true)}>
              Iniciar cámara
            </button>

            <button className="btn-importar" onClick={() => fileInputRef.current?.click()}>
              <FaImage style={{marginRight:6}}/> Importar imagen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{display: 'none'}}
              onChange={handleImportar}
            />
          </div>
        )}
      </div>

      {mostrarQR && <div id="qr-reader" className="scanner-box" />}

      {/* contenedor temporal para scanFile */}
      <div id="qr-file-temp" style={{display:'none'}} />

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}
