import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import Cloudinary from "./cloudinary";

export const Home = () => {
	const { store, actions } = useContext(Context);

	useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
	const auth_provider = params.get("auth_provider");
	
    if (token) {
      localStorage.setItem("access_token", token);
	  localStorage.setItem("auth_provider", auth_provider);
	  actions.login(token, auth_provider);
    }
  }, []);
  console.log(store.auth_provider)
  console.log(store.token);
  

	return (
		<div className="text-center mt-5">
			<h1>¡¡¡ Bienvenido a LINGUO !!!</h1>
		</div>
	);
};

