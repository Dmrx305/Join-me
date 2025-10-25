Project Join me!

# What is Join me?
Join me is a socializing web app for joining users with same interests in activities.
It's made for people who dont have company to share activities with and would sometimes like to have a buddy at their side!

# How does it work?
Users will create a profile with basic informations and additionaly a variety of interests via pre defined tags.
The algorythm calculates "matches" where only the activities will be take into account.
If a match is found, users will be notified and can look up the other users profile for "vibe checking".
If both users accept, the match is confirmed and Users can then notify each other when they are going on an activity.

# What is the App NOT for?
Join me is not meant for any kind of dating, chatting similar.
The focus is on Joining each others activities, with the goal of the users to just benefit and enjoy the company of each other!

Tech Stack
Bereich	Technologie
Frontend	React, Vite, Axios, TailwindCSS
Backend	Flask, SQLAlchemy, Flask-JWT-Extended
Auth	JWT Cookies
Storage	SQLite
Uploads	ImageKit.io



After Git Clone:

Backend:

cd backend
cp .env.example .env
set.env keys
pip install -r requirements.txt
flask run


Frontend:

cd frontend
cp .env.example .env
npm install
npm run dev

Frontend .env.example
VITE_API_BASE_URL=http://localhost:5000/api