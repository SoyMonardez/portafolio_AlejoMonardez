import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PortfolioHome from './pages/PortfolioHome';
import ScrollToTop from './components/ScrollToTop';
import PageTracker from './components/PageTracker';
import './App.css';

// Páginas secundarias: se cargan on-demand para no engordar el bundle de la
// home (crítico en mobile, donde el parse de JS es lo más caro).
const AllProjects = lazy(() => import('./pages/AllProjects'));
const Servicios = lazy(() => import('./pages/Servicios'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
// El admin/dashboard (login, publisher de Instagram, chat) va en su propio chunk:
// ningún visitante público necesita descargar ese código.
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Router>
      {/* Resetea el scroll al top en cada navegación entre páginas */}
      <ScrollToTop />
      {/* Tracking anónimo de visitas (solo rutas públicas) */}
      <PageTracker />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<PortfolioHome />} />
          <Route path="/proyectos" element={<AllProjects />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          {/* /projects (EN) redirige a la URL canónica /proyectos para evitar contenido duplicado */}
          <Route path="/projects" element={<Navigate to="/proyectos" replace />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
