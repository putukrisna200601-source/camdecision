import React, { useState, useContext, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, Camera as CameraIcon, Info } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import './Cameras.css';

import { useNavigate } from 'react-router-dom';

const Cameras = () => {
  const navigate = useNavigate();
  const { cameras, filteredCameras, sensorFilter, setSensorFilter, criteria, addCamera, updateCamera, deleteCamera, addToast } = useContext(AppContext);
  const [selectedCamera, setSelectedCamera] = useState(null);
  
  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNextConfirmOpen, setIsNextConfirmOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', sensorType: 'Full Frame', values: {} });

  const getInitialFormState = () => {
    const state = { name: '', description: '', sensorType: 'Full Frame', values: {} };
    criteria.forEach(crit => {
      state.values[crit.id] = '';
    });
    return state;
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleValueChange = (critId, value) => {
    setFormData(prev => ({
      ...prev,
      values: { ...prev.values, [critId]: value }
    }));
  };

  const openPreview = (cam) => {
    setSelectedCamera(cam);
    setIsPreviewOpen(true);
  };

  const openAdd = () => {
    setFormData(getInitialFormState());
    setIsAddOpen(true);
  };

  const openEdit = (cam) => {
    setSelectedCamera(cam);
    
    // Ensure all criteria exist in the edited camera's values
    const mergedValues = { ...cam.values };
    criteria.forEach(crit => {
      if (mergedValues[crit.id] === undefined) mergedValues[crit.id] = 0;
    });

    setFormData({ name: cam.name, description: cam.description, sensorType: cam.sensorType || 'Full Frame', values: mergedValues });
    setIsEditOpen(true);
  };

  const openDelete = (cam) => {
    setSelectedCamera(cam);
    setIsDeleteOpen(true);
  };

  const parseValues = (valuesObj) => {
    const parsed = {};
    for (const key in valuesObj) {
      parsed[key] = Number(valuesObj[key]) || 0;
    }
    return parsed;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addCamera({
      name: formData.name,
      description: formData.description,
      sensorType: formData.sensorType,
      values: parseValues(formData.values)
    });
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateCamera(selectedCamera.id, {
      name: formData.name,
      description: formData.description,
      sensorType: formData.sensorType,
      values: parseValues(formData.values)
    });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    deleteCamera(selectedCamera.id);
    setIsDeleteOpen(false);
  };

  const formatValue = (value, critName) => {
    if (!value) return 0;
    if (critName.toLowerCase().includes('harga')) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }
    if (critName.toLowerCase().includes('berat')) {
      return `${value} g`;
    }
    if (critName.toLowerCase().includes('video')) {
      if (value == 4320) return '8K (4320p)';
      if (value == 2160) return '4K (2160p)';
      if (value == 1440) return '2K (1440p)';
      if (value == 1080) return 'Full HD (1080p)';
      if (value == 720) return 'HD (720p)';
      return `${value}p`;
    }
    return value;
  };

  const handleNextStep = () => {
    setIsNextConfirmOpen(false);
    navigate('/criteria');
  };

  // Reusable Form Component Content
  const renderFormFields = () => (
    <>
      <div className="form-group-row">
        <div className="form-group">
          <label>Nama Alternatif (Kamera) *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label>Tipe Sensor *</label>
          <select name="sensorType" value={formData.sensorType} onChange={handleInputChange} className="form-input" required>
            <option value="Full Frame">Full Frame</option>
            <option value="APS-C">APS-C</option>
          </select>
        </div>
      </div>
      
      {/* Dynamically render fields based on active criteria */}
      <div className="criteria-inputs-section mt-4 mb-4" style={{ padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.03)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <h4 className="mb-2 text-sm text-secondary uppercase tracking-wider">Nilai Kriteria</h4>
        <div className="form-group-row" style={{ flexWrap: 'wrap' }}>
          {criteria.map((crit) => {
            const isPrice = crit.name.toLowerCase().includes('harga');
            const isVideo = crit.name.toLowerCase().includes('video');
            const rawValue = formData.values[crit.id] !== undefined ? formData.values[crit.id] : '';
            const displayValue = isPrice && rawValue !== '' 
              ? new Intl.NumberFormat('id-ID').format(rawValue) 
              : rawValue;

            return (
              <div className="form-group" key={crit.id} style={{ minWidth: 'calc(50% - 1rem)' }}>
                <label>{crit.name} ({crit.type}) *</label>
                {isVideo ? (
                  <select
                    value={rawValue}
                    onChange={(e) => handleValueChange(crit.id, e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="" disabled>Pilih Resolusi Video</option>
                    <option value="720">HD (720p)</option>
                    <option value="1080">Full HD (1080p)</option>
                    <option value="1440">2K (1440p)</option>
                    <option value="2160">4K (2160p)</option>
                    <option value="4320">8K (4320p)</option>
                  </select>
                ) : (
                  <input 
                    type={isPrice ? 'text' : 'number'}
                    value={displayValue}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (isPrice) {
                        // Remove all non-numeric characters (including dots) for raw value
                        val = val.replace(/\D/g, '');
                      }
                      handleValueChange(crit.id, val);
                    }} 
                    className="form-input" 
                    min={isPrice ? undefined : "0"}
                    step={isPrice ? undefined : "any"}
                    required 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label>Deskripsi Singkat *</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows="2" required></textarea>
      </div>
    </>
  );

  return (
    <div className="cameras-page fade-in">
      <div className="container">
        <div className="page-header">
          <div>
            <h2>Data Kamera</h2>
            <p>Kelola daftar kamera beserta nilai kriterianya yang akan disinkronkan otomatis.</p>
          </div>
          <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>Tambah Kamera</Button>
        </div>

        {cameras.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <CameraIcon size={48} />
            </div>
            <h3>Belum ada data kamera</h3>
            <p className="text-secondary">Mulai dengan menambahkan data kamera pertama Anda.</p>
            <Button variant="outline" onClick={openAdd} className="mt-4">Tambah Data Sekarang</Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant={sensorFilter === 'All' ? 'primary' : 'outline'} onClick={() => setSensorFilter('All')} style={{ padding: '0.5rem 1rem' }}>Semua Kamera</Button>
                <Button variant={sensorFilter === 'APS-C' ? 'primary' : 'outline'} onClick={() => setSensorFilter('APS-C')} style={{ padding: '0.5rem 1rem' }}>APS-C</Button>
                <Button variant={sensorFilter === 'Full Frame' ? 'primary' : 'outline'} onClick={() => setSensorFilter('Full Frame')} style={{ padding: '0.5rem 1rem' }}>Full Frame</Button>
              </div>
              <div className="text-secondary text-sm">
                Menampilkan {filteredCameras.length} kamera
              </div>
            </div>

            {filteredCameras.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>Tidak ada kamera yang cocok dengan filter sensor ini.</p>
              </div>
            ) : (
              <div className="cameras-grid">
                {filteredCameras.map((cam) => {
                  // Just pick the first 3 criteria to show on the card summary
                  const topCriteria = criteria.slice(0, 3);
                  return (
                    <Card key={cam.id} className="camera-card" hoverable>
                      <div className="camera-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3>{cam.name}</h3>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px', fontWeight: 'bold' }}>
                            {cam.sensorType || 'Full Frame'}
                          </span>
                        </div>
                        <div className="camera-specs mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {topCriteria.map(c => (
                            <span key={c.id} style={{ fontSize: '0.85rem' }}>
                              <strong>{c.name}:</strong> {formatValue(cam.values ? cam.values[c.id] : 0, c.name)}
                            </span>
                          ))}
                          {criteria.length > 3 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>+{criteria.length - 3} kriteria lainnya...</span>}
                        </div>
                      </div>
                      <div className="camera-actions mt-4">
                        <Button variant="info" icon={<Eye size={16} />} onClick={() => openPreview(cam)}>Preview</Button>
                        <Button variant="warning" icon={<Edit2 size={16} />} onClick={() => openEdit(cam)}>Edit</Button>
                        <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => openDelete(cam)}>Hapus</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="page-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <Button 
            variant="primary" 
            onClick={() => {
              if (filteredCameras.length === 0) {
                addToast('Akses ditolak: Data kamera kosong atau tidak ada yang sesuai filter. Harap isi data terlebih dahulu.', 'error');
              } else {
                setIsNextConfirmOpen(true);
              }
            }} 
          >
            Selanjutnya ➔
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        title="Tambah Data Kamera"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} type="button">Batal</Button>
            <Button variant="primary" type="submit" form="add-camera-form">Simpan Kamera</Button>
          </>
        }
      >
        <form id="add-camera-form" className="edit-form" onSubmit={handleAddSubmit}>
          {renderFormFields()}
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Edit Data Kamera"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} type="button">Batal</Button>
            <Button variant="primary" type="submit" form="edit-camera-form">Simpan Perubahan</Button>
          </>
        }
      >
        {selectedCamera && (
          <form id="edit-camera-form" className="edit-form" onSubmit={handleEditSubmit}>
            {renderFormFields()}
          </form>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title="Detail Kamera"
        footer={
          <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Tutup</Button>
        }
      >
        {selectedCamera && (
          <div className="preview-content">
            <h3 className="preview-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {selectedCamera.name}
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', borderRadius: '12px', fontWeight: 'bold' }}>
                {selectedCamera.sensorType || 'Full Frame'}
              </span>
            </h3>
            <p className="preview-desc mt-2 mb-4">{selectedCamera.description}</p>
            <div className="preview-specs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {criteria.map(crit => (
                <div className="spec-item" key={crit.id} style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: '8px' }}>
                  <span className="spec-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>{crit.name}</span>
                  <span className="spec-value" style={{ fontWeight: '600' }}>{formatValue(selectedCamera.values ? selectedCamera.values[crit.id] : 0, crit.name)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title="Hapus Data Kamera"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
          </>
        }
      >
        <div className="delete-confirm">
          <p>Apakah Anda yakin ingin menghapus data kamera <strong>{selectedCamera?.name}</strong>?</p>
          <p className="text-danger">Tindakan ini tidak dapat dibatalkan.</p>
        </div>
      </Modal>

      {/* Next Step Confirmation Modal */}
      <Modal 
        isOpen={isNextConfirmOpen} 
        onClose={() => setIsNextConfirmOpen(false)} 
        title="Konfirmasi Kelengkapan Data"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNextConfirmOpen(false)}>Cek Kembali</Button>
            <Button variant="primary" onClick={handleNextStep}>Ya, Lanjutkan</Button>
          </>
        }
      >
        <div className="next-confirm" style={{ padding: '0.5rem 0' }}>
          <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.3)', display: 'flex', gap: '1rem', alignItems: 'flex-start', textAlign: 'left' }}>
            <div style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }}>
              <Info size={24} />
            </div>
            <div>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Pemberitahuan Tahapan SAW</h4>
              <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '12px' }}>
                Pastikan seluruh spesifikasi kamera yang Anda masukkan sudah benar. Setelah ini, kita akan melangkah ke tahap krusial yaitu penentuan bobot preferensi.
              </p>
              <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', paddingLeft: '20px', margin: 0 }}>
                <li style={{ marginBottom: '4px' }}>Tahap selanjutnya: <strong>Kelola Data Kriteria</strong></li>
                <li>Anda tetap dapat kembali ke halaman ini kapan saja.</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cameras;
