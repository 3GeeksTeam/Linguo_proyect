import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { actions, store } = useContext(Context)

  const sign_in = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.BACKEND_URL}api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.msg || "Hubo un error con el inicio de sesión.");
        return;
      }

      const data = await response.json(); // Convertimos la respuesta a JSON
      localStorage.setItem("token", data.access_token);  // Guardamos el token en el localStorage
      localStorage.setItem("user_id", data.user_id)
      localStorage.setItem("auth_provider", data.auth_provider);
      actions.login(data.access_token, data.user_id, data.auth_provider);
    

      setMessage("¡Usuario logueado con éxito!");
      navigate("/");

    } catch (error) {
      console.error("Error al hacer la solicitud:", error); // Mostramos el error en la consola
      setMessage("Hubo un problema con la solicitud. Intenta nuevamente.");
    }
  };

  const handleGoogleLogin = () => {
    // Aquí puedes redirigir al endpoint de autenticación de Google
    window.location.href = `${process.env.BACKEND_URL}api/google/login`;
    
    
  };
  
  
  

  return (
    <div className="container py-3 mt-4">
      <div className="row">
        <div className="card-login col-md-6 col-sm-8">
          <div className="cardshadow card">
            <div className="card-body">
              <h3 className="card-title2 text-center mt-3 mb-5" style={{ fontFamily: 'fantasy' }}>Iniciar Sesión</h3>
              <form onSubmit={sign_in}>
                <div className="label mb-5">
                  <label htmlFor="inputEmail3" className="form-label">Email</label>
                  <input type="email"
                    className="form-control"
                    id="inputEmail3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="label mb-5">
                  <label htmlFor="inputPassword3" className="form-label">Contraseña</label>
                  <input type="password"
                    className="form-control"
                    id="inputPassword3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required />
                </div>
                <button type="submit" className="btn btn-primary mt-2 mb-5 w-100">
                  Inciar Sesión
                </button>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <h6 className="registrarse text-white text-center mb-3"> ¿No tienes una cuenta? Registrate</h6>
                </Link>
              </form>
              <div className="mb-4">
                <button
                  type="button"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2 border"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
                    alt="Google logo"
                    style={{ width: "20px", height: "20px" }}
                  />
                  Inicia sesión con Google
                </button>
              </div>
              <div className="text-center">
                {message && <p style={{ color: "black" }}>{message}</p>} {/* Mostrar el mensaje de respuesta */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;