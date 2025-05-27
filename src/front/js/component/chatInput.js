import React from 'react';

const ChatInput = () => {
  return (
    <div className="d-flex p-2 border-top">
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        className="form-control me-2"
      />
      <button className="btn btn-success">Enviar</button>
    </div>
  );
};

export default ChatInput;
