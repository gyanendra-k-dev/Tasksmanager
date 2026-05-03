import React, { useEffect } from 'react';

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="flex-between mb-1">
          <h3 className="modal-title" style={{margin:0}}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{fontSize:18, padding:'4px 8px'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
