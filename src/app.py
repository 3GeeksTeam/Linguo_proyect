"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from datetime import timedelta
from api.utils import APIException, generate_sitemap
from api.models import db
from api.email_utils import get_serializer
from api.admin import setup_admin
from api.commands import setup_commands
from api.auth import jwt

# Create the app instance
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configuración de entorno y base de datos
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Admin y comandos
setup_admin(app)
setup_commands(app)

# JWT
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
jwt.init_app(app)

# Flask-Mail

app.config['BASE_URL'] = 'https://crispy-space-fortnight-v6qg9jw55vxjcx4pw-3001.app.github.dev/'
app.config['MAIL_SERVER'] = 'smtp.sendgrid.net'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'apikey'
app.config['MAIL_PASSWORD'] = os.getenv('SENDGRID_API_KEY')
app.config['MAIL_DEFAULT_SENDER'] = 'moya91.dmm@gmail.com'

mail = Mail(app)
app.mail = mail

# Serializador
app.config['SECRET_KEY'] = os.urandom(24)
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])
app.s = s

# Importar rutas después de que todo esté configurado (para evitar imports circulares)
from api.routes import api
app.register_blueprint(api, url_prefix="/api")

# Manejo de errores
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Sitemap
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# Archivos estáticos
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# Ejecutar servidor
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
