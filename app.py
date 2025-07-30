from flask import Flask, render_template, request,redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, logout_user, current_user, LoginManager, login_required
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import input_required, length, ValidationError
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token,jwt_required, get_jwt_identity

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SECRET_KEY']= 'your_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(70), nullable=False)

@app.before_request
def create_tables():
    db.create_all()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error':'Username already exists'}), 400
    
    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'],password=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message':'Registration successfully!'}), 201


@app.route('/api/login',methods =['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.username)
        return jsonify({'access_token': access_token}),200
    return jsonify({'error':'Invalid login'}),401


@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'message': f'Hallo, {current_user}!This is save.'})


if __name__ == '__main__':
    app.run(debug=True)