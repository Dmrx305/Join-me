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
from flask_jwt_extended import JWTManager, create_access_token,jwt_required, get_jwt_identity, create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
from models import db, User, Profile, Interest, ContactRequest, ActivityInvite

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SECRET_KEY']= 'your_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['UPLOAD_FOLDER']= 'uploads' #Bilder Speicherordner
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # Nur über HTTPS, in Produktion auf True setzen
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # CSRF Schutz für Cookies, in Produktion auf True setzen
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token_cookie"
app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token_cookie"



db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True) #erlaubt Cookies

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
        refresh_token = create_refresh_token(identity=user.username)

        response = jsonify({
            'Message':"Login successfully!",
            'access_token': access_token,})
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response, 200
    
    return jsonify({'error':'Invalid login'}), 401

# ------------ Logout (löscht Cookies) ------------
@app.route('/api/logout', methods=['POST'])
def logout():
    resp = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(resp)
    return resp, 200


# ------------ Token Refresh ------------
@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)

    resp = jsonify({"msg": "Token refreshed"})
    set_access_cookies(resp, new_access_token)
    return resp, 200

    
#-----------Profil erstellen/ Updaten/----------------

@app.route('/api/create_or_update_profile', methods=['POST'])
@jwt_required()
def create_or_update_profile():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    name = request.form.get('name')
    age = request.form.get('age')
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

#-----------------Passende User anzeigen-------------------------------------------------------
@app.route('/api/show_matching_users', methods=['GET'])
@jwt_required()
def show_profile():
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

def home():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    if not user or not user.profile:
        return jsonify({"error": "User has no profile yet"}), 404
    
    #Stadt des aktuellen Users
    city = user.profile.city

    #Interessen des aktuellen Users
    user_interest_ids = [i.id for i in user.profile.interests]

    if not city or not user_interest_ids:
        return jsonify({"error": "User profile incomplete (city or interests missing)"}), 400
    
    #Matching Users aber nicht der selbe User
    matching_users = Profile.query.filter(
        Profile.city == city,
        Profile.user_id != user.id
    ).all()

    results = []
    for profile in matching_users:
        matching_interests_ids = [i.id for i in profile.interests]
        shared_interests = [i.name for i in profile.interests if i.id in user_interest_ids]

        if set(user_interest_ids) & set(matching_interests_ids): #min 1 Interesse gleich
            results.append({
                "user_id": profile.user.id, #id wird mitgeliefert
                "name": profile.name,
                "photo": f"/uploads/{profile.photo}" if profile.photo else None,
                "city": profile.city,
                "shared_interests": shared_interests
            })

    return jsonify(results), 200


#---------------Eigenes Profil anzeigen-----------------------------------------------------
@app.route('/api/show_my_profile', methods=['GET'])
@jwt_required()
def get_my_profile():
    current_username = get_jwt_identity()
    current_user = User.query.filter_by(username=current_username).first()

    if not current_user or not current_user.profile:
        return jsonify({"error": "Profile not found"}), 404
    
    profile = current_user.profile

    return jsonify({
        "name": profile.name,
        "age": profile.age,
        "city": profile.city,
        "social_type": profile.social_type,
        "photo": f"/uploads/{profile.photo}" if profile.photo else None,
        "interests": [{"id": i.id, "name": i.name} for i in profile.interests]
    }), 200


#------------------Profil durch ID anzeigen-----------------------------------------------------
@app.route('/api/show_other_profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_other_profile(user_id):
    current_username = get_jwt_identity()
    current_user = User.query.filter_by(username=current_username).first()

    other_user = User.query.get(user_id)
    if not current_user or not current_user.profile:
        return jsonify({"error": "Profile not found"}), 404
    
    profile = other_user.profile

    return jsonify({
        "name": profile.name,
        "age": profile.age,
        "city": profile.city,
        "social_type": profile.social_type,
        "photo": f"/uploads/{profile.photo}" if profile.photo else None,
        "interests": [{"id": i.id, "name": i.name} for i in profile.interests]
    }), 200

#------------------Anfrage senden------------------------------------------------------
@app.route('/api/send_contact_request/<int:receiver_id>', methods=['POST'])
@jwt_required()
def send_contact_request(receiver_id):
    current_username = get_jwt_identity()
    sender = User.query.filter_by(username=current_username).first()

    if sender.id == receiver_id:
        return jsonify({'error': 'You cannot send a request to yourself!'}), 400

    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'error': 'User not found'}), 404

    # Prüfen ob schon eine Anfrage existiert
    existing = ContactRequest.query.filter_by(sender_id=sender.id, receiver_id=receiver_id).first()
    if existing:
        return jsonify({"error": "Request already sent"}), 400

    # Anfrage erstellen
    contact_request = ContactRequest(sender_id=sender.id, receiver_id=receiver_id)
    db.session.add(contact_request)
    db.session.commit()

    return jsonify({"message": "Contact request sent"}), 201


#-------------------Anfragen anzeigen------------------------------------------------------
@app.route('/api/show_contact_requests', methods=['GET'])
@jwt_required()
def get_contact_requests():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    requests = ContactRequest.query.filter_by(receiver_id=user.id, status="pending").all()

    results = []
    for r in requests:
        results.append({
            "request_id": r.id,
            "sender_id": r.sender.id,
            "sender_name": r.sender.username,
        })

    return jsonify(results), 200

#-----------------Anfrage annehmen/ablehnen------------------------------------------------------
@app.route('/api/contact_request_respond/<int:request_id>', methods=['POST'])
@jwt_required()
def respond_contact_request(request_id):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    data = request.get_json()
    action = data.get("action")  # "accept" oder "decline"

    request_obj = ContactRequest.query.get(request_id)
    if not request_obj or request_obj.receiver_id != user.id:
        return jsonify({"error": "Request not found"}), 404

    if action == "accept":
        request_obj.status = "accepted"
    elif action == "decline":
        request_obj.status = "declined"
    else:
        return jsonify({"error": "Invalid action"}), 40

    db.session.commit()
    return jsonify({"message": f"Request {action}"}), 200

#------------------Kontakte anzeigen------------------------------------------------------
@app.route('/api/show_contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    contacts = ContactRequest.query.filter(
        ((ContactRequest.sender_id == user.id) | (ContactRequest.receiver_id == user.id)) &
        (ContactRequest.status == "accepted")
    ).all()

    results = []
    for c in contacts:
        contact_user = c.receiver if c.sender_id == user.id else c.sender
        results.append({
            "user_id": contact_user.id,
            "username": contact_user.username,
            "profile": {
                "name": contact_user.profile.name if contact_user.profile else None,
                "photo": f"/uploads/{contact_user.profile.photo}" if contact_user.profile and contact_user.profile.photo else None
            }
        })
    return jsonify(results), 200

#----------------Einladung zur Aktivität senden------------------------------------------------------
@app.route('/api/send_activity_invite/<int:receiver_id>', methods=['POST'])
@jwt_required()
def send_activity_invite(receiver_id):
    current_username = get_jwt_identity()
    sender = User.query.filter_by(username=current_username).first()

    if sender.id == receiver_id:
        return jsonify({'error': 'You cannot send an invite to yourself!'}), 400

    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'error': 'User not found'}), 404

    contact = ContactRequest.query.filter(
        ((ContactRequest.sender_id == sender.id) & (ContactRequest.receiver_id == receiver_id)) |
        ((ContactRequest.receiver_id == sender.id) & (ContactRequest.sender_id == receiver_id)),
        ContactRequest.status == "accepted"
    ).first()
    if not contact:
        return jsonify({"error": "You can only invite accepted contacts"}), 403

    data = request.get_json()
    activity_name = data.get("activity")
    date = data.get("date")

    if not activity_name or not date:
        return jsonify({"error": "Activity and date are required"}), 400
    
    invite = ActivityInvite(
        sender_id=sender.id,
        receiver_id=receiver_id,
        activity=activity_name,
        date=date
    )
    db.session.add(invite)
    db.session.commit()
    return jsonify({"message": f"Do you want to Join me for {activity_name} at {date} ?"}), 201

#----------------Einladungen anzeigen------------------------------------------------------

@app.route('/api/show_received_activity_invites', methods=['GET'])
@jwt_required()
def get_invites():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    invites = ActivityInvite.query.filter_by(receiver_id=user.id, status="pending").all()

    results = []
    for inv in invites:
        results.append({
            "invite_id": inv.id,
            "from": inv.sender.username,
            "activity": inv.activity,
            "date": inv.date,
            "preset_text": f"I'm going to {inv.activity} at {inv.date}, want to join me?"
        })
    return jsonify(results), 200

#----------------Einladung annehmen/ablehnen------------------------------------------------------

@app.route('/api/respond_to_activity_invites/<int:invite_id>', methods=['POST'])
@jwt_required()
def respond_invite(invite_id):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    invite = ActivityInvite.query.get(invite_id)
    if not invite or invite.receiver_id != user.id:
        return jsonify({"error": "Invite not found"}), 404

    data = request.get_json()
    action = data.get("action")

    if action == "accept":
        invite.status = "accepted"
    elif action == "decline":
        invite.status = "declined"
    else:
        return jsonify({"error": "Invalid action"}), 400

    db.session.commit()
    return jsonify({"message": f"Invite {action}"}), 200

#-----------------Alle beantworteten Einladungen der Aktivitäten anzeigen----------------------------------
@app.route('/api/show_sent__activity_invites', methods=['GET'])
@jwt_required()
def get_sent_invites():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    invites = ActivityInvite.query.filter_by(sender_id=user.id).all()

    results = []
    for inv in invites:
        results.append({
            "to": inv.receiver.username,
            "activity": inv.activity,
            "date": inv.date,
            "status": inv.status
        })

    return jsonify(results), 200


#----------Route zum abrufen der Bilder---------------------------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return app.send_from_directory(app.config['UPLOAD_FOLDER'], filename)


#----------------Profil löschen-----------------------------------------
@app.route('/api/delete_profile', methods=['DELETE'])
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
#-------------------------------------------------------------------

@app.route('/api/interests', methods=['GET'])
def get_interests():
    interests = Interest.query.all()
    return jsonify([{"id": i.id, "name": i.name} for i in interests])


if __name__ == '__main__':
    app.run(debug=True)