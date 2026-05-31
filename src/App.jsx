import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PortfolioHome from './pages/PortfolioHome';
import AllProjects from './pages/AllProjects';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <Router>
      {/* Resetea el scroll al top en cada navegación entre páginas */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PortfolioHome />} />
        <Route path="/proyectos" element={<AllProjects />} />
        {/* /projects (EN) redirige a la URL canónica /proyectos para evitar contenido duplicado */}
        <Route path="/projects" element={<Navigate to="/proyectos" replace />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
