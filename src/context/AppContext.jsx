import React, { createContext, useState, useEffect } from 'react';
import initialCameras from '../data/cameras.json';
import initialCriteria from '../data/criteria.json';

export const AppContext = createContext();

const DATA_VERSION = '3.0'; // Increment this to force a fresh reset for all users

export const AppProvider = ({ children }) => {
  // State for cameras
  const [cameras, setCameras] = useState(() => {
    const savedVersion = localStorage.getItem('saw_data_version');
    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem('saw_cameras');
      localStorage.removeItem('saw_criteria');
      localStorage.setItem('saw_data_version', DATA_VERSION);
      return initialCameras;
    }
    const saved = localStorage.getItem('saw_cameras');
    if (saved) {
      return JSON.parse(saved);
    }
    return initialCameras;
  });

  // State for criteria
  const [criteria, setCriteria] = useState(() => {
    const savedVersion = localStorage.getItem('saw_data_version');
    if (savedVersion !== DATA_VERSION) {
      return initialCriteria;
    }
    const saved = localStorage.getItem('saw_criteria');
    if (saved) {
      return JSON.parse(saved);
    }
    return initialCriteria;
  });

  // State for toasts
  const [toasts, setToasts] = useState([]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('saw_cameras', JSON.stringify(cameras));
  }, [cameras]);

  useEffect(() => {
    localStorage.setItem('saw_criteria', JSON.stringify(criteria));
  }, [criteria]);

  // Toast Function
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  // Camera CRUD
  const addCamera = (camera) => {
    const newCamera = { ...camera, id: Date.now() }; // Generate simple ID
    setCameras([...cameras, newCamera]);
    addToast('Berhasil Menambah Data Kamera');
  };

  const updateCamera = (id, updatedCamera) => {
    setCameras(cameras.map(c => c.id === id ? { ...c, ...updatedCamera } : c));
    addToast('Berhasil Mengubah Data Kamera');
  };

  const deleteCamera = (id) => {
    setCameras(cameras.filter(c => c.id !== id));
    addToast('Berhasil Menghapus Data Kamera');
  };

  // Criteria Helper to sequentially reindex C1, C2, C3...
  const reindexCriteria = (list) => {
    return list.map((c, index) => ({ ...c, id: `C${index + 1}` }));
  };

  // Criteria CRUD
  const addCriteria = (crit) => {
    const newId = `crit_${Date.now()}`;
    const newCriteria = { ...crit, id: newId };
    setCriteria(reindexCriteria([...criteria, newCriteria]));
    
    // Automatically add this new criteria with value 0 to all existing cameras
    setCameras(prevCameras => prevCameras.map(cam => ({
      ...cam,
      values: { ...cam.values, [newId]: 0 }
    })));
    
    addToast('Berhasil Menambah Data Kriteria');
  };

  const updateCriteria = (id, updatedCrit) => {
    const updatedList = criteria.map(c => c.id === id ? { ...c, ...updatedCrit } : c);
    setCriteria(reindexCriteria(updatedList));
    addToast('Berhasil Mengubah Data Kriteria');
  };

  const deleteCriteria = (id) => {
    const filtered = criteria.filter(c => c.id !== id);
    setCriteria(reindexCriteria(filtered));
    addToast('Berhasil Menghapus Data Kriteria');
  };

  const reorderCriteria = (startIndex, endIndex) => {
    const result = Array.from(criteria);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setCriteria(reindexCriteria(result));
  };

  // Helper
  const getCriteriaTotalWeight = () => {
    return criteria.reduce((sum, item) => sum + Number(item.weight), 0);
  };

  // Filter State
  const [sensorFilter, setSensorFilter] = useState('All');

  // Computed Properties
  const filteredCameras = cameras.filter(cam => {
    if (sensorFilter === 'All') return true;
    return cam.sensorType === sensorFilter;
  });

  return (
    <AppContext.Provider
      value={{
        cameras,
        filteredCameras,
        sensorFilter,
        setSensorFilter,
        addCamera,
        updateCamera,
        deleteCamera,
        criteria,
        addCriteria,
        updateCriteria,
        deleteCriteria,
        reorderCriteria,
        getCriteriaTotalWeight,
        toasts,
        addToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
