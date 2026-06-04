import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calculator, Trophy, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-badge">Sistem Cerdas v1.0</div>
          <h1 className="hero-title">
            Sistem Pendukung Keputusan <br />
            <span className="text-gradient">Pemilihan Kamera Terbaik</span>
          </h1>
          <p className="hero-subtitle">
            Membantu pengguna menentukan kamera terbaik dengan perhitungan akurat menggunakan metode Simple Additive Weighting (SAW).
          </p>
          <div className="hero-actions">
            <Button variant="primary" onClick={() => navigate('/cameras')} icon={<Calculator size={20} />}>
              Mulai Simulasi
            </Button>
            <Button variant="outline" onClick={() => navigate('/about')} icon={<ArrowRight size={20} />}>
              Pelajari Metode
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <Card className="feature-card" hoverable>
              <div className="feature-icon-wrapper blue">
                <Camera size={28} />
              </div>
              <h3>Kelola Data Kamera</h3>
              <p>Tambah, ubah, dan kelola database kamera beserta spesifikasi teknisnya dengan mudah dan cepat.</p>
            </Card>

            <Card className="feature-card" hoverable>
              <div className="feature-icon-wrapper purple">
                <Calculator size={28} />
              </div>
              <h3>Perhitungan SAW</h3>
              <p>Proses pembobotan dan normalisasi otomatis berdasarkan kriteria cost dan benefit untuk hasil objektif.</p>
            </Card>

            <Card className="feature-card" hoverable>
              <div className="feature-icon-wrapper cyan">
                <Trophy size={28} />
              </div>
              <h3>Ranking & Rekomendasi</h3>
              <p>Dapatkan rekomendasi kamera terbaik berdasarkan skor akhir tertinggi dengan visualisasi yang jelas.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
