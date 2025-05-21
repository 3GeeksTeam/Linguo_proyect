const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: localStorage.getItem("token") || null, //busca el token del  localStorage del navegador
			user: null, //el usuario comienza como null hasta que se cargue la información del usuario.
			auth_provider: localStorage.getItem("auth_provider") || null

		},
		actions: {
			// Acción para iniciar sesión
			login: (token, auth_provider) => {
				localStorage.setItem("token", token);
				localStorage.setItem("auth_provider", auth_provider);
				setStore({ token: token, auth_provider: auth_provider });
			},

			// Acción para cerrar sesión
			logout: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("auth_provider");
				setStore({ token: null, user: null, auth_provider: null });
			},

			// Acción para actualizar el usuario
			updateUser: (userData) => {
				const store = getStore();
				setStore({
					...store,
					user: { ...store.user, ...userData }
				});
			}
		},
	};
};

export default getState;
