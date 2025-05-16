import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLogged, setIsLogged] = useState(!!store.token);
  const navigate = useNavigate();

  const logoutUser = () => {
    actions.logout();
    navigate("/login");
  };
  const delete_account = async () => {
    try {
      const token = store.token;
      if (!token) {
        setMessage("Sesión expirada. Por favor inicia sesión nuevamente.");
        actions.logout();
        navigate("/login");
        return;
      }
      const body =
        store.auth_provider === "google"
          ? {}
          : { password };
      console.log("Eliminando cuenta con auth_provider:", store.auth_provider);
      const response = await fetch(`${process.env.BACKEND_URL}api/delete_user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.msg || "Error al eliminar la cuenta.");
        return;
      }
      const modalElement = document.getElementById("exampleModal");
      const modalInstance = window.bootstrap?.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
      setPassword("");
      setMessage("");
      alert("¡Cuenta eliminada con éxito!");
      actions.logout();
      navigate("/register");
    } catch (error) {
      console.error("Error al hacer la solicitud:", error);
      setMessage("Hubo un problema con la solicitud. Intenta nuevamente.");
    }
  };
  useEffect(() => {
    setIsLogged(!!store.token);
  }, [store.token]);
  return (
    <>
      <nav className="row navbar py-0 sticky-top bg-light">
        <div className="col-12 container-fluid px-3 d-flex justify-content-between">
          <Link className="navbar-brand" to="/" style={{ textDecoration: "none" }}>
            Nombre de la web
          </Link>
          {isLogged ? (
            <div className="d-flex dropdown">
              <button
                className="user btn btn-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {store.user ? store.user.username : "Usuario"}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className="dropdown-item"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    onClick={() => {
                      setPassword("");
                      setMessage("");
                    }}
                  >
                    Borrar Cuenta
                  </button>
                </li>
                <li>
                  <div className="logout dropdown-item" onClick={logoutUser}>
                    Cerrar Sesión
                  </div>
                </li>
              </ul>
            </div>
          ) : (
            <div className="buttons">
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="register btn btn-outline-primary">Registrarse</button>
              </Link>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="login btn btn-primary mx-2">Iniciar Sesión</button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      {/* Modal de eliminación */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Confirmar eliminación
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro/a de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.</p>
              {localStorage.getItem("auth_provider") !== "google" && (
                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label">
                    Ingresa tu contraseña
                  </label>
                  <input
                    id="passwordInput"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {message && (
                <div className="alert alert-danger" role="alert">
                  {message}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => {
                  setPassword("");
                  setMessage("");
                }}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={delete_account}>
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};