    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import '../styles/RegistrarAlumno.css';

    const RegistrarAlumno = () => {
    const [nombre, setNombre] = useState('');
    const [carnet, setCarnet] = useState('');
    const [salones, setSalones] = useState([]);
    const [salonId, setSalonId] = useState('');
    const [activo, setActivo] = useState(true);
    const [qrData, setQrData] = useState('');

    useEffect(() => {
        const fetchSalones = async () => {
        const res = await axios.get('http://localhost:4000/api/salones');
        setSalones(res.data);
        };
        fetchSalones();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const res = await axios.post('http://localhost:4000/api/alumnos', {
            nombre_completo: nombre,
            carnet,
            salon_id: salonId,
            activo
        });

        setQrData(res.data.qr_codigo);

        alert('Alumno registrado correctamente');
        setNombre('');
        setCarnet('');
        setSalonId('');
        setActivo(true);
        } catch (err) {
        console.error(err);
        alert('Error al registrar alumno');
        }
    };

    return (
        <div className="registro-alumno">
        <h2>Registrar Alumno</h2>
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            />
            <input
            type="text"
            placeholder="Carnet"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
            required
            />
            <select value={salonId} onChange={(e) => setSalonId(e.target.value)} required>
            <option value="">Seleccione el salón</option>
            {salones.map((s) => (
                <option key={s.id} value={s.id}>
                {s.nombre} - {s.grado}
                </option>
            ))}
            </select>
            <label>
            <input
                type="checkbox"
                checked={activo}
                onChange={() => setActivo(!activo)}
            />
            Alumno activo
            </label>
            <button type="submit">Registrar Alumno</button>
        </form>
{qrData && (
  <div className="qr-preview">
    <h4>Código QR del alumno: <span style={{ color: '#004080' }}>{nombre}</span></h4>
<img src={qrData} alt={`QR de ${nombre}`} />

    <br />
    <a href={qrData} download={`qr_alumno_${nombre}.png`}>
      <button type="button">Descargar QR</button>
    </a>
  </div>
)}

        </div>
    );
    };

    export default RegistrarAlumno;
