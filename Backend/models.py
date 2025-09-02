from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

#Many to Many Tabelle Profile <-> Interests
profile_interests = db.Table(
    'profile_interests',
    db.Column('profile_id', db.Integer, db.ForeignKey('profiles.id'), primary_key=True),
    db.Column('interest_id', db.Integer, db.ForeignKey('interests.id'), primary_key=True)
)
#----------------Models---------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(70), nullable=False)
    profile = db.relationship('Profile', backref='user', uselist=False)

    profile = db.relationship('Profile', back_populates='user', uselist=False)


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


class ContactRequest(db.Model):
    __tablename_ = 'contact_requests'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    status = db.Column(db.String(20), nullable=False, default='pending') #pending, accepted, declined

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_requests')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_requests')


class ActivityInvite(db.Model):
    __tablename__ = 'activity_invites'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)        
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    activity = db.Column(db.String(100),db.ForeignKey('interests.name'), nullable=False)
    date = db.Column(db.String(50), nullable=False) # ISO Format zb 28-08-2025
    status = db.Column(db.String(20), nullable=False, default='pending') #pending, accepted, declined

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_invites')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_invites')





