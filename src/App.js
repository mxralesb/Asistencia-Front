import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginDocente from './pages/LoginDocente';
import LoginDireccion from './pages/LoginDireccion';
import DashboardDocente from './pages/DashboardDocente';
import DashboardDireccion from './pages/DashboardDireccion';
import EscanearQR from './pages/EscanearQR';
import PerfilDocente from './pages/PerfilDocente';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginDocente />} />
        <Route path="/direccion" element={<LoginDireccion />} />
        <Route path="/dashboard-docente" element={<DashboardDocente />} /> {}
        <Route path="/dashboard-direccion" element={<DashboardDireccion />} /> {}
        <Route path="/docente/escanear" element={<EscanearQR />} />
        <Route path="/docente/mi-perfil" element={<PerfilDocente />} /> {} 
      </Routes>
    </Router>
  );
}

export default App;
