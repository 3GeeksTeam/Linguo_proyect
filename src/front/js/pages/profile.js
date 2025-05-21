import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";


export const Perfil = () => {
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    sur_name: "",
    username: "",
    password: "",
    mobile_number: "",
    post_code: "",
    state: "",
    email: "",
    password: "",
    country: "",
    region_state: "",
    initials: "",
  })
    const token = localStorage.getItem("token")
    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
        } get_profile();
    }, [token, navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    update_profile();
    actions.updateUser(user); //actualiza el estado global y todos los componentes que comparten ese estado se actualizan automaticamente
    navigate("/")
  }

  const getInitials = (name, sur_name) => {
    // Si los campos no están vacíos, usamos las iniciales
    const nameInitial = name ? name[0]?.toUpperCase() : "";

    const surNameInitial = sur_name ? sur_name[0]?.toUpperCase() : "";

    // Retornamos las iniciales concatenadas 
    return nameInitial + surNameInitial;
  };

  // Función para obtener las iniciales deforma dinámica
  useEffect(() => {
    const initials = getInitials(user.name, user.sur_name);
    setUser(prevUser => ({
      ...prevUser,
      initials,
    }));
  }, [user.name, user.sur_name]);


  //GET
  const get_profile = async () => {

    const myHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    try {
      const response = await fetch(`${process.env.BACKEND_URL}api/perfil`, requestOptions);

      if (!response.ok) {
        throw new Error('Error al obtener el perfil');
      }

      const result = await response.json();
      const initials = getInitials(result.name, result.sur_name);

      setUser({ ...user, ...result, initials });
    } catch (error) {
      console.error("Error:", error);
    }
  };


  // PUT
  const update_profile = async () => {
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,  // Agregamos el token en el header de autorización
    };

    const raw = JSON.stringify(user);  // Enviar el objeto de perfil directamente

    const requestOptions = {
      method: "PUT",
      headers: headers,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(`${process.env.BACKEND_URL}api/perfil`, requestOptions);

      if (!response.ok) {
        const result = await response.json();
        console.error("Detalles del error:", result);  // Ver detalles del error
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
    } catch (error) {
      console.error("Error:", error);  // Manejo de errores
    }
  };

  return (
    <div className="bodyuser container rounded mt-5 mb-5">
      <div className="arrows col-6" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left  arrow-icon"></i></div>
      <div className="row input-group">
        <div className="col-md-4 border-right">
          <div className="d-flex flex-column align-items-center text-center p-3 py-1">
            <div className="rounded-circle" style={{ width: "300px", height: "300px" }}>
              {user.initials}
            </div>
            <span className="font-weight-bold text-light">{user.name} {user.sur_name}</span>
            <span className="text-light-50">{user.email}</span>
          </div>
        </div>
        <div className="col-md-8 border-right">
          <div className=" text-light">
            <div className="d-flex justify-content-center align-items-center mb-4">
              <h1 className="profile text-center">Mi Perfil</h1>
            </div>
            <div className="row mt-4">
              <div className="col-md-6">
                <label className="labels">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={user.name}
                  name="name"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="labels">Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apellido"
                  value={user.sur_name}
                  name="sur_name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-12">
                <label className="labels">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingresa tu nombre de Usuario"
                  value={user.username}
                  name="username"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12">
                <label className="labels">N° de contacto</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="teléfono"
                  value={user.mobile_number}
                  name="mobile_number"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12">
                <label className="labels">Domicilio</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="domicilio"
                  value={user.state}
                  name="state"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12">
                <label className="labels">Código Postal</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="código postal"
                  value={user.post_code}
                  name="post_code"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12">
                <label className="labels">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="email"
                  value={user.email}
                  name="email"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12">
                <label className="labels">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  value={user.password}
                  name="password"
                  onChange={handleChange}
                />
                <small className="text-warning mt-1 d-block">
                  <i className="fa-solid fa-exclamation-circle"></i> La contraseña será actualizada al guardar los cambios.
                </small>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label className="labels">País</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="país"
                  value={user.country}
                  name="country"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="labels">Provincia</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="provincia"
                  value={user.region_state}
                  name="region_state"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6 mt-5 text-center">
              <button
                className="btn btn-danger profile-button"
                type="button"
                onClick={handleSave} // Llamada a la función para guardar los datos
              >
                Guardar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;