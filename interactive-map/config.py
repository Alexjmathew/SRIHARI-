import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    
    # MongoDB Configuration
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/geomapper')
    
    # Default admin credentials (change in production)
    DEFAULT_ADMINS = [
        {'username': 'shrihari', 'email': 'shrihari@example.com', 'password': 'admin123'},
        {'username': 'alex', 'email': 'alex@example.com', 'password': 'admin123'},
        {'username': 'mathew', 'email': 'mathew@example.com', 'password': 'admin123'}
    ]
    
    # Application settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size

    @staticmethod
    def init_app(app):
        # Create upload folder if it doesn't exist
        if not os.path.exists(Config.UPLOAD_FOLDER):
            os.makedirs(Config.UPLOAD_FOLDER)

class DevelopmentConfig(Config):
    DEBUG = True
    MONGO_URI = os.environ.get('DEV_MONGO_URI', 'mongodb://localhost:27017/geomapper_dev')

class TestingConfig(Config):
    TESTING = True
    MONGO_URI = os.environ.get('TEST_MONGO_URI', 'mongodb://localhost:27017/geomapper_test')

class ProductionConfig(Config):
    MONGO_URI = os.environ.get('PROD_MONGO_URI')

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
