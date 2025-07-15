from flask import Flask, render_template, request
from models import db, User

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

db.init_app(app)


@app.route('/join_me', methods=['GET'])
def join_me():
    return render_template('join_me.html')

@app.route('/create_user', methods=['GET'])
def create_user_form():
    return render_template('create_user.html')


@app.route('/create_user', methods=['POST'])
def create_user():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return f'User {username} has been created!'
    





if __name__ == '__main__':
    app.run()