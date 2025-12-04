from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship


db = SQLAlchemy()

# -----------------------------------------------
# 1) INTEREST MODEL (must be first)
# -----------------------------------------------
class Interest(db.Model):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

    profiles = relationship(
        "UserProfile",
        secondary="userprofile_interests",
        back_populates="interests"
    )


# -----------------------------------------------
# 2) USER MODEL
# -----------------------------------------------
class User(db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False,cascade="all, delete-orphan")


# -----------------------------------------------
# 3) USER PROFILE (must be after Interest)
# -----------------------------------------------
class UserProfile(db.Model):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    city = Column(String, nullable=False)
    social_type = Column(String, nullable=False)
    photo = Column(String, nullable=True)
 
    interests = relationship(
        "Interest",
        secondary="userprofile_interests",
        back_populates="profiles"
    )

    special_interest_id = Column(Integer, ForeignKey('interests.id'))
    special_interest = relationship("Interest", foreign_keys=[special_interest_id], uselist=False)

    user = relationship("User", back_populates="profile")


class ContactRequest(db.Model):        
    __tablename__ = 'contact_requests'
    id = Column(Integer, primary_key=True, autoincrement=True)

    sender_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )        
    receiver_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )

    status = Column(String(20), nullable=False, default='pending')

    sender = relationship('User', foreign_keys=[sender_id], backref='sent_requests')
    receiver = relationship('User', foreign_keys=[receiver_id], backref='received_requests')        


class ActivityInvite(db.Model):
    __tablename__ = 'activity_invites'
    id = Column(Integer, primary_key=True, autoincrement=True)

    sender_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )        
    receiver_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )

    activity = Column(
        String(100), 
        nullable=False
    )
    date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default='pending')

    sender = relationship('User', foreign_keys=[sender_id], backref='sent_invites')
    receiver = relationship('User', foreign_keys=[receiver_id], backref='received_invites')
                    


# -----------------------------------------------
# 4) ASSOCIATION TABLE (must be last)
# -----------------------------------------------
userprofile_interests = Table(
    "userprofile_interests",
    db.Model.metadata,
    Column("profile_id", Integer, ForeignKey("user_profiles.id")),
    Column("interest_id", Integer, ForeignKey("interests.id")),
)