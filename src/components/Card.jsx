import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hoverable = false }) => {
  const hoverClass = hoverable ? 'card-hoverable' : '';
  return (
    <div className={`card ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
