import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', onClick, className = '', type = 'button', icon, ...props }) => {
  const baseClass = `btn btn-${variant}`;
  return (
    <button type={type} className={`${baseClass} ${className}`} onClick={onClick} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
