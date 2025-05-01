from flask_login import LoginManager, UserMixin, login_user, logout_user
from werkzeug.security import check_password_hash

login_manager = LoginManager()

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.role = user_data['role']

@login_manager.user_loader
def load_user(user_id):
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(user_data)
    return None

def authenticate_user(username, password):
    user_data = mongo.db.users.find_one({'username': username})
    if user_data and check_password_hash(user_data['password_hash'], password):
        user = User(user_data)
        login_user(user)
        return True
    return False
