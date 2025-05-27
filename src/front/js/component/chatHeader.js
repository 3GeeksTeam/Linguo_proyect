import React from 'react';

const ChatHeader = () => {
  return (
    <div className="d-flex align-items-center p-2 border-bottom">
      <img
        src="https://via.placeholder.com/40"
        alt="avatar"
        className="rounded-circle me-2"
      />
      <div>
        <div className="fw-bold">Contacto</div>
        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
          En línea
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
