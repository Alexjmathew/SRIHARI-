from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash

mongo = PyMongo()

def init_db(app):
    mongo.init_app(app)
    
    # Create initial admin users if they don't exist
    admin_users = [
        {'username': 'shrihari', 'email': 'shrihari@example.com', 'role': 'admin'},
        {'username': 'alex', 'email': 'alex@example.com', 'role': 'admin'},
        {'username': 'mathew', 'email': 'mathew@example.com', 'role': 'admin'}
    ]
    
    for admin in admin_users:
        if not mongo.db.users.find_one({'username': admin['username']}):
            admin['password_hash'] = generate_password_hash('default_admin_password')
            admin['created_at'] = datetime.utcnow()
            mongo.db.users.insert_one(admin)
