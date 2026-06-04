import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import './Toast.css';

const Toast = () => {
  const { toasts } = useContext(AppContext);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type} fade-in-up`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <XCircle size={20} />}
            {toast.type === 'warning' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
