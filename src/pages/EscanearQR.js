import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/EscanearQR.css';

const EscanearQR = () => {
  const [grado, setGrado] = useState('');
  const [fecha, setFecha] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [qrLeido, setQrLeido] = useState('');
  const scannerRef = useRef(null);
  const [mostrarQR, setMostrarQR] = useState(false);
  const navigate = useNavigate();

  const gradosDisponibles = [
    '1ro Básico',
    '2do Básico',
    '3ro Básico',
    '1ro Diversificado',
    '2do Diversificado',
    '3ro Diversificado',
  ];

  useEffect(() => {
    if (mostrarQR && grado && fecha) {
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });

      scanner.render(
        (decodedText) => {
          setQrLeido(decodedText);
          setMensaje(`✅ Asistencia registrada para QR: ${decodedText} el ${fecha} en ${grado}`);
          scanner.clear();
        },
        (error) => {
          // Silencio los errores frecuentes de escaneo fallido
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [mostrarQR, grado, fecha]);

  return (
    <div className="escanear-container">
      <button className="btn-regresar" onClick={() => navigate('/dashboard-docente')}>
        <FaArrowLeft /> Regresar
      </button>

      <h1 className="titulo-escanear">Escaneo de Asistencia</h1>

      <div className="formulario-escanear">
        <div className="form-group">
          <label>Grado / Salón:</label>
          <select value={grado} onChange={(e) => setGrado(e.target.value)} required>
            <option value="">Selecciona un grado</option>
            {gradosDisponibles.map((g, i) => (
              <option key={i} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        {grado && fecha && !mostrarQR && (
          <button className="btn-escanear" onClick={() => setMostrarQR(true)}>
            Iniciar escaneo
          </button>
        )}
      </div>

      {mostrarQR && grado && fecha && <div id="qr-reader" className="scanner-box"></div>}

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default EscanearQR;
