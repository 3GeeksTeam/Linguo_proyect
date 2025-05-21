import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Register = () => {
  const [email, setEmail] = useState(""); // Guardamos el email
  const [password, setPassword] = useState(""); // Guardamos la contraseña
  const [confirmPassword, setConfirmPassword] = useState(""); // Guardamos la confirmación de contraseña
  const navigate = useNavigate();

  const sign_up = async () => {
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.", { autoClose: false });
      return;
    }

    try {
      const response = await fetch(`${process.env.BACKEND_URL}api/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error, { autoClose: false }); // Si la respuesta tiene "error", lo mostramos
      } else {
        toast.success(data.msg, { autoClose: false });
        navigate("/login");
      }
    } catch (error) {
      toast.info("Registro fallido. Intente nuevamente.", { autoClose: false }); // Si ocurre un error en la solicitud
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // para que no se recargue de la página
    sign_up();
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
              <h3 className="card-title1 text-center mb-4" style={{ fontFamily: 'fantasy' }}>Registrarse</h3>
              <form onSubmit={handleSubmit}>
                <div className="label mb-4">
                  <label htmlFor="inputEmail3" className="form-label">Email</label>
                  <input type="email"
                    className="form-control"
                    id="inputEmail3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="label mb-4">
                  <label htmlFor="inputPassword3" className="form-label">Contraseña</label>
                  <input type="password"
                    className="form-control"
                    id="inputPassword3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required />
                </div>
                <div className="label mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                  <input type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required />
                </div>
                <div className="label mb-4">
                  <label className="form-label" >Términos y Condiciones</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="acceptTerms"
                      required
                    />
                    <label className="form-check-label" htmlFor="acceptTerms">
                      Aceptar
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Registrarse
                </button>
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
                  Iniciar sesión con Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;