import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PortfolioHome from './pages/PortfolioHome';
import AllProjects from './pages/AllProjects';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortfolioHome />} />
        <Route path="/proyectos" element={<AllProjects />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
