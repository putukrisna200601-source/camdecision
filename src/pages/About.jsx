import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container fade-in">
      <div className="container">
        <header className="about-header">
          <h2>Metode Simple Additive Weighting (SAW)</h2>
          <p>Mengenal lebih dalam algoritma di balik sistem pendukung keputusan ini.</p>
        </header>

        <div className="about-grid">
          <Card className="about-card">
            <h3>Apa itu SAW?</h3>
            <p>
              Metode Simple Additive Weighting (SAW) sering juga dikenal istilah metode penjumlahan terbobot.
              Konsep dasar metode SAW adalah mencari penjumlahan terbobot dari rating kinerja pada setiap alternatif
              pada semua atribut (kriteria).
            </p>
          </Card>

          <Card className="about-card">
            <h3>Cara Kerja</h3>
            <p>
              Metode SAW membutuhkan proses normalisasi matriks keputusan (X) ke suatu skala yang dapat diperbandingkan
              dengan semua rating alternatif yang ada, sebelum akhirnya dikalikan dengan bobot kriteria.
            </p>
          </Card>
          
          <Card className="about-card">
            <h3>Keunggulan</h3>
            <ul className="about-list">
              <li>Mampu menentukan nilai bobot untuk setiap atribut.</li>
              <li>Proses penilaian lebih presisi dan terarah.</li>
              <li>Mudah diimplementasikan dan komputasinya cepat.</li>
            </ul>
          </Card>
        </div>

        <div className="about-flow">
          <h3>Diagram Alur Visual</h3>
          <div className="flow-diagram">
            <div className="flow-step">
              <div className="step-number">1</div>
              <h4>Data Alternatif & Kriteria</h4>
              <p>Menyiapkan data kandidat dan bobot masing-masing kriteria.</p>
            </div>
            <div className="flow-connector"></div>
            <div className="flow-step">
              <div className="step-number">2</div>
              <h4>Matriks Keputusan</h4>
              <p>Mengubah data menjadi bentuk matriks penilaian.</p>
            </div>
            <div className="flow-connector"></div>
            <div className="flow-step">
              <div className="step-number">3</div>
              <h4>Normalisasi</h4>
              <p>Menyamakan skala nilai berdasarkan tipe kriteria (Cost/Benefit).</p>
            </div>
            <div className="flow-connector"></div>
            <div className="flow-step">
              <div className="step-number">4</div>
              <h4>Perankingan</h4>
              <p>Mengalikan hasil normalisasi dengan bobot untuk skor akhir.</p>
            </div>
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <Button variant="outline" onClick={() => navigate('/')}>
            🡨 Beranda
          </Button>
          <Button variant="primary" onClick={() => navigate('/cameras')}>
            Mulai ➔
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
