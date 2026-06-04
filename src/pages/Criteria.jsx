import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, AlertTriangle, List, GripVertical, Info } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import './Criteria.css';

const Criteria = () => {
  const navigate = useNavigate();
  const { criteria, addCriteria, updateCriteria, deleteCriteria, reorderCriteria, getCriteriaTotalWeight } = useContext(AppContext);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNextConfirmOpen, setIsNextConfirmOpen] = useState(false);

  const initialFormState = { name: '', weight: '', type: 'Benefit', description: '' };
  const [formData, setFormData] = useState(initialFormState);

  const totalWeight = getCriteriaTotalWeight();
  const isWeightValid = totalWeight === 100;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAdd = () => {
    setFormData(initialFormState);
    setIsAddOpen(true);
  };

  const openEdit = (crit) => {
    setSelectedCriteria(crit);
    setFormData({ ...crit });
    setIsEditOpen(true);
  };

  const openDelete = (crit) => {
    setSelectedCriteria(crit);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addCriteria({ ...formData, weight: Number(formData.weight) });
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateCriteria(selectedCriteria.id, { ...formData, weight: Number(formData.weight) });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    deleteCriteria(selectedCriteria.id);
    setIsDeleteOpen(false);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    // Needed for Firefox drag and drop
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target);
    }
  };

  const handleDragEnter = (e, targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    reorderCriteria(draggedIndex, targetIndex);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleNextStep = () => {
    setIsNextConfirmOpen(false);
    navigate('/calculator');
  };

  const renderFormFields = () => (
    <>
      <div className="form-group">
        <label>Nama Kriteria *</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
      </div>
      <div className="form-group-row">
        <div className="form-group">
          <label>Bobot (%) *</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="form-input" min="1" max="100" required />
        </div>
        <div className="form-group">
          <label>Tipe Kriteria *</label>
          <select name="type" value={formData.type} onChange={handleInputChange} className="form-input" required>
            <option value="Benefit">Benefit (Semakin besar semakin baik)</option>
            <option value="Cost">Cost (Semakin kecil semakin baik)</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Keterangan *</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows="3" required></textarea>
      </div>
    </>
  );

  return (
    <div className="criteria-page fade-in">
      <div className="container">
        <div className="page-header">
          <div>
            <h2>Data Kriteria</h2>
            <p>Kelola bobot dan tipe kriteria (Cost/Benefit) untuk perhitungan SAW.</p>
          </div>
          <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>Tambah Kriteria</Button>
        </div>

        {/* Validation Banner */}
        {!isWeightValid && (
          <div className="validation-banner">
            <AlertTriangle size={24} />
            <div className="banner-text">
              <strong>Peringatan! Total bobot kriteria saat ini adalah {totalWeight}%.</strong>
              <p>Total bobot harus tepat 100% agar perhitungan SAW dapat berjalan akurat. Kalkulator SAW akan dimatikan sampai masalah ini diperbaiki.</p>
            </div>
          </div>
        )}

        {criteria.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <List size={48} />
            </div>
            <h3>Belum ada kriteria</h3>
            <p className="text-secondary">Tambahkan kriteria penilaian untuk mulai menghitung SAW.</p>
            <Button variant="outline" onClick={openAdd} className="mt-4">Tambah Kriteria</Button>
          </div>
        ) : (
          <div className="table-container">
            <table className="criteria-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Kriteria</th>
                  <th>Keterangan</th>
                  <th>Bobot (%)</th>
                  <th>Tipe</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((crit, index) => (
                  <tr 
                    key={crit.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={draggedIndex === index ? 'dragging-row' : ''}
                    style={{ cursor: draggedIndex !== null ? 'grabbing' : 'grab' }}
                  >
                    <td>
                      <div className="code-cell">
                        <GripVertical size={16} className="grip-icon" />
                        <span className="font-medium">C{index + 1}</span>
                      </div>
                    </td>
                    <td className="font-semibold">{crit.name}</td>
                    <td className="text-secondary">{crit.description}</td>
                    <td>
                      <div className="weight-badge">{crit.weight}</div>
                    </td>
                    <td>
                      <span className={`type-badge ${crit.type.toLowerCase()}`}>
                        {crit.type}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => openEdit(crit)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => openDelete(crit)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <Button variant="outline" onClick={() => navigate('/cameras')}>
            🡨 Kembali
          </Button>
          <Button variant="primary" onClick={() => setIsNextConfirmOpen(true)} disabled={!isWeightValid || criteria.length === 0} className={(!isWeightValid || criteria.length === 0) ? 'btn-disabled' : ''}>
            Selanjutnya ➔
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        title="Tambah Kriteria"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" form="add-criteria-form">Simpan Kriteria</Button>
          </>
        }
      >
        <form id="add-criteria-form" className="edit-form" onSubmit={handleAddSubmit}>
          {renderFormFields()}
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Edit Kriteria"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" form="edit-criteria-form">Simpan Perubahan</Button>
          </>
        }
      >
        {selectedCriteria && (
          <form id="edit-criteria-form" className="edit-form" onSubmit={handleEditSubmit}>
            {renderFormFields()}
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title="Hapus Kriteria"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
          </>
        }
      >
        <div className="delete-confirm">
          <p>Apakah Anda yakin ingin menghapus kriteria <strong>{selectedCriteria?.name}</strong>?</p>
          <p className="text-danger">Tindakan ini mungkin mempengaruhi hasil perhitungan SAW secara keseluruhan.</p>
        </div>
      </Modal>

      {/* Next Step Confirmation Modal */}
      <Modal 
        isOpen={isNextConfirmOpen} 
        onClose={() => setIsNextConfirmOpen(false)} 
        title="Konfirmasi Bobot Kriteria"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNextConfirmOpen(false)}>Cek Kembali</Button>
            <Button variant="primary" onClick={handleNextStep}>Ya, Mulai Simulasi</Button>
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
                Apakah Anda yakin dengan pembagian persentase bobot ini? Sistem akan langsung menggunakan bobot yang telah Anda tetapkan untuk melakukan simulasi penilaian matriks.
              </p>
              <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', paddingLeft: '20px', margin: 0 }}>
                <li style={{ marginBottom: '4px' }}>Tahap selanjutnya: <strong>Kalkulator Penilaian SAW</strong></li>
                <li>Simulasi akan membedah proses perhitungan SAW secara transparan.</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Criteria;
