from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import app

db = SQLAlchemy(app)














"""class User_profile(db.Model):
    __tablename__ = 'user_profiles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    region = db.Column(db.String(50), nullable=False)
    interests = db.Column(db.String(200), nullable=False)
    special_interest = db.Column(db.String(200), nullable=False)

    user = db.relationship('User', backref=db.backref('profile', uselist=False))"""


