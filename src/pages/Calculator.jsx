import React, { useState, useContext, useMemo } from 'react';
import { Play, AlertTriangle, Loader2, Trophy, Grid, Percent, Sigma, Info, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { calculateSAW } from '../utils/sawCalculator';
import './Calculator.css';

const Calculator = () => {
  const navigate = useNavigate();
  const { cameras, filteredCameras, sensorFilter, criteria, getCriteriaTotalWeight, addToast } = useContext(AppContext);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mathModalData, setMathModalData] = useState(null);
  
  const totalWeight = getCriteriaTotalWeight();
  const isWeightValid = totalWeight === 100;

  // Automatically calculate SAW data when cameras or criteria change
  const calculatedData = useMemo(() => {
    if (filteredCameras.length === 0 || criteria.length === 0) return null;
    try {
      return calculateSAW(filteredCameras, criteria);
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [cameras, criteria]);

  const handleGoToResults = () => {
    if (!calculatedData) {
      addToast('Error: Tidak ada data untuk dihitung.', 'error');
      return;
    }

    setIsNavigating(true);

    setTimeout(() => {
      setIsNavigating(false);
      navigate('/results', { state: { sawResult: calculatedData } });
    }, 800);
  };

  const openMathModal = (cameraRow, crit, normValData) => {
    const min = calculatedData.criteriaMinMax[crit.id].min;
    const max = calculatedData.criteriaMinMax[crit.id].max;
    // Decision matrix has the original data mapped properly
    const decRow = calculatedData.decisionMatrix.find(d => d.id === cameraRow.id);
    const origVal = decRow ? decRow.values[crit.id] : 0;
    
    setMathModalData({
      cameraName: cameraRow.name,
      critName: crit.name,
      critType: crit.type,
      origVal,
      min,
      max,
      mathString: normValData.mathString,
      result: normValData.value
    });
  };

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
    <div className="calculator-page fade-in">
      <div className="container">
        <div className="page-header text-center">
          <h2>Kalkulator SAW</h2>
          <p>Proses perhitungan dibedah secara rinci untuk verifikasi metode SAW.</p>
        </div>

        {!isWeightValid && (
          <div className="calc-warning mt-4">
            <AlertTriangle size={20} />
            <span>Kalkulator dikunci karena total bobot kriteria saat ini {totalWeight}%. Harus tepat 100%.</span>
          </div>
        )}

        {filteredCameras.length === 0 && (
          <div className="calc-warning mt-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
            <span>Kalkulator dikunci karena tidak ada kamera dengan tipe sensor: <strong>{sensorFilter}</strong>. Silakan ubah filter atau tambah data di halaman Kamera.</span>
          </div>
        )}

        <div className="details-container">
          {/* Section 1: Matriks Keputusan */}
          <Card className="detail-card">
            <div className="detail-header">
              <div className="step-badge">Tahap 1</div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center' }}>
                  Matriks Keputusan (X)
                  <span className="info-tooltip" title="Matriks Keputusan mengubah data spesifikasi alternatif ke dalam format matriks angka sebagai landasan perhitungan metode SAW.">
                    <Info size={16} />
                  </span>
                </h3>
              </div>
            </div>
            
            {!calculatedData ? (
              <div className="placeholder-box">
                <div className="step-icon-wrapper"><Grid size={40} /></div>
              </div>
            ) : (
              <div className="table-wrapper fade-in">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Nama Alternatif</th>
                      {calculatedData.activeCriteria.map(c => <th key={c.id}>{c.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedData.decisionMatrix.map(row => (
                      <tr key={row.id}>
                        <td className="font-medium">{row.name}</td>
                        {calculatedData.activeCriteria.map(c => (
                          <td key={c.id}>
                            {formatValue(row.values[c.id], c.name)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Section 2: Matriks Normalisasi */}
          <Card className="detail-card">
            <div className="detail-header">
              <div className="step-badge">Tahap 2</div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center' }}>
                  Matriks Normalisasi (R)
                  <span className="info-tooltip" title="Matriks Normalisasi membandingkan setiap nilai dengan nilai ekstrim (min/max) di kriterianya untuk menyamakan skala (0-1). Benefit = Nilai / Max. Cost = Min / Nilai.">
                    <Info size={16} />
                  </span>
                </h3>
                <p className="text-secondary text-sm mt-1">💡 Klik pada sel angka untuk melihat cara hitungnya secara mendetail.</p>
              </div>
            </div>
            
            {!calculatedData ? (
              <div className="placeholder-box">
                <div className="step-icon-wrapper"><Percent size={40} /></div>
              </div>
            ) : (
              <div className="table-wrapper fade-in">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Nama Alternatif</th>
                      {calculatedData.activeCriteria.map(c => (
                        <th key={c.id}>
                          {c.name} 
                          <span className={`crit-badge ${c.type.toLowerCase() === 'cost' ? 'badge-cost' : 'badge-benefit'}`}>
                            {c.type}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedData.normalizedMatrix.map(row => (
                      <tr key={row.id}>
                        <td className="font-medium">{row.name}</td>
                        {calculatedData.activeCriteria.map(c => (
                          <td 
                            key={c.id} 
                            className="clickable-cell" 
                            onClick={() => openMathModal(row, c, row.values[c.id])}
                            title="Klik untuk lihat cara hitung"
                          >
                            <div className="math-process" style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}><Search size={12} style={{display: 'inline', marginRight: '4px'}}/> Lihat Rumus</div>
                            <div className="math-result">{row.values[c.id].value}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Section 3: Matriks Pembobotan */}
          <Card className="detail-card">
            <div className="detail-header">
              <div className="step-badge">Tahap 3</div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center' }}>
                  Matriks Pembobotan (W * R)
                  <span className="info-tooltip" title="Matriks Normalisasi dikalikan dengan bobot preferensi yang ditentukan pengguna untuk setiap kriteria.">
                    <Info size={16} />
                  </span>
                </h3>
              </div>
            </div>

            {!calculatedData ? (
              <div className="placeholder-box">
                <div className="step-icon-wrapper"><Sigma size={40} /></div>
              </div>
            ) : (
              <div className="table-wrapper fade-in">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Nama Alternatif</th>
                      {calculatedData.activeCriteria.map(c => <th key={c.id}>{c.name} ({c.weight}%)</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedData.results.map(row => (
                      <tr key={row.id}>
                        <td className="font-medium">{row.name}</td>
                        {calculatedData.activeCriteria.map(c => (
                          <td key={c.id}>
                            <div className="math-process">{row.weightedValues[c.id].mathString}</div>
                            <div className="math-result">= {row.weightedValues[c.id].value}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Section 4: Nilai Preferensi */}
          <Card className="detail-card" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="detail-header">
              <div className="step-badge" style={{ backgroundColor: '#10b981' }}>Tahap 4</div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center' }}>
                  Nilai Preferensi (V)
                  <span className="info-tooltip" title="Hasil akhir didapatkan dengan menjumlahkan seluruh hasil pembobotan pada masing-masing alternatif. Nilai tertinggi menjadi alternatif terbaik.">
                    <Info size={16} />
                  </span>
                </h3>
              </div>
            </div>

            {!calculatedData ? (
              <div className="placeholder-box">
                <div className="step-icon-wrapper"><Trophy size={40} /></div>
              </div>
            ) : (
              <div className="table-wrapper fade-in">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '200px' }}>Nama Alternatif</th>
                      <th>Penjumlahan (Sum)</th>
                      <th className="highlight-col" style={{ width: '150px' }}>Total Nilai (V)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedData.results.map(row => (
                      <tr key={row.id}>
                        <td className="font-medium">{row.name}</td>
                        <td>
                          <div className="math-process" style={{ fontSize: '1rem', fontFamily: "'Fira Code', monospace" }}>
                            {row.mathSumString}
                          </div>
                        </td>
                        <td className="font-bold highlight-col" style={{fontSize: '1.25rem'}}>
                          {row.totalScore.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {calculatedData && (
            <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingBottom: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              <Button 
                variant="outline" 
                onClick={() => navigate('/criteria')} 
              >
                🡨 Kembali
              </Button>
              <Button 
                variant={isWeightValid ? 'primary' : 'outline'} 
                icon={isNavigating ? <Loader2 size={20} className="spin-animation" /> : <Trophy size={18} />} 
                onClick={handleGoToResults} 
                className={!isWeightValid || isNavigating ? 'btn-disabled' : ''}
                disabled={!isWeightValid || isNavigating}
              >
                {isNavigating ? 'Menyiapkan Hasil...' : 'Lihat Hasil Ranking Pemenang'}
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Math Modal */}
      <Modal 
        isOpen={!!mathModalData} 
        onClose={() => setMathModalData(null)} 
        title="Detail Perhitungan Normalisasi"
        footer={
          <Button variant="primary" onClick={() => setMathModalData(null)}>Tutup Detail</Button>
        }
      >
        {mathModalData && (
          <div className="math-detail-modal">
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{mathModalData.cameraName}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Kriteria: <strong>{mathModalData.critName}</strong></p>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Tipe Kriteria</span>
              <span className={`detail-value ${mathModalData.critType.toLowerCase() === 'cost' ? 'text-danger' : 'text-success'}`}>
                {mathModalData.critType}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Nilai Alternatif Asli</span>
              <span className="detail-value">{formatValue(mathModalData.origVal, mathModalData.critName)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Nilai Terendah (Min)</span>
              <span className="detail-value">{formatValue(mathModalData.min, mathModalData.critName)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Nilai Tertinggi (Max)</span>
              <span className="detail-value">{formatValue(mathModalData.max, mathModalData.critName)}</span>
            </div>

            <div className="formula-box">
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'inherit' }}>Rumus Perhitungan:</div>
              {mathModalData.mathString}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Hasil Normalisasi:</span>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {mathModalData.result}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Calculator;
