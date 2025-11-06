from dotenv import load_dotenv
import os
from datetime import datetime
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
from imagekitio import ImageKit
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
import base64


load_dotenv()

app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
    seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
)
app.config['JWT_TOKEN_LOCATION'] = [os.getenv('cookies','headers')]
app.config['JWT_COOKIE_SECURE'] = os.getenv('JWT_COOKIE_SECURE', 'False').lower() == 'true'
app.config['JWT_COOKIE_CSRF_PROTECT'] = os.getenv('JWT_COOKIE_CSRF_PROTECT', 'False').lower() == 'true'
app.config['JWT_ACCESS_COOKIE_NAME'] = os.getenv('JWT_ACCESS_COOKIE_NAME', 'access_token_cookie')
app.config['JWT_REFRESH_COOKIE_NAME'] = os.getenv('JWT_REFRESH_COOKIE_NAME', 'refresh_token_cookie')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')

imagekit = ImageKit(
    private_key=os.getenv('IMAGEKIT_PRIVATE_KEY'),
    public_key=os.getenv('IMAGEKIT_PUBLIC_KEY'),
    url_endpoint=os.getenv('IMAGEKIT_URL_ENDPOINT')
)

db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "https://join-me-gamma.vercel.app",
    ],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"]
)

# @app.before_request
# def create_tables():
#     db.create_all()

# def create_interests():
#     db.create_all()
#     if Interest.query.count() == 0:
#         db.session.add_all([
#             Interest(name="Hiking"),
#             Interest(name="Squash"),
#             Interest(name="Bouldern"),
#             Interest(name="Swimming"),
#             Interest(name="Cinema"),
#             Interest(name="Bar hopping"),
#             Interest(name="Sight seeing"),
#             Interest(name="Fitness"),
#             Interest(name="Ride a bike"),
#             Interest(name="Barbecue"),    
#         ])
#         db.session.commit()

#------------Registrieren---------------------------------------
with app.app_context():
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


#------------Einloggen------------------------------------------------

@app.route('/api/login',methods =['POST'])
def login():
    data = request.get_json()
    print(data)
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
    interest_ids = request.form.getlist('interest_ids')

    interests_objs =[]
    if interest_ids:
        interests_objs = Interest.query.filter(Interest.id.in_(interest_ids)).all()


    if user.profile:
        #profil updaten
        user.profile.name = name
        user.profile.age = age
        user.profile.city = city
        user.profile.social_type = social_type
        if interests_objs:
            user.profile.interests = interests_objs
    
    else:
        #neues profil anlegen
        profile = Profile(
            name=name,
            age=age,
            city=city,
            social_type=social_type,
            user=user,
            )
        if interests_objs:
            profile.interests = interests_objs
        db.session.add(profile)

    db.session.commit()
    db.session.refresh(user) 
    return jsonify({
        "message": "Profile saved!",
        "redirect": "/show_my_profile",}), 200

#-----------------Passende User anzeigen-------------------------------------------------------
@app.route('/api/show_matching_users', methods=['GET'])
@jwt_required()
def matching_users():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    if not user or not user.profile:
        return jsonify({"error": "User has no profile yet"}), 404
    
    city = user.profile.city
    user_interest_ids = [i.id for i in user.profile.interests]

    if not city or not user_interest_ids:
        return jsonify({"error": "User profile incomplete (city or interests missing)"}), 400
    
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
                "photo":profile.photo if profile.photo else None,
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
        "photo": profile.photo,
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
        "photo":profile.photo if profile.photo else None,
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
                "photo": contact_user.profile.photo if contact_user.profile and contact_user.profile.photo else None
            }
        })
    return jsonify(results), 200

#---------Kontakt löschen----------------------------------------
@app.route('/api/delete_contact/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    contact = ContactRequest.query.filter(
        ((ContactRequest.sender_id == user.id) & (ContactRequest.receiver_id == contact_id)) |
        ((ContactRequest.receiver_id == user.id) & (ContactRequest.sender_id == contact_id)),
        ContactRequest.status == "accepted"
    ).first()

    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": "Contact deleted"}), 200

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
    date_str = data.get("date")

    if not activity_name or not date_str:
        return jsonify({"error": "Activity and date are required"}), 400

    date_obj = datetime.fromisoformat(date_str)
    formatted_date = date_obj.strftime("%d.%m.%Y %H:%M")
    
    invite = ActivityInvite(
        sender_id=sender.id,
        receiver_id=receiver_id,
        activity=activity_name,
        date=date_obj
    )
    db.session.add(invite)
    db.session.commit()
    return jsonify({"message": f"Do you want to Join me for {activity_name} at {formatted_date} ?"}), 201

#----------------Einladungen anzeigen------------------------------------------------------

@app.route('/api/show_received_activity_invites', methods=['GET'])
@jwt_required()
def get_invites():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    invites = ActivityInvite.query.filter_by(receiver_id=user.id, status="pending").all()

    results = []
    for inv in invites:
        formatted_date = inv.date.strftime("%d.%m.%Y %H:%M")

        results.append({
            "invite_id": inv.id,
            "from": inv.sender.username,
            "activity": inv.activity,
            "date": formatted_date,
            "preset_text": f"I'm going to {inv.activity} at {formatted_date}, want to join me?"
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
@app.route('/api/show_sent_activity_invites', methods=['GET'])
@jwt_required()
def get_sent_invites():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    invites = ActivityInvite.query.filter_by(sender_id=user.id).all()
    
    results = []
    for inv in invites:
        formatted_date = inv.date.strftime("%d.%m.%Y %H:%M")

        results.append({
            "to": inv.receiver.username,
            "activity": inv.activity,
            "date": formatted_date,
            "status": inv.status
        })

    return jsonify(results), 200

#----------------Activity History-----------------------------------------
@app.route('/api/show_accepted_activities', methods=['GET'])
@jwt_required()
def show_accepted_activities():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    invites = ActivityInvite.query.filter(
        ((ActivityInvite.sender_id == user.id) | (ActivityInvite.receiver_id == user.id)),
        ActivityInvite.status == "accepted"
    ).all()

    results = []
    for inv in invites:
        formatted_date = inv.date.strftime("%d.%m.%Y %H:%M")

        # Partner herausfinden
        if inv.sender_id == user.id:
            partner = User.query.get(inv.receiver_id)
            role = "host"
        else:
            partner = User.query.get(inv.sender_id)
            role = "guest"

        results.append({
            "activity": inv.activity,
            "date": formatted_date,
            "partner": partner.username,
            "role": role
        })

    return jsonify(results), 200

#----------Upload Photo Route----------------------------------------
@app.route("/api/upload_photo", methods=["POST"])
@jwt_required()
def upload_profile_photo():
    current_username = get_jwt_identity()
    current_user = User.query.filter_by(username=current_username).first()

    if not current_user or not current_user.profile:
        return jsonify({"error": "Profile not found"}), 404

    if "image" not in request.files:
        return jsonify({"error": "No image in request"}), 400

    file = request.files["image"]

    # ✅ Bytes lesen
    file_bytes = file.read()

    # ✅ Base64 konvertieren (GENAU DAS erwartet ImageKit als Fallback stabil)
    encoded_file = base64.b64encode(file_bytes).decode("utf-8")

    try:
        options = UploadFileRequestOptions(use_unique_file_name=True)

        upload = imagekit.upload_file(
            file="data:image/jpeg;base64," + encoded_file,  # ✅ Base64 Upload
            file_name=file.filename,
            options=options
        )

        photo_url = upload.url
        file_id = upload.file_id

        if not photo_url:
            return jsonify({"error": "No URL returned from ImageKit"}), 500

    except Exception as e:
        import traceback
        print("UPLOAD ERROR:", traceback.format_exc())
        return jsonify({"error": repr(e)}), 500

    current_user.profile.photo = photo_url
    db.session.commit()

    return jsonify({
        "success": True,
        "photo_url": photo_url,
        "file_id": file_id
    }), 200



#-----------Foto löschen----------------------------------------
@app.route("/api/delete_profile_photo", methods=["DELETE"])
@jwt_required()
def delete_profile_photo():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.photo:
        return jsonify({"error": "No photo to delete"}), 400

    # Datenbank aktualisieren
    user.profil.photo = None
    db.session.commit()

    return jsonify({"message": "Profile photo deleted"}), 200


#----------------Profil löschen-----------------------------------------
@app.route('/api/delete_user', methods=['DELETE'])
@jwt_required()
def delete_user():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    if not user:
        return jsonify({'error': 'User not found!'}), 404

    # Profil aus der DB löschen
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted'}), 200
#-------------------------------------------------------------------

@app.route('/api/interests', methods=['GET'])
def get_interests():
    interests = Interest.query.all()
    return jsonify([{"id": i.id, "name": i.name} for i in interests])


if __name__ == '__main__':
    app.run(debug=True)