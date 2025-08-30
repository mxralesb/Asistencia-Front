
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import {  FiCamera, FiImage, FiCameraOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../styles/EscanearQR.css';

const API_BASE = 'http://localhost:4000';

export default function EscanearQR() {
  // UI
  const [mostrarQR, setMostrarQR] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // refs
  const scannerRef = useRef(null);
  const ultimoQRRef = useRef('');
  const ultimaVezRef = useRef(0);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const docente_id = Number(localStorage.getItem('docente_id')) || null;


  const marcar = useCallback(
    async (decodedText) => {
      try {
        await axios.post(`${API_BASE}/api/asistencia/marcar`, {
          carnet: decodedText,
          docente_id,
          fecha_hora: new Date().toISOString(),
          estado: 'presente',
          observaciones: observaciones?.trim() || '',
        });

        
        try {
          const respAl = await axios.get(`${API_BASE}/api/alumnos`, { params: { q: decodedText } });
          const lista = Array.isArray(respAl.data) ? respAl.data : [];
          const alumno = lista.find(
            (a) => (a.carnet || '').toString().trim() === decodedText.toString().trim()
          );
          setMensaje(`✅ Asistencia registrada para "${alumno?.nombre_completo || decodedText}"`);
        } catch {
          setMensaje(`✅ Asistencia registrada para "${decodedText}"`);
        }
      } catch (err) {
        if (err?.response?.status === 409 && err?.response?.data?.error === 'ya_registrado_hoy') {
          
          try {
            const respAl = await axios.get(`${API_BASE}/api/alumnos`, { params: { q: decodedText } });
            const lista = Array.isArray(respAl.data) ? respAl.data : [];
            const alumno = lista.find(
              (a) => (a.carnet || '').toString().trim() === decodedText.toString().trim()
            );
            setMensaje(`ℹ️ Ya existe asistencia hoy para "${alumno?.nombre_completo || decodedText}"`);
          } catch {
            setMensaje('ℹ️ Ya existe asistencia hoy');
          }
        } else {
          console.error(err);
          setMensaje('⚠️ Error al registrar asistencia');
        }
      }
    },
    [docente_id, observaciones]
  );


  useEffect(() => {
    if (!mostrarQR) return;
    if (!docente_id) {
      setMensaje('⚠️ No se encontró el ID del docente en la sesión.');
      return;
    }

    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });
    scanner.render(
      async (decodedText) => {
        const t = Date.now();
     
        if (decodedText === ultimoQRRef.current && t - ultimaVezRef.current < 2000) return;
        ultimoQRRef.current = decodedText;
        ultimaVezRef.current = t;
        await marcar(decodedText);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [mostrarQR, docente_id, marcar]);

  
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
      e.target.value = '';
    }
  };

  return (
    <div className="rd-wrap">
      <button className="rd-back" type="button" onClick={() => navigate('/dashboard-docente')}>
        ← Volver al Dashboard
      </button>


      <h1 className="titulo-escanear">Escaneo de Asistencia</h1>

      <div className="formulario-escanear">
        <div className="form-group">
          <label>Observaciones (opcional)</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej. Llegó con uniforme completo"
            rows={3}
          />
          <small className="help">
          
          </small>
        </div>

        <div className="acciones">
          {!mostrarQR ? (
            <>
              <button className="btn-escanear" onClick={() => setMostrarQR(true)}>
                <FiCamera style={{ marginRight: 6 }} /> Iniciar cámara
              </button>

              <button className="btn-importar" onClick={() => fileInputRef.current?.click()}>
                <FiImage style={{ marginRight: 6 }} /> Importar imagen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImportar}
              />
            </>
          ) : (
            <button className="btn-detener" onClick={() => setMostrarQR(false)}>
              <FiCameraOff style={{ marginRight: 6 }} /> Detener cámara
            </button>
          )}
        </div>
      </div>

      {mostrarQR && <div id="qr-reader" className="scanner-box" />}

      {/* contenedor temporal para scanFile */}
      <div id="qr-file-temp" style={{ display: 'none' }} />

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}
