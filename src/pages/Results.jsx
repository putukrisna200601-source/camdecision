import React, { useEffect } from 'react';
import { Trophy, ChevronLeft, BarChart2, FileText, Download } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { exportToPDF } from '../utils/exportPDF';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const sawResult = location.state?.sawResult;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!sawResult) {
    return (
      <div className="results-page fade-in">
        <div className="container">
          <div className="empty-state">
            <h3>Belum ada hasil perhitungan</h3>
            <p className="text-secondary">Silakan lakukan perhitungan SAW terlebih dahulu di Kalkulator.</p>
            <Button variant="primary" onClick={() => navigate('/calculator')} className="mt-4">Ke Kalkulator SAW</Button>
          </div>
        </div>
      </div>
    );
  }

  const { activeCriteria, decisionMatrix, normalizedMatrix, results } = sawResult;
  const topCamera = results[0];

  const formatValue = (v, critName) => {
    if (v === undefined || v === null) return 0;
    if (critName.toLowerCase().includes('harga')) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    }
    if (critName.toLowerCase().includes('berat')) {
      return `${v} g`;
    }
    if (critName.toLowerCase().includes('video')) {
      if (v == 4320) return '8K (4320p)';
      if (v == 2160) return '4K (2160p)';
      if (v == 1440) return '2K (1440p)';
      if (v == 1080) return 'Full HD (1080p)';
      if (v == 720) return 'HD (720p)';
      return `${v}p`;
    }
    return v;
  };

  return (
    <div className="results-page fade-in">
      <div className="container">
        <div className="page-header header-with-back">
          <Button variant="outline" icon={<ChevronLeft size={18} />} onClick={() => navigate('/calculator')}>Kembali</Button>
          <div>
            <h2>Hasil Ranking SAW</h2>
            <p>Rekomendasi terbaik berdasarkan data kamera dan preferensi kriteria Anda.</p>
          </div>
        </div>

        {/* Top Recommendation Card */}
        <div className="top-recommendation">
          <div className="badge-winner"><Trophy size={20} /> Rekomendasi Utama</div>
          <Card className="top-card">
            <div className="top-content">
              <div className="top-info">
                <h3 className="top-title">{topCamera.name}</h3>
                <div className="top-score-box">
                  <span className="score-label">Nilai Akhir SAW</span>
                  <span className="score-value">{topCamera.totalScore.toFixed(3)}</span>
                </div>
                <p className="top-desc">{topCamera.originalData.description}</p>
                <div className="top-specs">
                  {activeCriteria.slice(0, 4).map(crit => (
                    <div className="spec-item" key={crit.id}>
                      <span className="spec-label">{crit.name}</span>
                      <span className="spec-value">{formatValue(topCamera.originalData.values[crit.id], crit.name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Final Ranking with Bar Chart */}
        <div className="section-title mt-4">
          <BarChart2 size={24} />
          <h3>Peringkat Keseluruhan</h3>
        </div>
        
        <div className="ranking-list mb-4">
          {results.map((cam, idx) => {
            const maxScore = results[0].totalScore;
            const percentage = (cam.totalScore / maxScore) * 100;
            
            return (
              <Card key={cam.id} className="rank-item">
                <div className="rank-number">{cam.rank}</div>
                <div className="rank-details">
                  <h4>{cam.name}</h4>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <div className="rank-score">
                  {cam.totalScore.toFixed(3)}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Clean Matrices without the math string */}
        <div className="transparency-section mt-4 mb-4">
          <h3 style={{ marginBottom: '0.75rem' }}>Rekapitulasi Matriks (Angka Bersih)</h3>
          
          <div className="table-wrapper">
            <h4>1. Matriks Keputusan (X)</h4>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Alternatif</th>
                  {activeCriteria.map(c => <th key={c.id}>{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {decisionMatrix.map(row => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.name}</td>
                    {activeCriteria.map(c => (
                      <td key={c.id}>
                        {c.name.toLowerCase().includes('harga') 
                          ? new Intl.NumberFormat('id-ID').format(row.values[c.id]) 
                          : row.values[c.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrapper mt-4">
            <h4>2. Matriks Normalisasi (R)</h4>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Alternatif</th>
                  {activeCriteria.map(c => <th key={c.id}>{c.name} ({c.type})</th>)}
                </tr>
              </thead>
              <tbody>
                {normalizedMatrix.map(row => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.name}</td>
                    {activeCriteria.map(c => <td key={c.id}>{row.values[c.id]?.value !== undefined ? row.values[c.id].value : row.values[c.id]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrapper mt-4 mb-4">
            <h4>3. Nilai Preferensi / Pembobotan (V)</h4>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Alternatif</th>
                  {activeCriteria.map(c => <th key={c.id}>{c.name} ({c.weight}%)</th>)}
                  <th className="highlight-col">Total Nilai</th>
                </tr>
              </thead>
              <tbody>
                {results.map(row => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.name}</td>
                    {activeCriteria.map(c => <td key={c.id}>{row.weightedValues[c.id]?.value !== undefined ? row.weightedValues[c.id].value : row.weightedValues[c.id]}</td>)}
                    <td className="font-bold highlight-col">{row.totalScore.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '2rem', paddingBottom: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <Button variant="outline" onClick={() => navigate('/calculator')}>
            🡨 Kembali ke Kalkulator
          </Button>
          
          <Button variant="outline" icon={<FileText size={18} />} onClick={() => exportToPDF(sawResult)} style={{ backgroundColor: 'white', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
            Export PDF
          </Button>

          <Button variant="primary" onClick={() => navigate('/')}>
            Selesai & Ke Beranda ➔
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Results;
