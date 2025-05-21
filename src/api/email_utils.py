from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
from flask import url_for, current_app

# Crea un serializador seguro que usaremos para generar y validar tokens.
def get_serializer(secret_key):
    return URLSafeTimedSerializer(secret_key)

# Genera un token y crea un enlace de verificación usando la función `url_for`
def generar_enlace_verificacion(email, serializer, salt='email-confirm-salt'):
    token = serializer.dumps(email, salt=salt) # Crea un token con el email y una "sal" (salt)
    verification_url = url_for('api.verificar_email', token=token, _external=True)

    return verification_url

# Crea y envía el correo de verificación con el enlace al usuario
def enviar_correo_verificacion(email, mail, serializer):
    token = serializer.dumps(email, salt='email-confirm-salt')# Genera el token
    base_url = current_app.config['BASE_URL']# Obtiene la URL base pública desde la config
    link_verificacion = f"{base_url}/api/verificar/{token}"# Construye el enlace manualmente con el token para verificar
    reenvio_link = f"{base_url}/api/reenviar-verificacion?email={email}"# Llama a la ruta que genera un nuevo email

    msg = Message(
        'Bienvenido a Linguo, la primera web de mensajería directa con traducción instantánea.',
        recipients=[email],
        html=f'''
            <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
            <a href="{link_verificacion}">{link_verificacion}</a><br><br> 
            <p>¿Tu enlace ha caducado?</p>
            <a href="{reenvio_link}">Haz clic aquí para solicitar uno nuevo</a>
            
        '''
    )
    
    mail.send(msg)

