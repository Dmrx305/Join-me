from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import app

db = SQLAlchemy(app)

class Interests(db.model):
    __tablename__='interests'
    id = db.Column(db.Integer,primary_key=True)
    interest = db.Column(db.String(50))










