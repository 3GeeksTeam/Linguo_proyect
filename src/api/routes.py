from api.auth import is_valid_password
from flask import  request, jsonify, Blueprint, current_app, url_for, redirect, session, abort
from authlib.integrations.flask_client import OAuth 
from werkzeug.security import check_password_hash
from api.email_utils import enviar_correo_verificacion, get_serializer
from api.models import db, User
from flask_cors import CORS
from flask_jwt_extended import jwt_required
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from app import s, mail, google
api = Blueprint('api', __name__)

import os
import requests

# Allow CORS requests to this API
CORS(api)


@api.route('/registro', methods=['POST'])
def registro():
    processed_params = request.get_json()
    print("PARAMS", processed_params)

    if not is_valid_password(processed_params['password']):
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."}), 400

    existing_user = User.query.filter_by(email=processed_params['email']).first()

    serializer = get_serializer(current_app.config['SECRET_KEY'])

    if existing_user:
        if existing_user.auth_provider == 'google':
            # El usuario existe por Google, permitimos agregar contraseña y enviamos verificación
            existing_user.set_password(processed_params['password'])
            existing_user.auth_provider = 'both'
            existing_user.is_verified = False  # Requiere verificación ahora
            db.session.commit()

            try:
                enviar_correo_verificacion(processed_params['email'], current_app.extensions['mail'], serializer)
                return jsonify({"msg": "Registro completado. Se ha enviado un correo de verificación a su dirección de correo electrónico."}), 200
            except Exception as e:
                current_app.logger.error(f"Error al enviar el correo de verificación a {processed_params['email']}: {e}")
                return jsonify({"error": "Hubo un error al enviar el correo de verificación"}), 500

        else:
            return jsonify({"error": "Este Email ya está registrado."}), 400

    # Crear el nuevo usuario (registro manual)
    new_user = User(
        email=processed_params['email'],
        is_active=True,
        is_verified=False,
        auth_provider='local'
    )
    new_user.set_password(processed_params['password'])

    db.session.add(new_user)
    db.session.commit()

    try:
        enviar_correo_verificacion(processed_params['email'], current_app.extensions['mail'], serializer)
        return jsonify({"msg": "Registro completado. Se ha enviado un correo de verificación a su dirección de correo electrónico."}), 201
    except Exception as e:
        current_app.logger.error(f"Error al enviar el correo de verificación a {processed_params['email']}: {e}")
        return jsonify({"error": "Hubo un error al enviar el correo de verificación."}), 500


@api.route('/verificar/<token>', methods= ['GET'])
def verificar_email(token):
    """
    Este endpoint recibe el token enviado por correo, lo valida y actualiza el campo is_verified del usuario.
    """
    try:
        email = s.loads(token, salt='email-confirm-salt', max_age=3600)  # El token expira en 1 hora
    except Exception as e:
        return redirect(os.getenv('FRONT_URL') + 'login?msg=expirado')

    # Buscar el usuario por email
    user = User.query.filter_by(email=email).first()
    print(f"Tipo de 'user' después de la consulta: {type(user)}")
    if user is None:
        return redirect(os.getenv('FRONT_URL') + 'login?msg=usuario_no_encontrado')

    if user.is_verified:
        return redirect(os.getenv('FRONT_URL') + 'login?msg=ya_verificado')

    # Actualizar el campo de verificación
    user.is_verified = True
    db.session.commit()

    # Redirige al frontend 
    return redirect(os.getenv('FRONT_URL') + 'login?msg=verificado')

    
@api.route('/reenviar-verificacion', methods=['GET'])
def reenviar_verificacion():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email es requerido'}), 400

    # Verifica si el usuario existe
    usuario = User.query.filter_by(email=email).first()
    
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if usuario.is_verified:
        return jsonify({'error': 'Este correo ya ha sido verificado.'}), 400

    # Generar y reenviar el correo
    try:
        serializer = get_serializer(current_app.config['SECRET_KEY'])
        enviar_correo_verificacion(email, mail, serializer)
        return jsonify({'msg': 'Se ha reenviado el correo de verificación'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/login', methods=['POST'])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    user = User.query.filter_by(email=email).one_or_none()

    if not user or not user.check_password(password):
        return jsonify({"error": "Correo o contraseña incorrectos."}), 401
    if not user.is_verified:
        return jsonify({"error": "Correo no verificado. Revisa tu email."}), 403
    
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "user_id": user.id,
        "auth_provider": user.auth_provider
    }), 200
    

@api.route('/perfil', methods=['GET'])
@jwt_required()
def get_current_user():
     # Obtener al usuario actual usando el JWT
    current_user = User.query.filter_by(id=get_jwt_identity()).first()
    
    if not current_user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify(current_user.serialize()), 200

@api.route('/perfil', methods=['POST'])
@jwt_required()
def create_user():
    # Obtener los datos del perfil del usuario desde el JSON de la solicitud
    processed_params = request.get_json()

    # Obtener el ID del usuario autenticado (deberías asociarlo al perfil)
    user_id = get_jwt_identity()  # Obtener el ID del usuario autenticado desde el token

    # Obtener los parámetros del perfil
    name = processed_params.get('name', None)
    sur_name = processed_params.get('sur_name', None)
    username = processed_params.get('username', None)
    mobile_number = processed_params.get('mobile_number', None)
    language = processed_params.get('language', None)
  
    # Verificar si el usuario ya tiene un perfil creado
    existing_user = User.query.filter_by(id=user_id).first()
    if not existing_user:
        return jsonify({"msg": "User not found"}), 404

    # Actualizar el perfil del usuario
    existing_user.name = name
    existing_user.sur_name = sur_name
    existing_user.username = username
    existing_user.mobile_number = mobile_number
    existing_user.language = language
    db.session.commit()  # Guardar los cambios en la base de datos
    return jsonify({"msg": "Profile created successfully"}), 201


@api.route('/perfil', methods=['PUT'])
@jwt_required()
def update_profile_user():
    current_user = User.query.filter_by(id=get_jwt_identity()).first()
    
    if current_user is None:
        return jsonify({"error": "User not found"}), 404  # Asegúrate de que el usuario existe
    
    processed_params = request.get_json()  # Obtener los nuevos datos
    
    # Actualizar los campos del usuario
    if 'name' in processed_params:
        current_user.name = processed_params['name']
    if 'sur_name' in processed_params:
        current_user.sur_name = processed_params['sur_name']
    if 'username' in processed_params:
        current_user.username = processed_params['username']
    if 'mobile_number' in processed_params:
        current_user.mobile_number = processed_params['mobile_number']
    if 'password' in processed_params and processed_params['password']:
        current_user.set_password(processed_params['password'])    
    if 'language' in processed_params:
        current_user.language = processed_params['language']
    
    db.session.commit()  # Guardar los cambios en la base de datos
    
    return jsonify({"msg": "Profile updated successfully"}), 200

    
#rutas googleauth
@api.route('/google/login') #redirigir al login de Google
def google_login():
    redirect_uri =os.getenv('BACKEND_URL') + 'api/google/callback'
    return google.authorize_redirect(redirect_uri, state='my_custom_state')

@api.route('/google/callback')
def google_callback():
    # Imprimir el valor de 'state' que Google manda de vuelta
    state_from_google = request.args.get("state")
    print("State recibido en callback:", state_from_google)

    try:
        token = google.authorize_access_token()
        print("Token recibido:", token)
    except Exception as e:
        current_app.logger.error(f"Error al autorizar token de Google: {e}")
        return jsonify({"error": "Autenticación fallida con Google"}), 400

    try:
        resp = google.get('userinfo')
        user_info = resp.json()
    except Exception as e:
        current_app.logger.error(f"Error al obtener info del usuario de Google: {e}")
        return jsonify({"error": "No se pudo obtener información del usuario"}), 400

    email = user_info.get('email')
    if not email:
        return jsonify({"error": "No se pudo obtener el email del usuario"}), 400

    # Buscar usuario
    user = User.query.filter_by(email=email).first()
    #print(f"Tipo de 'user' después de la consulta: {type(user)}")

    if user is None:
        # Usuario no existe, lo creamos con proveedor Google
        user = User(
            email=email,
            name=user_info.get('given_name'),
            sur_name=user_info.get('family_name'),
            is_active=True,
            is_verified=True,  # Confianza en Google
            auth_provider='google',
            encoded_password="GOOGLE_LOGIN"  # Valor falso para cumplir la restricción NOT NULL
        )
        db.session.add(user)
        db.session.commit()

    elif user.auth_provider == 'local':
        # Si el usuario ya existe con login local, lo actualizamos a 'both'
        user.auth_provider = 'both'
        db.session.commit()


    # Crear token JWT
    jwt_token = create_access_token(identity=user.id)  # Aquí estamos pasando solo el ID
     
    # URL de tu frontend (ajústala según sea necesario)
    frontend_url = os.getenv('FRONT_URL')

    # Redirige al frontend con el token JWT como parámetro
    redirect_url = f"{frontend_url}?access_token={jwt_token}&auth_provider={user.auth_provider}"
    return redirect(redirect_url)

    
@api.route('/logOut_test', methods=['POST'])
@jwt_required()
def logOut_test():
    print("Se llamó a /logout")  # Esto debería aparecer en la terminal
    id = get_jwt_identity()
    user = db.session.get(User, id)
   

    if user and user.access_token:
        token = user.access_token

        # Intentar revocar con Google
        revoke = requests.post(
            'https://oauth2.googleapis.com/revoke',
            params={'token': token},
            headers={'content-type': 'application/x-www-form-urlencoded'}
        )

        if revoke.status_code == 200:
            print("Token de Google revocado correctamente.")
        else:
            print("Error o token no era de Google:", revoke.text)

        # Borrar el token guardado
        user.access_token = None
        user.access_token_google = None
        db.session.add(user)
        db.session.commit()        
        print(f"Antes del commit, token es: {user.access_token}")

    # Limpia la sesión del navegador, si usás sesión
    session.pop('access_token', None)

    return jsonify({'message': 'Logout exitoso'}), 200

@api.route('/delete_user', methods=['DELETE'])
@jwt_required()
def delete_account():
    id = get_jwt_identity()
    user = db.session.get(User, id)
    if user is None:
        return jsonify({"msg": "Usuario no encontrado."}), 404
    # Si el usuario NO es de Google, debe ingresar la contraseña
    if user.auth_provider != "google":
        data = request.get_json() 
        password = data.get("password")
        if not password:
            return jsonify({"msg": "La contraseña es requerida."}), 400
        if not user.check_password(password):
            return jsonify({"msg": "Contraseña incorrecta."}), 401
    # Eliminar usuario
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Cuenta eliminada correctamente"}), 200






