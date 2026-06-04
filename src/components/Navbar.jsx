import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Navbar.css';

const Navbar = () => {
  const { cameras, criteria, addToast } = useContext(AppContext);

  const enforceLinearFlow = (e) => {
    e.preventDefault();
    addToast('Silakan ikuti alur sistem secara berurutan. Gunakan tombol "Selanjutnya" atau "Kembali" di dalam halaman.', 'warning');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Camera size={24} className="logo-icon" />
          <span className="logo-text">CamDecision</span>
        </div>
        <ul className="navbar-menu">
          <li><NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Beranda</NavLink></li>
          <li><NavLink to="/about" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Tentang SAW</NavLink></li>
          <li><NavLink to="/cameras" onClick={enforceLinearFlow} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Data Kamera</NavLink></li>
          <li><NavLink to="/criteria" onClick={enforceLinearFlow} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Data Kriteria</NavLink></li>
          <li><NavLink to="/calculator" onClick={enforceLinearFlow} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Kalkulator SAW</NavLink></li>
          <li><NavLink to="/results" onClick={enforceLinearFlow} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Hasil Ranking</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
