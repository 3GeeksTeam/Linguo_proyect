import React from 'react';
import { useState } from 'react';
import imgLight from '../../img/claro.jpg';
import imgDark from '../../img/oscuro.jpg';



const ChatMessages = () => {
    //usetate para guardar los modos claro/oscuro
    const [darkMode, setDarkMode] = useState(false);

    //funcion para alternar el modo
    const ChangeMode = () => setDarkMode(!darkMode);


    const backgroundImage = darkMode ? imgDark : imgLight


    return (
        <div
            className="flex-grow-1 p-3 overflow-auto"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease',
            }}

        >
            {/* Botón para cambiar modo */}
            <button
                onClick={ChangeMode}
                className="btn btn-secondary mb-3"
            >
                Cambiar a {darkMode ? 'modo claro' : 'modo oscuro'}
            </button>

            <div className="mb-2 p-2 bg-white rounded shadow-sm" style={{ maxWidth: '60%' }}>
                Hola, ¿cómo estás?
            </div>
            <div
                className="mb-2 p-2 rounded shadow-sm ms-auto"
                style={{ maxWidth: '60%', backgroundColor: '#d4f8c6' }}
            >
                Todo bien, ¿y vos?
            </div>
        </div>
    );
};

export default ChatMessages;
