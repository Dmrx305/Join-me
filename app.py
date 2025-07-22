from flask import Flask, render_template, request,redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, logout_user, current_user, LoginManager, login_required
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import input_required, length, ValidationError
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY']= 'your_secret_key'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(70), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class RegisterForm(FlaskForm):
    username = StringField(validators=[input_required(),
               length(min=4, max=25)],render_kw={"placeholder": "Username"})
    
    password = PasswordField(validators=[input_required(),
               length(min=6, max=35)],render_kw={"placeholder": "Password"})
    
    submit = SubmitField('Register')

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(username=username.data).first()

        if existing_user_username:
            raise ValidationError('Username already exists. Please choose a different one.')
        

class LoginForm(FlaskForm):
    username = StringField(validators=[input_required(),
               length(min=4, max=25)],render_kw={"placeholder": "Username"})

    password = PasswordField(validators=[input_required(),
               length(min=6, max=35)],render_kw={"placeholder": "Password"})
    
    submit = SubmitField('Login')




@app.route('/home', methods=['GET'])
def home():
    return f'Welcome to the User Management System!'


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('home'))
    return render_template('login.html')
            

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/register', methods=['GET','POST'])
def register():
    form = RegisterForm()

    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username = form.username.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html')
    












"""with app.app_context():
    db.create_all()
    print("Datenbank und Tabelle wurden erstellt.")"""

if __name__ == '__main__':
    app.run(debug=True)