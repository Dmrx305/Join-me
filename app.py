import os
from datetime import timedelta
from werkzeug.utils import secure_filename
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
app.config['UPLOAD_FOLDER']= 'uploads' #Bilder Speicherordner
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

#----------------Models---------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(70), nullable=False)
    profile = db.relationship('Profile', backref='user', uselist=False)

    profile = db.relationship('Profile', back_populates='user', uselist=False)

#Many to Many Tabelle Profile <-> Interests
profile_interests = db.Table(
    'profile_interests',
    db.Column('profile_id', db.Integer, db.ForeignKey('profiles.id'), primary_key=True),
    db.Column('interest_id', db.Integer, db.ForeignKey('interests.id'), primary_key=True)
)


class Profile(db.Model):
    __tablename__= 'profiles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    city = db.Column(db.String(50), nullable=False)
    social_type = db.Column(db.String(20), nullable=False)
    photo = db.Column(db.String(200)) #Fotopfad

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship("User", back_populates="profile")
    interests = db.relationship('Interest', secondary=profile_interests,lazy='joined',backref=db.backref('profiles',lazy='dynamic'))


class Interest(db.Model):
    __tablename__= 'interests'
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
   

@app.before_request
def create_interests():
    db.create_all()
    if Interest.query.count() == 0:
        db.session.add_all([
            Interest(name="Hiking"),
            Interest(name="Squash"),
            Interest(name="Bouldern"),
            Interest(name="Swimming"),
            Interest(name="Cinema"),
            Interest(name="Bar hopping"),
            Interest(name="Sight seeing"),
            Interest(name="Fitness"),
            Interest(name="Ride a bike"),
            Interest(name="Barbecue"),    
        ])
        db.session.commit()

#-----------API--------------------------------------------------------------------
@app.route('/api/profile', methods=['POST'])
@jwt_required()
def create_or_update_profile():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    name = request.form.get('name')
    age = int(request.form.get('age')) if request.form.get('age') else None
    city = request.form.get('city')
    social_type = request.form.get('social_type') 
    photo = request.files.get('photo')
    interest_ids = request.form.getlist('interest_ids')

    interests_objs =[]
    if interest_ids:
        interests_objs = Interest.query.filter(Interest.id.in_(interest_ids)).all()



    photo_filename = None
    if photo:
        filename = secure_filename(photo.filename)
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        photo.save(photo_path)
        photo_filename = filename

    if user.profile:
        #profil updaten
        user.profile.name = name
        user.profile.age = age
        user.profile.city = city
        user.profile.social_type = social_type
        if photo_filename:
            user.profile.photo = photo_filename
        if interests_objs:
            user.profile.interests = interests_objs
    
    else:
        #neues profil anlegen
        profile = Profile(
            name=name,
            age=age,
            city=city,
            social_type=social_type,
            photo=photo_filename,
            user=user,
            )
        if interests_objs:
            profile.interests = interests_objs
        db.session.add(profile)

    db.session.commit()
    return jsonify({"message": "Profile saved!"}), 200

#-----------------Profil aufrufen-------------------------------------------------------
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()
    if not user.profile:
        return jsonify({"Error":"profile does not exist"}), 404
    
    return jsonify({
        'name' : user.profile.name,
        'age' : user.profile.age,
        'city' : user.profile.city,
        'social_type' : user.profile.social_type,
        'photo' : f"/uploads/{user.profile.photo}",
        "interests" : [{'id':i.id, 'name':i.name} for i in user.profile.interests]
    }),200

#----------Route zum abrufen der Bilder---------------------------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return app.send_from_directory(app.config['UPLOAD_FOLDER'], filename)

#------------Registrieren---------------------------------------
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

#------------Einloggen------------------------------------------------
@app.route('/api/login',methods =['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.username)
        return jsonify({'access_token': access_token}),200
    return jsonify({'error':'Invalid login'}),401


#----------------Profil löschen-----------------------------------------
@app.route('/api/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    if not user or not user.profile:
        return jsonify({'error': 'Profile not found!'}), 404

    # Falls ein Foto existiert → Datei löschen
    if user.profile.photo:
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], user.profile.photo)
        if os.path.exists(photo_path):
            os.remove(photo_path)

    # Profil aus der DB löschen
    db.session.delete(user.profile)
    db.session.commit()

    return jsonify({'message': 'Profile deleted'}), 200


@app.route('/api/interests', methods=['GET'])
def get_interests():
    interests = Interest.query.all()
    return jsonify([{"id": interests.id, "name": interests.name} for i in interests])


if __name__ == '__main__':
    app.run(debug=True)