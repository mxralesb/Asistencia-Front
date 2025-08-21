import React from 'react';

const AlertModal = ({ open, title = 'Aviso', message, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
        display: 'grid', placeItems: 'center', zIndex: 1000
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(520px, 92vw)',
          background: '#fff',
          borderRadius: 12,
          padding: '18px 18px 16px',
          boxShadow: '0 10px 30px rgba(0,0,0,.25)',
          color: '#4b347d',
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          border: '1px solid #eadff7'
        }}
        role="dialog" aria-modal="true" aria-labelledby="alert-title"
      >
        <h3 id="alert-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#5b3b8a' }}>
          {title}
        </h3>

        <p style={{ margin: '10px 0 16px', lineHeight: 1.45 }}>
          {message || 'Ocurrió un problema.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            className="btn"
            onClick={onClose}
            autoFocus
            style={{
              background: '#7c6adf', color: 'white', border: 'none',
              borderRadius: 10, padding: '8px 12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
