from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine
from models import User
from wtforms import StringField
from wtforms.validators import DataRequired, Email

app = Flask(__name__)
app.secret_key = "supersecret"
engine = create_engine("postgresql://postgres:Worldof123@postgres:5432/Users")
SessionLocal = scoped_session(sessionmaker(bind=engine))

admin = Admin(app, name="Administrator", template_mode="bootstrap3")

class UserAdminView(ModelView):
    can_create = True
    can_delete = True
    can_edit = True
    can_view_details = True

    column_list = ('id', 'name', 'email', 'avatar')
    form_columns = ('name', 'email', 'avatar')

    form_extra_fields = {
        'name': StringField('User  Name', validators=[DataRequired()]),
        'email': StringField('Email Address', validators=[DataRequired(), Email()]),
        'avatar': StringField('Avatar URL'),
    }

admin.add_view(UserAdminView(User, SessionLocal))

@app.teardown_appcontext
def shutdown_session(exception=None):
    SessionLocal.remove()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)