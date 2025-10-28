from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine
from datetime import datetime

db = SQLAlchemy()

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.close()

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

    profile = db.relationship(
        'Profile',
        back_populates='user',
        uselist=False,
        cascade="all, delete, delete-orphan",
        passive_deletes=True
    )

class Profile(db.Model):
    __tablename__= 'profiles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    city = db.Column(db.String(50), nullable=False)
    social_type = db.Column(db.String(20), nullable=False)
    photo = db.Column(db.String(200))

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        unique=True
    )
    user = db.relationship("User", back_populates="profile")

    # Wenn das Profil gelöscht wird, lösche auch die Einträge aus der Zwischentabelle
    interests = db.relationship(
        'Interest',
        secondary=profile_interests,
        lazy='joined',
        backref=db.backref('profiles', lazy='dynamic', cascade="all"),
        cascade="all"
    )

class Interest(db.Model):
    __tablename__= 'interests'
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)


class ContactRequest(db.Model):
    __tablename__ = 'contact_requests'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    sender_id = db.Column(
        db.Integer, 
        db.ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )
    receiver_id = db.Column(
        db.Integer, 
        db.ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )

    status = db.Column(db.String(20), nullable=False, default='pending')

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_requests')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_requests')



class ActivityInvite(db.Model):
    __tablename__ = 'activity_invites'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    sender_id = db.Column(
        db.Integer, 
        db.ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )        
    receiver_id = db.Column(
        db.Integer, 
        db.ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )

    activity = db.Column(
        db.String(100), 
        db.ForeignKey('interests.name'), 
        nullable=False
    )
    date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_invites')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_invites')






