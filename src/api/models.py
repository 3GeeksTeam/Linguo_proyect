from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone


db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    encoded_password = db.Column(db.String(500), unique=False, nullable=True)
    auth_provider = db.Column(db.String(20), nullable=False, default="local")  # 'local' o 'google'
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    sur_name = db.Column(db.String(120), nullable=True)
    username = db.Column(db.String(120), unique=True, nullable=True)
    mobile_number = db.Column(db.String(120), unique=True, nullable=True)
    language = db.Column(db.String(10), default='en')
    is_verified = db.Column(db.Boolean(), default=False)  # Campo para verificar el correo electrónico
   
    def _repr_(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email, 
            "name" : self.name,
            "sur_name" : self.sur_name,
            "username" : self.username,
            "mobile_number": self.mobile_number,
            "language" : self.language,
           
        }
    
    def set_password(self, password):
        self.encoded_password = generate_password_hash(str(password))
    
    def check_password(self, password):
        return check_password_hash(self.encoded_password, password)